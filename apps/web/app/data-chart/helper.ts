import { bisector } from "@visx/vendor/d3-array";
import { EnrichedAccountSummaryData } from "../../types/account-summary";
import { SpreadFuture } from "../../types/future";
import { timeFormat } from "@visx/vendor/d3-time-format";

// accessors
export const date = (d: SpreadFuture) => d.insertedAt;
export const instrumentPrice = (d: SpreadFuture) => Number(d.instrumentPrice);
export const perpetualPrice = (d: SpreadFuture) => Number(d.perpetualPrice);
export const annualizedSpread = (d: SpreadFuture) => Number(d.spreadAnnualized);
export const getPremiumSpreadUsd = (d: SpreadFuture) => Number(d.spreadUsd);

export const getMargin = (data: EnrichedAccountSummaryData): number =>
  data.maintenanceMargin;
export const getDate = (data: EnrichedAccountSummaryData): Date =>
  new Date(data.insertedAt);
export const getEquityValue = (data: EnrichedAccountSummaryData): number =>
  data.equity;
export const getEquityUsdValue = (data: EnrichedAccountSummaryData): number =>
  data.equityUsd;
export const bisectDate = bisector<EnrichedAccountSummaryData, Date>(
  (data) => new Date(data.insertedAt),
).left;

// util
export const formatDate = timeFormat("%b %d, '%y");
