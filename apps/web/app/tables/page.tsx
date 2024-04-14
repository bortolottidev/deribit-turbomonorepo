import Image from "next/image";
import styles from "../page.module.css";
import Header from "../components/header";
import { Position, Trade } from "../../types/trade";
import { FundingSum } from "../../types/funding";
import Test from "./test";

function Gradient({
  conic,
  className,
  small,
}: {
  small?: boolean;
  conic?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={[
        styles.gradient,
        conic ? styles.glowConic : undefined,
        small ? styles.gradientSmall : styles.gradientLarge,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

type FetchedData = {
  position: Position[];
  trade: Trade[];
  fundingCollected: FundingSum | null;
  indexPrice: number | null;
};

export const revalidate = 1 * 60; // revalidate the data at most every minute

async function getData(): Promise<FetchedData> {
  const entities = ["position", "trade"] as const;
  const fetchedData: FetchedData = {
    trade: [],
    position: [],
    fundingCollected: null,
    indexPrice: null,
  };

  for (const entity of entities) {
    const res = await fetch("http://localhost:3010/" + entity);
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    fetchedData[entity] = await res.json();
  }
  const fundingCollected = await fetch(
    "http://localhost:3010/funding-collected",
  );
  if (!fundingCollected.ok) {
    throw new Error("Failed to fetch funding");
  }
  fetchedData.fundingCollected = await fundingCollected.json();

  const indexPrice = await fetch("http://localhost:3010/index-price");
  if (!indexPrice.ok) {
    throw new Error("Failed to fetch index price");
  }
  fetchedData.indexPrice = (await indexPrice.json()).indexPrice;

  return fetchedData;
}

export default async function Page(): Promise<JSX.Element> {
  const data = await getData();
  const fundingSum = data.fundingCollected?.totalInterestPlSum;
  const dollarSum =
    fundingSum && data.indexPrice
      ? Math.floor(fundingSum * data.indexPrice)
      : "-";
  return (
    <main className={styles.main}>
      <Test data={data} />
      <Header />

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logos}>
            <div className={styles.circles}>
              <Image
                alt=""
                height={614}
                src="circles.svg"
                width={614}
                style={{ pointerEvents: "none" }}
              />
            </div>
          </div>
          <Gradient className={styles.backgroundGradient} conic />
          <div className="row gap-2">
            <div className={styles.dataDiv}>
              <h3 className="mb-1">Funding Collected</h3>
              {fundingSum || "N/A"} ₿ ({dollarSum} $)
            </div>
            <div className={styles.dataDiv}>
              <h3 className="mb-1">Days</h3>
              {data.fundingCollected?.count || "N/A"}
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.th}>Data</th>
                <th className={styles.th}>Price</th>
                <th className={styles.th}>Position</th>
                <th className={styles.th}>Side</th>
                <th className={styles.th}>Instrument</th>
                <th className={styles.th}>Commission</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>User</th>
                <th className={styles.th}>Info</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.trade.map(
                ({
                  insertedAt,
                  price,
                  username,
                  instrument_name,
                  commission,
                  amount,
                  side,
                  position,
                  info,
                  id,
                }) => (
                  <tr key={id}>
                    <td className={styles.td}>
                      {new Date(insertedAt).toLocaleString()}
                    </td>
                    <td className={styles.td}>{price}</td>
                    <td className={styles.td}>{position}</td>
                    <td className={styles.td}>{side}</td>
                    <td className={styles.td}>{instrument_name}</td>
                    <td className={styles.td}>
                      {Math.round(commission * 1_000_000_00) / 100}*10^6
                    </td>
                    <td className={styles.td}>{amount}</td>
                    <td className={styles.td}>{username}</td>
                    <td className={styles.td}>{info}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
