import { describe, expect, it } from "vitest";

import { queryKeys } from "./keys";
import { isRefreshableQuery } from "./refresh-filter";

describe("isRefreshableQuery", () => {
  it.each<[readonly unknown[]]>([
    [queryKeys.documents.list()],
    [queryKeys.documents.detail("a")],
    [queryKeys.clients.all()],
    [queryKeys.savedTemplates.all()],
    [queryKeys.notifications.all()],
  ])("refreshes %j", (queryKey) => {
    expect(isRefreshableQuery({ queryKey })).toBe(true);
  });

  it.each<[readonly unknown[]]>([
    [queryKeys.templates.list()],
    [queryKeys.templates.detail("a")],
    [queryKeys.session()],
    [queryKeys.promoRedemptions.all()],
  ])("skips %j", (queryKey) => {
    expect(isRefreshableQuery({ queryKey })).toBe(false);
  });
});
