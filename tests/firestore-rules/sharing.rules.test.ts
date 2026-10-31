import { readFileSync } from "node:fs";
import path from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const OWNER = "owner-uid";
const BOB = "bob-uid";
const STRANGER = "stranger-uid";

const ownerDb = () =>
  env
    .authenticatedContext(OWNER, {
      email: "alice@example.com",
      email_verified: true,
    })
    .firestore();
const bobDb = (claims: Record<string, unknown> = {}) =>
  env
    .authenticatedContext(BOB, {
      email: "bob@example.com",
      email_verified: true,
      ...claims,
    })
    .firestore();
const strangerDb = () =>
  env
    .authenticatedContext(STRANGER, {
      email: "eve@example.com",
      email_verified: true,
    })
    .firestore();

const now = () => Timestamp.now();

const sharedDoc = (overrides: Record<string, unknown> = {}) => ({
  createdAt: now(),
  locked: false,
  name: "NDA",
  ownerEmail: "alice@example.com",
  ownerId: OWNER,
  ownerName: "Alice",
  recipientEmails: ["bob@example.com"],
  recipientUids: [BOB],
  recipients: [
    { email: "bob@example.com", invitedAt: now(), status: "pending", uid: BOB },
  ],
  signatures: {},
  sourceDocumentId: "doc_1",
  templateId: "nda",
  updatedAt: now(),
  values: { party: "Acme" },
  ...overrides,
});

const signature = (overrides: Record<string, unknown> = {}) => ({
  email: "bob@example.com",
  signedAt: now(),
  type: "typed",
  value: "Bob Smith",
  ...overrides,
});

const seed = (data: Record<string, unknown> = sharedDoc()) =>
  env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "sharedDocuments/s1"), data);
  });

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-dokiments-rules",
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

describe("sharedDocuments — read", () => {
  it("lets the owner read", async () => {
    await seed();
    await assertSucceeds(getDoc(doc(ownerDb(), "sharedDocuments/s1")));
  });

  it("lets a recipient matched by uid read", async () => {
    await seed();
    await assertSucceeds(getDoc(doc(bobDb(), "sharedDocuments/s1")));
  });

  it("lets a recipient matched by verified email read, with no uid linked", async () => {
    await seed(sharedDoc({ recipientUids: [] }));
    await assertSucceeds(getDoc(doc(bobDb(), "sharedDocuments/s1")));
  });

  it("does not trust an unverified email", async () => {
    await seed(sharedDoc({ recipientUids: [] }));
    await assertFails(
      getDoc(doc(bobDb({ email_verified: false }), "sharedDocuments/s1")),
    );
  });

  it("lets the owner list their own shares, and a recipient list theirs", async () => {
    await seed();
    await assertSucceeds(
      getDocs(
        query(
          collection(ownerDb(), "sharedDocuments"),
          where("ownerId", "==", OWNER),
        ),
      ),
    );
    await assertSucceeds(
      getDocs(
        query(
          collection(bobDb(), "sharedDocuments"),
          where("recipientEmails", "array-contains", "bob@example.com"),
        ),
      ),
    );
  });

  it("refuses listing someone else's shares", async () => {
    await seed();
    await assertFails(
      getDocs(
        query(
          collection(strangerDb(), "sharedDocuments"),
          where("ownerId", "==", OWNER),
        ),
      ),
    );
  });

  it("denies a stranger and an unauthenticated caller", async () => {
    await seed();
    await assertFails(getDoc(doc(strangerDb(), "sharedDocuments/s1")));
    await assertFails(
      getDoc(
        doc(env.unauthenticatedContext().firestore(), "sharedDocuments/s1"),
      ),
    );
  });
});

describe("sharedDocuments — create", () => {
  const ref = (db: ReturnType<typeof ownerDb>) =>
    doc(db, "sharedDocuments/new");

  it("lets an owner create their own, unlocked, unsigned share", async () => {
    await assertSucceeds(setDoc(ref(ownerDb()), sharedDoc()));
  });

  it("refuses creating one in someone else's name", async () => {
    await assertFails(setDoc(ref(strangerDb()), sharedDoc()));
  });

  it("refuses a pre-signed or pre-locked document", async () => {
    await assertFails(setDoc(ref(ownerDb()), sharedDoc({ locked: true })));
    await assertFails(
      setDoc(ref(ownerDb()), sharedDoc({ signatures: { [BOB]: signature() } })),
    );
  });

  it("refuses unknown fields and missing required fields", async () => {
    await assertFails(setDoc(ref(ownerDb()), sharedDoc({ extra: 1 })));
    const withoutValues: Record<string, unknown> = sharedDoc();
    delete withoutValues.values;
    await assertFails(setDoc(ref(ownerDb()), withoutValues));
  });
});

describe("sharedDocuments — owner update and delete", () => {
  beforeEach(() => seed());

  it("lets the owner edit and add recipients while unlocked", async () => {
    await assertSucceeds(
      updateDoc(doc(ownerDb(), "sharedDocuments/s1"), {
        name: "NDA v2",
        recipientEmails: ["bob@example.com", "carol@example.com"],
        updatedAt: now(),
      }),
    );
  });

  it("stops the owner forging a signature or locking the document", async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), "sharedDocuments/s1"), {
        signatures: { [BOB]: signature() },
      }),
    );
    await assertFails(
      updateDoc(doc(ownerDb(), "sharedDocuments/s1"), { locked: true }),
    );
  });

  it("stops the owner reassigning ownership", async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), "sharedDocuments/s1"), { ownerId: STRANGER }),
    );
  });

  it("lets the owner delete while unlocked", async () => {
    await assertSucceeds(deleteDoc(doc(ownerDb(), "sharedDocuments/s1")));
  });

  it("denies a stranger and a recipient from editing or deleting", async () => {
    await assertFails(
      updateDoc(doc(strangerDb(), "sharedDocuments/s1"), { name: "x" }),
    );
    await assertFails(
      updateDoc(doc(bobDb(), "sharedDocuments/s1"), { name: "x" }),
    );
    await assertFails(deleteDoc(doc(bobDb(), "sharedDocuments/s1")));
  });
});

