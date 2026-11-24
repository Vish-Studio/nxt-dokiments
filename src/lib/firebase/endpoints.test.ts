import { describe, expect, it } from "vitest";

import { resolveFirebaseEndpoints } from "./endpoints";

describe("resolveFirebaseEndpoints", () => {
  it("uses Google's cloud when no emulator is configured", () => {
    expect(resolveFirebaseEndpoints({})).toEqual({
      emulating: false,
      firestore: "https://firestore.googleapis.com/v1",
      identity: "https://identitytoolkit.googleapis.com/v1",
      token: "https://securetoken.googleapis.com/v1",
    });
  });

  it("points Firestore at its emulator", () => {
    const endpoints = resolveFirebaseEndpoints({
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
    });

    expect(endpoints.emulating).toBe(true);
    expect(endpoints.firestore).toBe("http://127.0.0.1:8080/v1");
    expect(endpoints.identity).toContain("identitytoolkit.googleapis.com");
  });

  it("serves Auth under the original Google hostname", () => {
    const endpoints = resolveFirebaseEndpoints({
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
    });

    expect(endpoints.identity).toBe(
      "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1",
    );
    expect(endpoints.token).toBe(
      "http://127.0.0.1:9099/securetoken.googleapis.com/v1",
    );
    expect(endpoints.firestore).toContain("firestore.googleapis.com");
  });

  it("tolerates a scheme and trailing slash", () => {
    expect(
      resolveFirebaseEndpoints({
        FIRESTORE_EMULATOR_HOST: "http://localhost:8080/",
      }).firestore,
    ).toBe("http://localhost:8080/v1");
  });

  it("ignores blank values", () => {
    expect(
      resolveFirebaseEndpoints({ FIRESTORE_EMULATOR_HOST: "  " }).emulating,
    ).toBe(false);
  });

  it("never redirects Vercel Production", () => {
    const endpoints = resolveFirebaseEndpoints({
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
      VERCEL_ENV: "production",
    });

    expect(endpoints.emulating).toBe(false);
    expect(endpoints.firestore).toBe("https://firestore.googleapis.com/v1");
  });
});
