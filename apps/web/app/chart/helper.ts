import { EnrichedAccountSummaryData } from "../../types/account-summary";
import { SpreadFuture } from "../../types/future";
import { timeFormat } from "@visx/vendor/d3-time-format";
import { bisector } from "@visx/vendor/d3-array";
import { Account } from "../../types/account";
import { AccountChartData } from "./account-chart";

// accessors
export const date = (d: SpreadFuture) => d.insertedAt;
export const instrumentPrice = (d: SpreadFuture) => Number(d.instrumentPrice);
export const perpetualPrice = (d: SpreadFuture) => Number(d.perpetualPrice);
export const annualizedSpread = (d: SpreadFuture) => Number(d.spreadAnnualized);
export const getPremiumSpreadUsd = (d: SpreadFuture) => Number(d.spreadUsd);

// util
export const formatDate = timeFormat("%b %d, '%y");

// accessors
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

type Timestamp = number;
type Username = string;
type UsernameEquityUsd = number;
type UsernameAccumulator = { [username: Username]: UsernameEquityUsd };

const insertedAtAscCompareFn = (
  a: AccountChartData,
  b: AccountChartData,
): number => a.insertedAt - b.insertedAt;

export const getArrayAccountChartData = (
  accounts: Account[],
): [AccountChartData[], Username[]] => {
  const usernames = new Set<Username>();
  const accountGroups = accounts.reduce<Record<Timestamp, UsernameAccumulator>>(
    (acc, { insertedAt, username, equityUsd }) => {
      usernames.add(username);
      if (!acc[insertedAt]) {
        acc[insertedAt] = {};
      }

      acc[insertedAt]![username] = equityUsd;
      return acc;
    },
    {},
  );

  return [
    Object.entries(accountGroups)
      .map(([insertedAt, accounts]) => ({
        insertedAt: Number(insertedAt),
        sum: [...usernames].reduce<UsernameEquityUsd>(
          //@ts-ignore - wtf?
          (acc, current) => acc + accounts[current],
          0,
        ),
        ...accounts,
      }))
      .filter((groups) => isFinite(groups.sum))
      .sort(insertedAtAscCompareFn),
    [...usernames],
  ];
};
