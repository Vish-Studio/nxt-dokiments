import { readFileSync } from "node:fs";
import path from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const OWNER = "owner-uid";
const BOB = "bob-uid";
const EVE = "eve-uid";
const HASH = "a".repeat(64);

const ownerDb = () =>
  env
    .authenticatedContext(OWNER, {
      email: "alice@example.com",
      email_verified: true,
    })
    .firestore();
/** Bob signed up with a password and never verified his address. */
const bobDb = (claims: Record<string, unknown> = {}) =>
  env
    .authenticatedContext(BOB, {
      email: "bob@example.com",
      email_verified: false,
      ...claims,
    })
    .firestore();
const eveDb = () =>
  env
    .authenticatedContext(EVE, {
      email: "eve@example.com",
      email_verified: true,
    })
    .firestore();
const anonymousDb = () => env.unauthenticatedContext().firestore();

const now = () => Timestamp.now();
const inDays = (days: number) =>
  Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000);

const sharedDoc = (overrides: Record<string, unknown> = {}) => ({
  createdAt: now(),
  locked: false,
  name: "NDA",
  ownerEmail: "alice@example.com",
  ownerId: OWNER,
  ownerName: "Alice",
  recipientEmails: ["bob@example.com"],
  recipientUids: [],
  recipients: [
    { email: "bob@example.com", invitedAt: now(), status: "pending" },
  ],
  signatures: {},
  sourceDocumentId: "doc_1",
  templateId: "nda",
  updatedAt: now(),
  values: { party: "Acme" },
  ...overrides,
});

const invite = (overrides: Record<string, unknown> = {}) => ({
  createdAt: now(),
  email: "bob@example.com",
  expiresAt: inDays(14),
  name: "NDA",
  ownerEmail: "alice@example.com",
  ownerId: OWNER,
  ownerName: "Alice",
  sharedDocumentId: "s1",
  values: { party: "Acme" },
  ...overrides,
});

const seed = async (
  shared: Record<string, unknown> = sharedDoc(),
  seededInvite: Record<string, unknown> | null = invite(),
) =>
  env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "sharedDocuments/s1"), shared);
    await setDoc(doc(db, "sharedDocuments/s2"), shared);
    if (seededInvite) {
      await setDoc(doc(db, `sharedInvites/${HASH}`), seededInvite);
    }
  });

const link = (db: ReturnType<typeof bobDb>, uid = BOB, hash = HASH) =>
  updateDoc(doc(db, "sharedDocuments/s1"), {
    acceptedInvite: hash,
    recipientUids: arrayUnion(uid),
  });

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-dokiments-rules-invites",
    firestore: {
      rules: readFileSync(path.join(process.cwd(), "firestore.rules"), "utf8"),
    },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe("sharedInvites — read", () => {
  it("lets anyone fetch an invite by its ID", async () => {
    await seed();
    await assertSucceeds(getDoc(doc(anonymousDb(), `sharedInvites/${HASH}`)));
  });

  it("does not let an anonymous visitor list invites", async () => {
    await seed();
    await assertFails(getDocs(collection(anonymousDb(), "sharedInvites")));
  });

  it("does not let a signed-in stranger list invites", async () => {
    await seed();
    await assertFails(getDocs(collection(eveDb(), "sharedInvites")));
  });

  it("lets the owner list their own invites", async () => {
    await seed();
    await assertSucceeds(
      getDocs(
        query(
          collection(ownerDb(), "sharedInvites"),
          where("ownerId", "==", OWNER),
        ),
      ),
    );
  });
});

describe("sharedInvites — write", () => {
  beforeEach(async () => {
    await seed(sharedDoc(), null);
  });

  it("lets the owner create an invite for their own shared document", async () => {
    await assertSucceeds(
      setDoc(doc(ownerDb(), `sharedInvites/${HASH}`), invite()),
    );
  });

  it("refuses an invite for someone else's shared document", async () => {
    await assertFails(
      setDoc(
        doc(eveDb(), `sharedInvites/${HASH}`),
        invite({ email: "eve@example.com", ownerId: EVE }),
      ),
    );
  });

  it("refuses an invite that already expired", async () => {
    await assertFails(
      setDoc(
        doc(ownerDb(), `sharedInvites/${HASH}`),
        invite({ expiresAt: inDays(-1) }),
      ),
    );
  });

  it("refuses an invite with an unexpected field", async () => {
    await assertFails(
      setDoc(doc(ownerDb(), `sharedInvites/${HASH}`), invite({ admin: true })),
    );
  });

  it("lets the owner refresh the snapshot but not retarget or extend it", async () => {
    await setDoc(doc(ownerDb(), `sharedInvites/${HASH}`), invite());

    await assertSucceeds(
      updateDoc(doc(ownerDb(), `sharedInvites/${HASH}`), { name: "NDA v2" }),
    );
    await assertFails(
      updateDoc(doc(ownerDb(), `sharedInvites/${HASH}`), {
        email: "eve@example.com",
      }),
    );
    await assertFails(
      updateDoc(doc(ownerDb(), `sharedInvites/${HASH}`), {
        expiresAt: inDays(90),
      }),
    );
  });

  it("lets only the owner delete an invite", async () => {
    await seed();
    await assertFails(deleteDoc(doc(eveDb(), `sharedInvites/${HASH}`)));
    await assertSucceeds(deleteDoc(doc(ownerDb(), `sharedInvites/${HASH}`)));
  });
});

describe("sharedDocuments — accepting an invite", () => {
  it("links an unverified recipient who holds a valid invite", async () => {
    await seed();
    await assertSucceeds(link(bobDb()));
    await assertSucceeds(getDoc(doc(bobDb(), "sharedDocuments/s1")));
  });

  it("refuses a different account using the same link", async () => {
    await seed();
    await assertFails(link(eveDb(), EVE));
  });

  it("refuses an expired invite", async () => {
    await seed(sharedDoc(), invite({ expiresAt: Timestamp.fromMillis(1) }));
    await assertFails(link(bobDb()));
  });

  it("refuses an invite that was deleted when the share was revoked", async () => {
    await seed(sharedDoc(), null);
    await assertFails(link(bobDb()));
  });

  it("refuses an invite that belongs to another document", async () => {
    await seed(sharedDoc(), invite({ sharedDocumentId: "s2" }));
    await assertFails(link(bobDb()));
  });

  it("refuses once the recipient is no longer on the document", async () => {
    await seed(sharedDoc({ recipientEmails: [] }));
    await assertFails(link(bobDb()));
  });

  it("refuses a locked document", async () => {
    await seed(sharedDoc({ locked: true }));
    await assertFails(link(bobDb()));
  });

  it("refuses linking someone else's uid", async () => {
    await seed();
    await assertFails(link(bobDb(), EVE));
  });

  it("refuses touching anything besides the uid", async () => {
    await seed();
    await assertFails(
      updateDoc(doc(bobDb(), "sharedDocuments/s1"), {
        acceptedInvite: HASH,
        name: "Hijacked",
        recipientUids: arrayUnion(BOB),
      }),
    );
  });

  it("refuses removing a uid that is already linked", async () => {
    await seed(sharedDoc({ recipientUids: [EVE] }));
    await assertFails(
      updateDoc(doc(bobDb(), "sharedDocuments/s1"), {
        acceptedInvite: HASH,
        recipientUids: [BOB],
      }),
    );
  });

  it("does not let an unverified address read without linking", async () => {
    await seed();
    await assertFails(getDoc(doc(bobDb(), "sharedDocuments/s1")));
  });
});
