import type { StatusTone } from "@/lib/ui/status-tone";

import type { EntryStatus } from "./company-groups";

/**
 * The colour family of each document status, shared by `EntryStatusPill`
 * and the phone rows' status dot so the two can never drift apart.
 */
export const entryStatusTone: Record<EntryStatus, StatusTone> = {
  awaiting: "golden",
  "not-shared": "grey",
  received: "teal",
  signed: "green",
  viewed: "blue",
};
