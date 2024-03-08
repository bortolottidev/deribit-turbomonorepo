import { Code } from "@repo/ui/code";
import styles from "../page.module.css";
import Link from "next/link";

export default function Header(): JSX.Element {
  const deribitMetrics = "https://metrics.deribit.com/futures/BTC";
  const deribit = "https://www.deribit.com/futures/BTC-PERPETUAL";
  return (
    <div className={styles.description}>
      <Link href="/">
        <p>
          <Code className={styles.code}>web</Code>
        </p>
      </Link>
      <div>
        <Link href={deribit} target="_blank">
          Deribit
        </Link>
      </div>
      <div>
        <Link href={deribitMetrics} target="_blank">
          To the metrics!
        </Link>
      </div>
      <div>
        <Link href="chart">To the chart!</Link>
      </div>
      <div>
        <Link href="tables">To the tables!</Link>
      </div>
    </div>
  );
}
