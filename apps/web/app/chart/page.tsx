import ThresholdChart from "./threshold-chart";
import AreaChart from "./area-chart";
import AccountChart from "./account-chart";
import {
  AccountSummaryData,
  EnrichedAccountSummaryData,
} from "../../types/account-summary";
import {
  FUTURE_INSTRUMENT,
  Future,
  PERPETUAL_INSTRUMENT,
  SpreadFuture,
} from "../../types/future";
import Header from "../components/header";
import styles from "../page.module.css";
import { Position, Trade } from "../../types/trade";
import { getArrayAccountChartData } from "./helper";
import { Account } from "../../types/account";

async function getFutures() {
  const entities = [
    "future",
    "account",
    "account-summary",
    "position",
    "trade",
  ] as const;
  const fetchedData: {
    future: Future[];
    ["account-summary"]: AccountSummaryData[];
    position: Position[];
    trade: Trade[];
    account: Account[];
  } = {
    future: [],
    position: [],
    trade: [],
    ["account-summary"]: [],
    account: [],
  };
  for (const entity of entities) {
    const res = await fetch("http://localhost:3010/" + entity);
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    fetchedData[entity] = await res.json();
  }

  return fetchedData;
}
type PerpetualFuture = Future & {
  instrument: PERPETUAL_INSTRUMENT;
};
type NotPerpetualFuture = Future & {
  instrument: FUTURE_INSTRUMENT;
};

const isAPerpetual = (future: Future): future is PerpetualFuture =>
  future.instrument === "BTC-PERPETUAL";
const isNotAPerpetual = (future: Future): future is NotPerpetualFuture =>
  future.instrument !== "BTC-PERPETUAL";

export default async function Page(): Promise<JSX.Element> {
  const data = await getFutures();
  const perpetuals: Array<PerpetualFuture> = data.future.filter(isAPerpetual);
  // remap spread futures data
  const spreadFutures: Record<FUTURE_INSTRUMENT, SpreadFuture[]> = {};
  for (const future of data.future.filter(isNotAPerpetual)) {
    const relatedPerpetual = perpetuals.find(
      (perp) => Math.abs(perp.insertedAt - future.insertedAt) < 1_000,
    );
    if (!relatedPerpetual) {
      console.error({ msg: "Cannot find related", future });
      throw new Error("Cannot find related perpetual");
    }

    const premium = future.lastTrade.price - relatedPerpetual.lastTrade.price;
    const premiumPercent = (premium / relatedPerpetual.lastTrade.price) * 100;

    const timestampDiffMs =
      new Date(future.expirationTimestamp).getTime() - new Date().getTime();

    const MINUTES_IN_A_YEAR = 525600;
    const MILLISECONDS = 1000;
    const SECONDS = 60;
    const timestampMsToMinutes = (timestampMs: number) =>
      timestampMs / (MILLISECONDS * SECONDS);
    const minutesBeforeExpiration = timestampMsToMinutes(timestampDiffMs);
    const premiumAnnulizedPercent =
      (premiumPercent / minutesBeforeExpiration) * MINUTES_IN_A_YEAR;

    if (!spreadFutures[future.instrument]) {
      spreadFutures[future.instrument] = [];
    }

    spreadFutures[future.instrument]?.push({
      perpetual: "BTC-PERPETUAL",
      expirationTimestamp: future.expirationTimestamp,
      instrument: future.instrument,
      insertedAt: future.insertedAt,
      instrumentPrice: future.lastTrade.price,
      perpetualPrice: relatedPerpetual.lastTrade.price,
      spreadUsd: premium,
      spreadPercent: premiumPercent,
      spreadAnnualized: premiumAnnulizedPercent,
    });
  }

  // remap account-summary data
  const accountSummariesEnrichedWithUsd: Array<EnrichedAccountSummaryData> = [];
  let i = -1;
  for (const accountSummary of data["account-summary"]) {
    i++;
    accountSummariesEnrichedWithUsd.push({
      ...accountSummary,
      all: [],
      equityUsd: 0,
    });
    const relatedPerpetual = perpetuals.find(
      (perp) => Math.abs(perp.insertedAt - accountSummary.insertedAt) < 1_500,
    );

    if (!relatedPerpetual) {
      continue;
    }

    const acc = accountSummariesEnrichedWithUsd[i];
    if (!acc) {
      continue;
    }

    acc.equityUsd = relatedPerpetual.lastTrade.price * acc.equity;
    acc.all = perpetuals;
  }

  const [accountsData, usernames] = getArrayAccountChartData(data.account);

  const height = "50%";
  const width = "calc(50% - 10px)";
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        gap: 20,
        padding: 20,
        flexWrap: "wrap",
      }}
    >
      <div style={{ height, width }}>
        <h2>Equity</h2>
        <AccountChart data={accountsData} username={"sum"} />
      </div>
      {usernames.map((username) => (
        <div style={{ height, width }}>
          <h2>{username}</h2>
          <AccountChart data={accountsData} username={username} />
        </div>
      ))}
    </div>
  );

  return (
    <main className={styles.main}>
      <Header />
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: 20,
        }}
      >
        <div
          style={{
            height: "50%",
            display: "flex",
            gap: 20,
          }}
        >
          <AreaChart type="equity" data={accountSummariesEnrichedWithUsd} />
          <AreaChart type="margin" data={accountSummariesEnrichedWithUsd} />
        </div>
        <div
          style={{
            height: "50%",
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {Object.values(spreadFutures)
            .filter(
              (spread) =>
                new Date().getTime() - (spread[0]?.expirationTimestamp ?? 0) <
                0,
            )
            .sort(
              ([spread1], [spread2]) =>
                (spread1?.expirationTimestamp ?? 0) -
                (spread2?.expirationTimestamp ?? 0),
            )
            .map((spread) => (
              <>
                <ThresholdChart
                  key={spread[0]?.instrument}
                  data={spread}
                  type="%"
                />
                <ThresholdChart
                  key={spread[0]?.instrument}
                  data={spread}
                  trades={data.position}
                  type="premium"
                />
              </>
            ))}
        </div>
      </div>
    </main>
  );
}