describe("sharedDocuments — recipient signing", () => {
  beforeEach(() => seed());

  const sign = (
    db: ReturnType<typeof bobDb>,
    sig = signature(),
    extra: Record<string, unknown> = {},
  ) =>
    updateDoc(doc(db, "sharedDocuments/s1"), {
      locked: true,
      signatures: { [BOB]: sig },
      updatedAt: now(),
      ...extra,
    });

  it("lets the recipient add their own signature and lock", async () => {
    await assertSucceeds(sign(bobDb()));
  });

  it("refuses signing as someone else's email", async () => {
    await assertFails(sign(bobDb(), signature({ email: "alice@example.com" })));
  });

  it("refuses signing without locking the document", async () => {
    await assertFails(sign(bobDb(), signature(), { locked: false }));
  });

  it("refuses a second signature once signed", async () => {
    await assertSucceeds(sign(bobDb()));
    await assertFails(sign(bobDb(), signature({ value: "Someone Else" })));
  });

  it("refuses an empty, over-long or non-typed signature", async () => {
    await assertFails(sign(bobDb(), signature({ value: "" })));
    await assertFails(sign(bobDb(), signature({ value: "x".repeat(201) })));
    await assertFails(sign(bobDb(), signature({ type: "drawn" })));
  });

  it("refuses a signature under another uid", async () => {
    await assertFails(
      updateDoc(doc(bobDb(), "sharedDocuments/s1"), {
        locked: true,
        signatures: { [STRANGER]: signature() },
        updatedAt: now(),
      }),
    );
  });

  it("refuses touching anything but signatures, locked and updatedAt", async () => {
    await assertFails(sign(bobDb(), signature(), { name: "Changed" }));
    await assertFails(
      sign(bobDb(), signature(), { recipientUids: [BOB, STRANGER] }),
    );
    await assertFails(sign(bobDb(), signature(), { ownerId: BOB }));
  });

  it("refuses a recipient matched only by an unverified email", async () => {
    await env.clearFirestore();
    await seed(sharedDoc({ recipientUids: [] }));
    await assertFails(sign(bobDb({ email_verified: false })));
  });

  it("denies a stranger", async () => {
    await assertFails(
      updateDoc(doc(strangerDb(), "sharedDocuments/s1"), {
        locked: true,
        signatures: { [STRANGER]: signature({ email: "eve@example.com" }) },
        updatedAt: now(),
      }),
    );
  });
});

describe("sharedDocuments — locked", () => {
  beforeEach(() =>
    seed(sharedDoc({ locked: true, signatures: { [BOB]: signature() } })),
  );

  it("is still readable by both parties", async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), "sharedDocuments/s1")));
    await assertSucceeds(getDoc(doc(bobDb(), "sharedDocuments/s1")));
  });

  it("can no longer be edited or deleted by anyone", async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), "sharedDocuments/s1"), { name: "x" }),
    );
    await assertFails(deleteDoc(doc(ownerDb(), "sharedDocuments/s1")));
    await assertFails(
      updateDoc(doc(bobDb(), "sharedDocuments/s1"), {
        signatures: { [BOB]: signature({ value: "Other" }) },
      }),
    );
  });
});

describe("users/{uid}/shareRecipients — sharing ledger", () => {
  const entry = (email: string, overrides: Record<string, unknown> = {}) => ({
    email,
    firstSharedAt: now(),
    lastSharedAt: now(),
    ...overrides,
  });
  const path = (email: string) => `users/${OWNER}/shareRecipients/${email}`;

  it("lets the owner record, and read, a recipient", async () => {
    await assertSucceeds(
      setDoc(doc(ownerDb(), path("bob@example.com")), entry("bob@example.com")),
    );
    await assertSucceeds(getDoc(doc(ownerDb(), path("bob@example.com"))));
  });

  it("refuses an entry whose email does not match its key or is not lower-case", async () => {
    await assertFails(
      setDoc(doc(ownerDb(), path("bob@example.com")), entry("eve@example.com")),
    );
    await assertFails(
      setDoc(doc(ownerDb(), path("Bob@Example.com")), entry("Bob@Example.com")),
    );
  });

  it("never lets an entry be deleted, so a limit cannot be reset", async () => {
    await assertSucceeds(
      setDoc(doc(ownerDb(), path("bob@example.com")), entry("bob@example.com")),
    );
    await assertFails(deleteDoc(doc(ownerDb(), path("bob@example.com"))));
  });

  it("lets lastSharedAt move but never firstSharedAt", async () => {
    await assertSucceeds(
      setDoc(doc(ownerDb(), path("bob@example.com")), entry("bob@example.com")),
    );
    await assertSucceeds(
      updateDoc(doc(ownerDb(), path("bob@example.com")), {
        lastSharedAt: now(),
      }),
    );
    await assertFails(
      updateDoc(doc(ownerDb(), path("bob@example.com")), {
        firstSharedAt: Timestamp.fromMillis(0),
      }),
    );
  });

  it("is private to the owner", async () => {
    await assertFails(getDoc(doc(strangerDb(), path("bob@example.com"))));
    await assertFails(
      setDoc(
        doc(strangerDb(), path("bob@example.com")),
        entry("bob@example.com"),
      ),
    );
  });
});
