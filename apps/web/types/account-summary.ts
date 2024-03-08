import { Future } from "./future";

export type AccountSummaryData = {
  equity: number;
  initialMargin: number;
  maintenanceMargin: number;
  insertedAt: number;
  updatedAt: number;
};

export type EnrichedAccountSummaryData = AccountSummaryData & {
  equityUsd: number;
  all: Future[];
};
