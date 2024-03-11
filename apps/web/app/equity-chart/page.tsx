import AccountChart from "./account-chart";
import { getArrayAccountChartData } from "./helper";
import { Account } from "../../types/account";

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
        <div style={{ height, width }} key={username}>
          <h2>{username}</h2>
          <AccountChart data={accountsData} username={username} />
        </div>
      ))}
    </div>
  );
}
