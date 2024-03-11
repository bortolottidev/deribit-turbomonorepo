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
};

const formatPercentGain = (
  tooltipData: TooltipData<{ [key: string]: number }> | undefined,
  startValue: number | undefined,
): string => {
  const username: string | undefined = tooltipData?.nearestDatum?.key;
  if (!username || !startValue) {
    return "N/A";
  }

  const currentEquity = tooltipData?.nearestDatum?.datum[username];
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
        {tooltipData?.nearestDatum?.key} (
        {formatPercentGain(tooltipData, startEquityValue)}%)
      </div>
      {Math.round(accessors.yAccessor(tooltipData?.nearestDatum?.datum))}$ @{" "}
      {formatDate(accessors.xAccessor(tooltipData?.nearestDatum?.datum))}
    </div>
  );

function Chart({ height, width, data, fieldToShow }: ChartProps) {
  if (width < 10 || data.length < 1) {
    return;
  }

  const accessors = {
    xAccessor: (d: AccountChartData) => d.insertedAt,
    yAccessor: (d: AccountChartData) => d[fieldToShow],
  };
  const anotherAccessors = {
    xAccessor: (d: AccountChartData) => d.insertedAt,
    yAccessor: (d: AccountChartData) => 1,
  };

  const startEquityValue = data[0]![fieldToShow];

  return (
    <XYChart
      height={height}
      width={width}
      xScale={{ type: "band" }}
      yScale={{ type: "log" }}
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
      <AnimatedGrid columns={false} numTicks={4} />
      <AreaSeries
        dataKey={fieldToShow}
        data={data}
        {...accessors}
        fillOpacity={0.4}
        curve={curveCardinal}
      />
      <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={renderTooltipFn(startEquityValue, accessors)}
      />
    </XYChart>
  );
}

export type AccountChartData = Pick<Account, "insertedAt"> &
  Record<string, number> & {
    sum: number;
  };

export default function AccountsGroupChartHOF({
  data,
  username,
}: {
  data: AccountChartData[];
  username: "sum" | string;
}) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <Chart
          key={username}
          fieldToShow={username}
          data={data}
          width={width}
          height={height}
        />
      )}
    </ParentSize>
  );
}
