import { Account } from "../../types/account";
import { AccountChartData } from "./account-chart";

type Timestamp = number;
type Username = string;
type UsernameEquityUsd = number;
type UsernameAccumulator = {
  [username: Username]: {
    equityUsd: UsernameEquityUsd;
    maintenanceMarginPercent: number;
  };
};

const insertedAtAscCompareFn = (
  a: AccountChartData,
  b: AccountChartData,
): number => a.insertedAt - b.insertedAt;

export const getArrayAccountChartData = (
  accounts: Account[],
): [AccountChartData[], Username[]] => {
  const usernames = new Set<Username>();
  const accountGroups = accounts.reduce<Record<Timestamp, UsernameAccumulator>>(
    (acc, { insertedAt, username, equityUsd, maintenanceMarginPercent }) => {
      usernames.add(username);
      if (!acc[insertedAt]) {
        acc[insertedAt] = {};
      }

      acc[insertedAt]![username] = { equityUsd, maintenanceMarginPercent };
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
          (acc, current) => acc + accounts[current]?.equityUsd,
          0,
        ),
        ...accounts,
      }))
      .filter((groups) => isFinite(groups.sum))
      .sort(insertedAtAscCompareFn),
    [...usernames],
  ];
};
