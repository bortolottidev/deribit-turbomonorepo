import { EnrichedAccountSummaryData } from "./account-summary";
import { SpreadFuture } from "./future";
import { Trade } from "./trade";

export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ThresholdLayoutProps =
  | {
      margin?: Margin;
      data: SpreadFuture[];
      type: Extract<ThresholdChartType, "%">;
    }
  | {
      margin?: Margin;
      data: SpreadFuture[];
      type: Extract<ThresholdChartType, "premium">;
      trades: Trade[];
    };

export type ThresholdChartProps = ThresholdLayoutProps & {
  width: number;
  height: number;
  margin: Margin;
};

export type AreaProps = {
  width: number;
  height: number;
  margin?: Margin;
  type: AreaChartType;
  data: Array<EnrichedAccountSummaryData>;
};

export type AreaChartType = "equity" | "margin";
export type ThresholdChartType = "premium" | "%";
