"use client";

import { ParentSize } from "@visx/responsive";
import { Account } from "../../types/account";
import {
  AnimatedAxis,
  AnimatedGrid,
  AreaSeries,
  Tooltip,
  TooltipData,
  XYChart,
} from "@visx/xychart";
import { curveCardinal } from "@visx/curve";
import { timeFormat } from "@visx/vendor/d3-time-format";
import { ReactNode } from "react";
import { RenderTooltipParams } from "@visx/xychart/lib/components/Tooltip";

type ChartProps = {
  fieldToShow: string;
  // keys: string[];
  data: AccountChartData[];
  width: number;
  height: number;
} & Pick<Props, "type">;

const formatPercentGain = (
  tooltipData: TooltipData<{ [key: string]: number }> | undefined,
  startValue: number | undefined,
  readCurrentValueFn: Function,
): string => {
  const username: string | undefined = tooltipData?.nearestDatum?.key;
  if (!username || !startValue) {
    return "N/A";
  }

  const currentEquity = readCurrentValueFn(tooltipData?.nearestDatum?.datum);
  if (!currentEquity) {
    return "N/A";
  }

  const percent = (currentEquity - startValue) / startValue;
  return Number(percent * 100).toFixed(2);
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return timeFormat("%d/%m/%y, %H:%M")(date);
};

const renderTooltipFn =
  (
    startEquityValue: number | undefined,
    accessors: { xAccessor: Function; yAccessor: Function },
  ) =>
  ({
    tooltipData,
    colorScale,
  }: RenderTooltipParams<{ [key: string]: number }>): ReactNode => (
    <div>
      <div
        style={{
          marginBottom: 5,
          // @ts-ignore -- wtf
          color: colorScale(tooltipData?.nearestDatum?.key),
        }}
      >
        Equity (
        {formatPercentGain(tooltipData, startEquityValue, accessors.yAccessor)}
        %)
      </div>
      {Math.round(accessors.yAccessor(tooltipData?.nearestDatum?.datum))}$ @{" "}
      {formatDate(accessors.xAccessor(tooltipData?.nearestDatum?.datum))}
    </div>
  );

const renderTooltipMarginFn =
  (accessors: { xAccessor: Function; yAccessor: Function }) =>
  ({
    tooltipData,
    colorScale,
  }: RenderTooltipParams<{ [key: string]: number }>): ReactNode => (
    <div>
      <div
        style={{
          marginBottom: 5,
          // @ts-ignore -- wtf
          color: colorScale(tooltipData?.nearestDatum?.key),
        }}
      >
        Maintenance Margin
      </div>
      {Number(accessors.yAccessor(tooltipData?.nearestDatum?.datum)).toFixed(2)}
      % @ {formatDate(accessors.xAccessor(tooltipData?.nearestDatum?.datum))}
    </div>
  );

function Chart({ height, type, width, data, fieldToShow }: ChartProps) {
  if (width < 10 || data.length < 1) {
    return;
  }

  const equityAccessors = {
    xAccessor: (d: AccountChartData) => d.insertedAt,
    yAccessor: (d: AccountChartData) =>
      fieldToShow === "sum" ? d[fieldToShow] : d[fieldToShow].equityUsd,
  };
  const marginAccessors = {
    xAccessor: (d: AccountChartData) => d.insertedAt,
    yAccessor: (d: AccountChartData) => d[fieldToShow].maintenanceMarginPercent,
  };

  const startEquityValue = equityAccessors.yAccessor(data[0]);

  const areaBuilder = () =>
    type === "equity" ? (
      <AreaSeries
        dataKey={fieldToShow}
        data={data}
        {...equityAccessors}
        fillOpacity={0.4}
        curve={curveCardinal}
      />
    ) : (
      <AreaSeries
        dataKey={fieldToShow}
        data={data}
        {...marginAccessors}
        fillOpacity={0.4}
        curve={curveCardinal}
      />
    );

  return (
    <XYChart
      height={height}
      width={width}
      xScale={{ type: "band" }}
      yScale={{ type: type === "margin" ? "linear" : "log" }}
    >
      <AnimatedAxis
        animationTrajectory="outside"
        orientation="bottom"
        numTicks={5}
        tickFormat={formatDate}
      />
      <AnimatedAxis
        animationTrajectory="outside"
        label={"Equity ($)"}
        orientation="left"
        numTicks={4}
      />
      {areaBuilder()}
      <AnimatedGrid columns={false} numTicks={4} />
      <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={
          type === "equity"
            ? renderTooltipFn(startEquityValue, equityAccessors)
            : renderTooltipMarginFn(marginAccessors)
        }
      />
    </XYChart>
  );
}

export type AccountChartData = Pick<
  Account,
  "insertedAt" | "maintenanceMarginPercent" | "initialMarginPercent"
> &
  Record<string, number> & {
    sum: number;
  };

type Props =
  | {
      data: AccountChartData[];
      type: "margin";
      username: string;
    }
  | {
      data: AccountChartData[];
      type: "equity";
      username: "sum" | string;
    };

export default function AccountsGroupChartHOF({ data, username, type }: Props) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <Chart
          key={username}
          fieldToShow={username}
          data={data}
          width={width}
          height={height}
          type={type}
        />
      )}
    </ParentSize>
  );
}
