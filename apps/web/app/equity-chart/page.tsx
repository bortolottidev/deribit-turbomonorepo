import AccountChart from "./account-chart";
import styles from "../page.module.css";
import { getArrayAccountChartData } from "./helper";
import { Account } from "../../types/account";
import Header from "../components/header";
import { AddButton } from "./add-button";
import { getSavedTracker } from "./actions";

// avoid cache
export const dynamic = "force-dynamic";
export const TRACKING_BTC_USERNAME = "tracking_btc";

async function getFutures() {
  const entities = ["account"] as const;
  const fetchedData: {
    account: Account[];
  } = {
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

export default async function Page(): Promise<JSX.Element> {
  const data = await getFutures();
  const btcTracker = await getSavedTracker();

  let trackingBtcData = null;
  const currentBtc = Number(btcTracker?.value);
  if (isFinite(currentBtc)) {
    trackingBtcData = data.account.map((acc) => ({
      [TRACKING_BTC_USERNAME]: {
        equityUsd: currentBtc * acc.indexPrice,
      },
      insertedAt: acc.insertedAt,
    }));
  }

  const [accountsData, usernames] = getArrayAccountChartData(
    data.account,
    trackingBtcData,
  );

  // usernames + sum + btcTracker
  const rows = Math.ceil((usernames.length + 1 + (btcTracker ? 1 : 0)) / 2);
  const height = 400;
  const width = "calc(50% - 1em)";
  const titleStyle = {
    textAlign: "center",
    margin: "3rem",
  } as const;

  return (
    <main className={styles.main}>
      <Header />
      <div className="flex column">
        <h1 style={titleStyle}> Money </h1>
        <div className="flex wrap gap-2">
          <div style={{ height, width }}>
            <h2>Equity</h2>
            <AccountChart type="equity" data={accountsData} username={"sum"} />
          </div>
          {usernames.map((username) => (
            <div style={{ height, width }} key={username + "-equity"}>
              <h2>{username}</h2>
              <AccountChart
                data={accountsData}
                type="equity"
                username={username}
              />
            </div>
          ))}
          {trackingBtcData && (
            <div style={{ height, width }}>
              <h2>Tracking {currentBtc} BTC</h2>
              <AccountChart
                data={trackingBtcData}
                type="equity"
                username={TRACKING_BTC_USERNAME}
              />
            </div>
          )}
        </div>
        <h1 style={titleStyle}> Margin </h1>
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {usernames.map((username) => (
            <div style={{ height, width }} key={username + "-margin"}>
              <h2>{username}</h2>
              <AccountChart
                data={accountsData}
                type="margin"
                username={username}
              />
            </div>
          ))}
        </div>
        <AddButton />
      </div>
    </main>
  );
}
