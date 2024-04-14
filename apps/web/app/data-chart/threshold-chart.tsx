"use client";

import withTooltip, {
  WithTooltipProvidedProps,
} from "@visx/tooltip/lib/enhancers/withTooltip";
import { Group } from "@visx/group";
import { curveBasis, curveMonotoneX, curveNatural } from "@visx/curve";
import { Tooltip, defaultStyles } from "@visx/tooltip";
import { AreaClosed, Bar, Line, LinePath } from "@visx/shape";
import { Threshold } from "@visx/threshold";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom, AxisRight } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { ParentSize } from "@visx/responsive";
import { SpreadFuture } from "../../types/future";
import { useCallback, useMemo } from "react";
import {
  Margin,
  ThresholdChartProps,
  ThresholdLayoutProps,
} from "../../types/chart";
import {
  annualizedSpread,
  bisectDate,
  date,
  formatDate,
  getPremiumSpreadUsd,
  instrumentPrice,
  perpetualPrice,
} from "./helper";
import { localPoint } from "@visx/event";
import Link from "next/link";
import { TooltipWithBounds } from "@visx/tooltip";

const background = "#f0f0f0";
const accentColorDark = "#75daad";

const defaultMargin: Margin = { top: 30, right: 30, bottom: 40, left: 50 };
const Chart = withTooltip<ThresholdChartProps, SpreadFuture>(
  (props: ThresholdChartProps & WithTooltipProvidedProps<SpreadFuture>) => {
    // function Chart(props: ThresholdChartProps) {
    const {
      data,
      width,
      height,
      margin = defaultMargin,
      type,
      tooltipLeft = 0,
      tooltipTop = 0,
      hideTooltip,
      showTooltip,
      tooltipData,
    } = props;
    if (width < 10) return null;
    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime<number>({
          range: [0, innerWidth],
          domain: [Math.min(...data.map(date)), Math.max(...data.map(date))],
        }),
      [innerWidth, margin.left],
    );
    const futureSpreadPremiumScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [innerHeight, 0],
          domain: [
            Math.min(...data.map(getPremiumSpreadUsd)),
            Math.max(...data.map(getPremiumSpreadUsd)),
          ],
          nice: true,
        }),
      [margin.top, innerHeight],
    );
    const futureSpreadScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [innerHeight, 0],
          domain: [
            Math.min(
              ...data.map((d) =>
                Math.min(perpetualPrice(d), instrumentPrice(d)),
              ),
            ),
            Math.max(
              ...data.map((d) =>
                Math.max(perpetualPrice(d), instrumentPrice(d)),
              ),
            ),
          ],
          nice: true,
        }),
      [margin.top, innerHeight],
    );
    const futureSpreadAnnualizedScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [innerHeight, 0],
          domain: [
            Math.min(...data.map((d) => annualizedSpread(d))),
            Math.max(...data.map((d) => annualizedSpread(d))),
          ],
          nice: true,
        }),
      [margin.top, innerHeight],
    );

    const handleTooltip = useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>,
      ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x - margin.left);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && date(d1)) {
          d =
            x0.valueOf() - date(d0).valueOf() >
            date(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x - margin.left,
          tooltipTop: futureSpreadPremiumScale(getPremiumSpreadUsd(d)),
        });
      },
      [showTooltip, futureSpreadPremiumScale, dateScale],
    );

    let instrumentLink = "https://www.deribit.com";
    const [firstEntry] = data;
    if (firstEntry) {
      const [, futureName] = firstEntry.instrument.split("BTC-");
      instrumentLink =
        "https://www.deribit.com/futures-spreads/BTC-FS-" +
        futureName +
        "_PERP";
    }
    if (type === "premium") {
      return (
        <div>
          <svg width={width} height={height}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={background}
              rx={14}
            />
            <Group left={margin.left} top={margin.top}>
              <GridRows
                scale={futureSpreadPremiumScale}
                width={innerWidth}
                height={innerHeight}
                stroke="#e0e0e0"
              />
              <GridColumns
                scale={dateScale}
                width={innerWidth}
                height={innerHeight}
                stroke="#e0e0e0"
              />
              <line
                x1={innerWidth}
                x2={innerWidth}
                y1={0}
                y2={innerHeight}
                stroke="#e0e0e0"
              />
              <AxisBottom
                top={innerHeight}
                scale={dateScale}
                numTicks={width > 520 ? 10 : 5}
              />
              <AxisLeft scale={futureSpreadPremiumScale} />
              <text x={5} y={-5} fontSize={10}>
                <Link href={instrumentLink} target="_blank">
                  Premium $ on {data[0]?.instrument}
                </Link>
              </text>
              {tooltipData && (
                <g>
                  <Line
                    from={{ x: tooltipLeft, y: -margin.top }}
                    to={{ x: tooltipLeft, y: height }}
                    stroke={accentColorDark}
                    strokeWidth={2}
                    pointerEvents="none"
                    strokeDasharray="5,2"
                  />
                  <circle
                    cx={tooltipLeft}
                    cy={tooltipTop + 1}
                    r={4}
                    fill="black"
                    fillOpacity={0.1}
                    stroke="black"
                    strokeOpacity={0.1}
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                  <circle
                    cx={tooltipLeft}
                    cy={tooltipTop}
                    r={4}
                    fill={accentColorDark}
                    stroke="white"
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                </g>
              )}
              <AreaClosed<SpreadFuture>
                data={data}
                x={(d) => dateScale(date(d)) ?? 0}
                y={(d) => futureSpreadPremiumScale(getPremiumSpreadUsd(d)) ?? 0}
                yScale={futureSpreadPremiumScale}
                strokeWidth={1}
                stroke="green"
                fillOpacity={0.7}
                fill="green"
                curve={curveMonotoneX}
              />
              <Bar
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                rx={14}
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onTouchEnd={hideTooltip}
                onMouseEnter={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={hideTooltip}
              />
              <LinePath
                data={data}
                curve={curveNatural}
                x={(d) => dateScale(date(d)) ?? 0}
                y={(d) => futureSpreadScale(getPremiumSpreadUsd(d)) ?? 0}
                stroke="#222"
                strokeOpacity={1}
                strokeWidth={1.5}
              />
            </Group>
          </svg>
          {tooltipData && (
            <div>
              <TooltipWithBounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft + margin.left}
                style={{
                  ...defaultStyles,
                  textAlign: "center",
                }}
              >
                {tooltipData.spreadUsd}$
              </TooltipWithBounds>
              <Tooltip
                top={innerHeight + margin.top}
                left={tooltipLeft + margin.left}
                style={{
                  ...defaultStyles,
                  textAlign: "center",
                }}
              >
                {formatDate(tooltipData.insertedAt)}
              </Tooltip>
            </div>
          )}
        </div>
      );
    }
    return (
      <div>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={background}
            rx={14}
          />
          <Group left={margin.left} top={margin.top}>
            <GridRows
              scale={futureSpreadScale}
              width={innerWidth}
              height={innerHeight}
              stroke="#e0e0e0"
            />
            <GridColumns
              scale={dateScale}
              width={innerWidth}
              height={innerHeight}
              stroke="#e0e0e0"
            />
            <line
              x1={innerWidth}
              x2={innerWidth}
              y1={0}
              y2={innerHeight}
              stroke="#e0e0e0"
            />
            <AxisBottom
              top={innerHeight}
              scale={dateScale}
              numTicks={width > 520 ? 10 : 5}
            />
            <AxisLeft scale={futureSpreadScale} />
            <text x={innerWidth - 70} y={-5} fontSize={10}>
              % Annualized
            </text>
            <AxisRight scale={futureSpreadAnnualizedScale} left={innerWidth} />
            <text x={5} y={-5} fontSize={10}>
              <Link href={instrumentLink} target="_blank">
                Spread on {data[0]?.instrument}
              </Link>
            </text>
            <Threshold<SpreadFuture>
              id={`${Math.random()}`}
              data={data}
              x={(d) => dateScale(date(d)) ?? 0}
              y0={(d) => futureSpreadScale(perpetualPrice(d)) ?? 0}
              y1={(d) => futureSpreadScale(instrumentPrice(d)) ?? 0}
              clipAboveTo={0}
              clipBelowTo={innerHeight}
              curve={curveNatural}
              aboveAreaProps={{
                fill: "red",
                fillOpacity: 1,
              }}
              belowAreaProps={{
                fill: "green",
                fillOpacity: 0.6,
              }}
            />
            <LinePath
              data={data}
              curve={curveNatural}
              x={(d) => dateScale(date(d)) ?? 0}
              y={(d) => futureSpreadScale(instrumentPrice(d)) ?? 0}
              stroke="#222"
              strokeWidth={1.5}
              strokeOpacity={0.8}
              strokeDasharray="1,2"
            />
            <LinePath
              data={data}
              curve={curveNatural}
              x={(d) => dateScale(date(d)) ?? 0}
              y={(d) => futureSpreadScale(perpetualPrice(d)) ?? 0}
              stroke="#222"
              strokeOpacity={1}
              strokeWidth={1.5}
            />
            <LinePath
              data={data}
              x={(d) => dateScale(date(d)) ?? 0}
              y={(d) => futureSpreadAnnualizedScale(annualizedSpread(d)) ?? 0}
              curve={curveBasis}
              stroke="#000000"
              strokeOpacity={0.7}
              strokeDasharray={0.6}
              strokeWidth={1}
            />
          </Group>
        </svg>
      </div>
    );
  },
);

export default function ThresholdChartHOC(props: ThresholdLayoutProps) {
  const { margin = defaultMargin, data, trades, type } = props;
  return (
    <ParentSize>
      {({ width, height }) => (
        <Chart
          width={width}
          height={height}
          margin={margin}
          data={data}
          type={type}
          trades={trades}
        />
      )}
    </ParentSize>
  );
}
