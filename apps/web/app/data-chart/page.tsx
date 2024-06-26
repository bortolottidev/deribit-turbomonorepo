import ThresholdChart from "./threshold-chart";
import AreaChart from "./area-chart";
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
import { FundingRate } from "../../types/funding-rate";

// avoid cache
export const dynamic = "force-dynamic";

async function fetchData() {
  const entities = [
    "future",
    "funding-rate",
    "account-summary",
    "position",
    "trade",
  ] as const;
  const fetchedData: {
    future: Future[];
    ["account-summary"]: AccountSummaryData[];
    position: Position[];
    trade: Trade[];
    ["funding-rate"]: FundingRate[];
  } = {
    future: [],
    position: [],
    trade: [],
    ["account-summary"]: [],
    ["funding-rate"]: [],
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
  const data = await fetchData();
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
          <AreaChart type="equity" data={data["funding-rate"]} />
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
                  key={"percent-" + spread[0]?.instrument}
                  data={spread}
                  type="%"
                />
                <ThresholdChart
                  key={"premium-" + spread[0]?.instrument}
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
