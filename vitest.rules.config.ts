import { defineConfig } from "vitest/config";

// Firestore security-rules tests. They need the Firestore emulator, so they are
// kept out of the default `vitest run` and run through `npm run test:rules`.
export default defineConfig({
  test: {
    environment: "node",
    hookTimeout: 30_000,
    include: ["tests/firestore-rules/**/*.test.ts"],
    name: "rules",
    testTimeout: 30_000,
  },
});
