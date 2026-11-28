import { describe, expect, it } from "vitest";

import type { AdminUserAccount } from "@/types/admin";

import {
  countByRole,
  countJoinedSince,
  countPaidAccounts,
  filterAccounts,
  weeklySignups,
} from "./user-stats";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 28);

const account = (overrides: Partial<AdminUserAccount> = {}): AdminUserAccount => ({
  createdAt: NOW - DAY,
  displayName: "Maya Laurent",
  email: "maya@laurent.test",
  provider: "password",
  role: "free",
  uid: "u_maya",
  updatedAt: null,
  ...overrides,
});

describe("countByRole", () => {
  it("counts each role and keeps empty roles at zero", () => {
    const counts = countByRole([
      account({ role: "free" }),
      account({ role: "free" }),
      account({ role: "gold" }),
    ]);

    expect(counts.free).toBe(2);
    expect(counts.gold).toBe(1);
    expect(counts.silver).toBe(0);
    expect(counts.superadmin).toBe(0);
  });
});

describe("countPaidAccounts", () => {
  it("counts Silver and Gold but not Special or staff", () => {
    expect(
      countPaidAccounts([
        account({ role: "silver" }),
        account({ role: "gold" }),
        account({ role: "special" }),
        account({ role: "superadmin" }),
        account({ role: "free" }),
      ]),
    ).toBe(2);
  });
});

describe("countJoinedSince", () => {
  it("skips accounts with no creation date", () => {
    expect(
      countJoinedSince(
        [account({ createdAt: NOW - DAY }), account({ createdAt: null })],
        NOW - 7 * DAY,
      ),
    ).toBe(1);
  });

  it("includes an account created exactly at the cut-off", () => {
    expect(countJoinedSince([account({ createdAt: NOW - DAY })], NOW - DAY)).toBe(1);
  });
});

describe("weeklySignups", () => {
  it("returns one bucket per week, oldest first", () => {
    const weeks = weeklySignups([], NOW, 4);

    expect(weeks).toHaveLength(4);
    expect(weeks[0].weekStart).toBeLessThan(weeks[3].weekStart);
    expect(weeks.every((week) => week.count === 0)).toBe(true);
  });

  it("puts a sign-up from yesterday in the last week", () => {
    expect(weeklySignups([account({ createdAt: NOW - DAY })], NOW, 4).at(-1)?.count).toBe(1);
  });

  it("ignores sign-ups older than the window and undated ones", () => {
    const weeks = weeklySignups(
      [account({ createdAt: NOW - 60 * DAY }), account({ createdAt: null })],
      NOW,
      4,
    );

    expect(weeks.reduce((sum, week) => sum + week.count, 0)).toBe(0);
  });
});

describe("filterAccounts", () => {
  const accounts = [
    account({ createdAt: NOW - 3 * DAY, displayName: "Zoe", email: "zoe@x.test", role: "gold", uid: "u_zoe" }),
    account({ createdAt: null, displayName: "Adam", email: "adam@x.test", uid: "u_adam" }),
    account({ companyName: "Northwind", createdAt: NOW - DAY, displayName: "Maya", uid: "u_maya" }),
  ];

  it("finds an account by company name", () => {
    expect(filterAccounts(accounts, { role: "all", search: "north", sort: "newest" }).map((a) => a.uid)).toEqual(["u_maya"]);
  });

  it("keeps only the chosen role", () => {
    expect(filterAccounts(accounts, { role: "gold", search: "", sort: "newest" }).map((a) => a.uid)).toEqual(["u_zoe"]);
  });

  it("sorts newest first with undated accounts last", () => {
    expect(filterAccounts(accounts, { role: "all", search: "", sort: "newest" }).map((a) => a.uid)).toEqual(["u_maya", "u_zoe", "u_adam"]);
  });

  it("keeps undated accounts last when sorting oldest first too", () => {
    expect(filterAccounts(accounts, { role: "all", search: "", sort: "oldest" }).map((a) => a.uid)).toEqual(["u_zoe", "u_maya", "u_adam"]);
  });

  it("does not reorder the array it was given", () => {
    const before = accounts.map((a) => a.uid);
    filterAccounts(accounts, { role: "all", search: "", sort: "name" });

    expect(accounts.map((a) => a.uid)).toEqual(before);
  });
});
