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
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const ALICE = "alice-uid";
const EVE = "eve-uid";
const DEVICE = "a".repeat(64);

const aliceDb = () => env.authenticatedContext(ALICE).firestore();
const eveDb = () => env.authenticatedContext(EVE).firestore();
const anonymousDb = () => env.unauthenticatedContext().firestore();

const subscription = (overrides: Record<string, unknown> = {}) => ({
  auth: "auth-secret",
  createdAt: Timestamp.now(),
  deviceLabel: "Chrome on macOS",
  endpoint: "https://fcm.googleapis.com/fcm/send/abc",
  p256dh: "public-key",
  updatedAt: Timestamp.now(),
  ...overrides,
});

const devicePath = `users/${ALICE}/pushSubscriptions/${DEVICE}`;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-dokiments-rules-push",
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

const seed = () =>
  env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), devicePath), subscription());
  });

describe("pushSubscriptions — owner access", () => {
  it("lets the owner save, read, list and delete a device", async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), devicePath), subscription()));
    await assertSucceeds(getDoc(doc(aliceDb(), devicePath)));
    await assertSucceeds(
      getDocs(collection(aliceDb(), `users/${ALICE}/pushSubscriptions`)),
    );
    await assertSucceeds(deleteDoc(doc(aliceDb(), devicePath)));
  });
});

describe("pushSubscriptions — other users", () => {
  it("does not let another user read, write or delete a device", async () => {
    await seed();
    await assertFails(getDoc(doc(eveDb(), devicePath)));
    await assertFails(
      getDocs(collection(eveDb(), `users/${ALICE}/pushSubscriptions`)),
    );
    await assertFails(setDoc(doc(eveDb(), devicePath), subscription()));
    await assertFails(deleteDoc(doc(eveDb(), devicePath)));
  });

  it("does not let an anonymous visitor read a device", async () => {
    await seed();
    await assertFails(getDoc(doc(anonymousDb(), devicePath)));
  });
});

describe("pushSubscriptions — shape", () => {
  it("rejects a plain-HTTP endpoint", async () => {
    await assertFails(
      setDoc(
        doc(aliceDb(), devicePath),
        subscription({ endpoint: "http://push.example.com/abc" }),
      ),
    );
  });

  it("rejects an endpoint over the length ceiling", async () => {
    await assertFails(
      setDoc(
        doc(aliceDb(), devicePath),
        subscription({ endpoint: `https://x.test/${"a".repeat(2048)}` }),
      ),
    );
  });

  it("rejects a record missing a key", async () => {
    await assertFails(
      setDoc(doc(aliceDb(), devicePath), subscription({ auth: "" })),
    );
    const withoutKey: Record<string, unknown> = subscription();
    delete withoutKey.p256dh;
    await assertFails(setDoc(doc(aliceDb(), devicePath), withoutKey));
  });

  it("rejects an over-long device label", async () => {
    await assertFails(
      setDoc(
        doc(aliceDb(), devicePath),
        subscription({ deviceLabel: "x".repeat(101) }),
      ),
    );
  });
});
