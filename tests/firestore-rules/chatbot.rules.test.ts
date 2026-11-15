import { readFileSync } from "node:fs";
import path from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const visitorDb = () => env.unauthenticatedContext().firestore();
const signedInDb = () =>
  env
    .authenticatedContext("user-uid", { email: "user@example.com" })
    .firestore();

const entry = (overrides: Record<string, unknown> = {}) => ({
  createdAt: Timestamp.now(),
  message: "can I add my logo?",
  path: "/",
  ...overrides,
});

const seed = () =>
  env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "chatbotUnanswered/u1"), entry());
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

describe("chatbotUnanswered — create", () => {
  it("lets a signed-out visitor log a question", async () => {
    await assertSucceeds(
      setDoc(doc(visitorDb(), "chatbotUnanswered/new"), entry()),
    );
  });

  it("lets a signed-in user log a question", async () => {
    await assertSucceeds(
      setDoc(doc(signedInDb(), "chatbotUnanswered/new"), entry()),
    );
  });

  it("refuses extra fields", async () => {
    await assertFails(
      setDoc(
        doc(visitorDb(), "chatbotUnanswered/new"),
        entry({ email: "someone@example.com" }),
      ),
    );
  });

  it("refuses an empty or oversized message", async () => {
    await assertFails(
      setDoc(doc(visitorDb(), "chatbotUnanswered/new"), entry({ message: "" })),
    );
    await assertFails(
      setDoc(
        doc(visitorDb(), "chatbotUnanswered/new"),
        entry({ message: "a".repeat(301) }),
      ),
    );
  });

  it("refuses a missing or wrong-typed field", async () => {
    const { createdAt, message } = entry();
    await assertFails(
      setDoc(doc(visitorDb(), "chatbotUnanswered/new"), { createdAt, message }),
    );
    await assertFails(
      setDoc(
        doc(visitorDb(), "chatbotUnanswered/new"),
        entry({ createdAt: "today" }),
      ),
    );
  });
});

describe("chatbotUnanswered — everything else", () => {
  beforeEach(() => seed());

  it("refuses reads, even to signed-in users", async () => {
    await assertFails(getDoc(doc(visitorDb(), "chatbotUnanswered/u1")));
    await assertFails(getDoc(doc(signedInDb(), "chatbotUnanswered/u1")));
  });

  it("refuses updates and deletes", async () => {
    await assertFails(
      updateDoc(doc(visitorDb(), "chatbotUnanswered/u1"), { message: "x" }),
    );
    await assertFails(deleteDoc(doc(visitorDb(), "chatbotUnanswered/u1")));
  });
});
