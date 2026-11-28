import { readFileSync } from "node:fs";
import path from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const ADMIN = "admin-uid";
const ALICE = "alice-uid";
const SUBSCRIBER = "b".repeat(64);

const adminDb = () => env.authenticatedContext(ADMIN).firestore();
const aliceDb = () => env.authenticatedContext(ALICE).firestore();
const anonymousDb = () => env.unauthenticatedContext().firestore();

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-dokiments-rules-admin",
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
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, `users/${ADMIN}`), { displayName: "Admin", email: "admin@x.test", role: "superadmin" });
    await setDoc(doc(db, `users/${ALICE}`), { displayName: "Alice", email: "alice@x.test", role: "gold" });
    await setDoc(doc(db, `newsletter/${SUBSCRIBER}`), {
      createdAt: Timestamp.now(),
      email: "reader@x.test",
      status: "subscribed",
    });
  });
});

describe("newsletter reads", () => {
  it("lets a superadmin list subscribers", async () => {
    await assertSucceeds(getDocs(collection(adminDb(), "newsletter")));
  });

  it("refuses a paying customer", async () => {
    await assertFails(getDocs(collection(aliceDb(), "newsletter")));
    await assertFails(getDoc(doc(aliceDb(), `newsletter/${SUBSCRIBER}`)));
  });

  it("refuses a signed-out visitor", async () => {
    await assertFails(getDocs(collection(anonymousDb(), "newsletter")));
  });
});

describe("users list", () => {
  it("lets a superadmin list every account", async () => {
    await assertSucceeds(getDocs(collection(adminDb(), "users")));
  });

  it("refuses a customer listing everyone", async () => {
    await assertFails(getDocs(collection(aliceDb(), "users")));
  });
});

describe("feedback list", () => {
  it("lets a superadmin read feedback and refuses a customer", async () => {
    await assertSucceeds(getDocs(collection(adminDb(), "feedback")));
    await assertFails(getDocs(collection(aliceDb(), "feedback")));
  });
});
