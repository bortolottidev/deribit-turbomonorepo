"use client";

import { Group } from "@visx/group";
import { curveBasis, curveMonotoneX, curveNatural } from "@visx/curve";
import { LinePath } from "@visx/shape";
import { Threshold } from "@visx/threshold";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom, AxisRight } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { ParentSize } from "@visx/responsive";
import { SpreadFuture } from "../../types/future";
import { useMemo } from "react";
import {
  Margin,
  ThresholdChartProps,
  ThresholdLayoutProps,
} from "../../types/chart";
import {
  annualizedSpread,
  date,
  getPremiumSpreadUsd,
  instrumentPrice,
  perpetualPrice,
} from "./helper";
import { Trade } from "../../types/trade";

const background = "#f0f0f0";

const defaultMargin: Margin = { top: 30, right: 30, bottom: 40, left: 50 };

function Chart(props: ThresholdChartProps) {
  const { data, width, height, margin = defaultMargin, type } = props;
  if (width < 10) return null;
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: [Math.min(...data.map(date)), Math.max(...data.map(date))],
      }),
    [innerWidth, margin.left],
  );
  const futureSpreadPremiumScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
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
        range: [yMax, 0],
        domain: [
          Math.min(
            ...data.map((d) => Math.min(perpetualPrice(d), instrumentPrice(d))),
          ),
          Math.max(
            ...data.map((d) => Math.max(perpetualPrice(d), instrumentPrice(d))),
          ),
        ],
        nice: true,
      }),
    [margin.top, innerHeight],
  );
  const futureSpreadAnnualizedScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [
          Math.min(...data.map((d) => annualizedSpread(d))),
          Math.max(...data.map((d) => annualizedSpread(d))),
        ],
        nice: true,
      }),
    [margin.top, innerHeight],
  );

  if (type === "premium") {
    console.log(props.trades);
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
              width={xMax}
              height={yMax}
              stroke="#e0e0e0"
            />
            <GridColumns
              scale={dateScale}
              width={xMax}
              height={yMax}
              stroke="#e0e0e0"
            />
            <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
            <AxisBottom
              top={yMax}
              scale={dateScale}
              numTicks={width > 520 ? 10 : 5}
            />
            <AxisLeft scale={futureSpreadPremiumScale} />
            <text x={5} y={-5} fontSize={10}>
              Premium $
            </text>
            {/* <text x={xMax - 70} y={-5} fontSize={10}> */}
            {/*   Spread $ */}
            {/* </text> */}
            {/* <AxisRight scale={futureSpreadAnnualizedScale} left={xMax} /> */}
            <Threshold<SpreadFuture>
              id={`${Math.random()}`}
              data={data}
              x={(d) => dateScale(date(d)) ?? 0}
              y0={() => futureSpreadPremiumScale(0)}
              y1={(d) => futureSpreadPremiumScale(getPremiumSpreadUsd(d)) ?? 0}
              clipAboveTo={0}
              clipBelowTo={yMax}
              curve={curveMonotoneX}
              aboveAreaProps={{
                fill: "red",
                fillOpacity: 1,
              }}
              belowAreaProps={{
                fill: "green",
                fillOpacity: 0.6,
              }}
            />
            {/* <LinePath */}
            {/*   data={data} */}
            {/*   curve={curveNatural} */}
            {/*   x={(d) => dateScale(date(d)) ?? 0} */}
            {/*   y={(d) => futureSpreadScale(instrumentPrice(d)) ?? 0} */}
            {/*   stroke="#222" */}
            {/*   strokeWidth={1.5} */}
            {/*   strokeOpacity={0.8} */}
            {/*   strokeDasharray="1,2" */}
            {/* /> */}
            <LinePath
              data={data}
              curve={curveNatural}
              x={(d) => dateScale(date(d)) ?? 0}
              y={(d) => futureSpreadScale(getPremiumSpreadUsd(d)) ?? 0}
              stroke="#222"
              strokeOpacity={1}
              strokeWidth={1.5}
            />
            {/* <LinePath */}
            {/*   data={data} */}
            {/*   x={(d) => dateScale(date(d)) ?? 0} */}
            {/*   y={(d) => futureSpreadAnnualizedScale(annualizedSpread(d)) ?? 0} */}
            {/*   curve={curveBasis} */}
            {/*   stroke="#000000" */}
            {/*   strokeOpacity={0.7} */}
            {/*   strokeDasharray={0.6} */}
            {/*   strokeWidth={1} */}
            {/* /> */}
          </Group>
        </svg>
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
            width={xMax}
            height={yMax}
            stroke="#e0e0e0"
          />
          <GridColumns
            scale={dateScale}
            width={xMax}
            height={yMax}
            stroke="#e0e0e0"
          />
          <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
          <AxisBottom
            top={yMax}
            scale={dateScale}
            numTicks={width > 520 ? 10 : 5}
          />
          <AxisLeft scale={futureSpreadScale} />
          <text x={xMax - 70} y={-5} fontSize={10}>
            % Annualized
          </text>
          <AxisRight scale={futureSpreadAnnualizedScale} left={xMax} />
          <text x={5} y={-5} fontSize={10}>
            Spread on {data[0]?.instrument}
          </text>
          <Threshold<SpreadFuture>
            id={`${Math.random()}`}
            data={data}
            x={(d) => dateScale(date(d)) ?? 0}
            y0={(d) => futureSpreadScale(perpetualPrice(d)) ?? 0}
            y1={(d) => futureSpreadScale(instrumentPrice(d)) ?? 0}
            clipAboveTo={0}
            clipBelowTo={yMax}
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
}

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
