import AccountChart from "./account-chart";
import styles from "../page.module.css";
import { getArrayAccountChartData } from "./helper";
import { Account } from "../../types/account";
import Header from "../components/header";

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

  const [accountsData, usernames] = getArrayAccountChartData(data.account);

  const height = "50%";
  const width = "calc(50% - 10px)";
  const titleStyle = {
    textAlign: "center",
    margin: "3rem",
  };
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
        }}
      >
        <h1 style={titleStyle}> Money </h1>
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
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
      </div>
    </main>
  );
}
