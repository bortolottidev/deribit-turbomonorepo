"use client";

import { useMemo, useCallback } from "react";
import { AreaClosed, Line, Bar, LinePath } from "@visx/shape";
import { curveBasis, curveMonotoneX, curveNatural } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear, scaleRadial } from "@visx/scale";
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { max, extent, min } from "@visx/vendor/d3-array";
import { ParentSize } from "@visx/responsive";
import { EnrichedAccountSummaryData } from "../../types/account-summary";
import { AreaChartType, AreaProps } from "../../types/chart";
import {
  bisectDate,
  getDate,
  getEquityUsdValue,
  getEquityValue,
  getMargin,
  formatDate,
} from "./helper";

export const background = "#3b6978";
export const background2 = "#204051";
export const accentColor = "#edffea";
export const accentColorDark = "#75daad";
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: "1px solid white",
  color: "white",
};

type TooltipProps = EnrichedAccountSummaryData & {
  tooltipManteinanceMargin: number;
  tooltipEquityUsd: number;
};

const Chart = withTooltip<AreaProps, TooltipProps>(
  (props: AreaProps & WithTooltipProvidedProps<TooltipProps>) => {
    const {
      width,
      height,
      margin = { top: 0, right: 0, bottom: 0, left: 0 },
      showTooltip,
      hideTooltip,
      tooltipData,
      // tooltipTop = 0,
      tooltipLeft = 0,
      data,
      type,
    } = props;
    const { tooltipManteinanceMargin = 0, tooltipEquityUsd = 0 } =
      tooltipData || {};
    if (width < 10) return null;

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(data, getDate) as [Date, Date],
        }),
      [innerWidth, margin.left],
    );
    const equityScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [0, (max(data, getEquityValue) || 0) * 1.5],
          nice: true,
        }),
      [innerHeight, margin.top],
    );
    const equityUsdScale = useMemo(
      () =>
        scaleRadial({
          range: [innerHeight + margin.top, margin.top],
          domain: [
            (min(data, getEquityUsdValue) || 0) * 0.95,
            (max(data, getEquityUsdValue) || 0) * 1.02,
          ],
          nice: true,
        }),
      [innerHeight, margin.top],
    );
    const marginScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [0, 100],
          nice: true,
        }),
      [innerHeight, margin.top],
    );

    // tooltip handler
    const handleTooltip = useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>,
      ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        if (!d0) {
          console.error({ event, x0, index });
          throw new Error("Cannot get tooltip");
        }
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d =
            x0.valueOf() - getDate(d0).valueOf() >
            getDate(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: {
            tooltipManteinanceMargin: marginScale(getMargin(d)),
            tooltipEquityUsd: equityUsdScale(getEquityUsdValue(d)),
            ...d,
          },
          tooltipLeft: x,
          tooltipTop: equityScale(getEquityValue(d)),
        });
      },
      [showTooltip, equityScale, dateScale, marginScale],
    );

    if (type === "margin") {
      return (
        <div>
          <svg width={width} height={height}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="url(#area-background-gradient)"
              rx={14}
            />
            <LinearGradient
              id="area-background-gradient"
              from={background}
              to={background2}
            />
            <LinearGradient
              id="area-gradient"
              from={accentColor}
              to={accentColor}
              toOpacity={0.1}
            />
            <GridRows
              left={margin.left}
              scale={equityScale}
              width={innerWidth}
              strokeDasharray="1,3"
              stroke={accentColor}
              strokeOpacity={0}
              pointerEvents="none"
            />
            <GridColumns
              top={margin.top}
              scale={dateScale}
              height={innerHeight}
              strokeDasharray="1,3"
              stroke={accentColor}
              strokeOpacity={0.2}
              pointerEvents="none"
            />
            <AreaClosed<EnrichedAccountSummaryData>
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => marginScale(getMargin(d)) ?? 0}
              yScale={marginScale}
              strokeWidth={1}
              stroke="url(#area-gradient)"
              fill="url(#area-gradient)"
              curve={curveNatural}
            />
            <Bar
              x={margin.left}
              y={margin.top}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              rx={14}
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={hideTooltip}
            />
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft, y: margin.top }}
                  to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                  stroke={accentColorDark}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                <circle
                  cx={tooltipLeft}
                  cy={tooltipManteinanceMargin + 1}
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
                  cy={tooltipManteinanceMargin}
                  r={4}
                  fill={accentColorDark}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            )}
          </svg>
          {tooltipData && (
            <div>
              <TooltipWithBounds
                key={Math.random()}
                top={(tooltipManteinanceMargin ?? 0) - 50}
                left={tooltipLeft}
                style={tooltipStyles}
              >
                {`${Math.round(getMargin(tooltipData) * 100) / 100}%`}
              </TooltipWithBounds>
              <Tooltip
                top={innerHeight + margin.top - 14}
                left={tooltipLeft}
                style={{
                  ...defaultStyles,
                  minWidth: 72,
                  textAlign: "center",
                  transform: "translateX(-50%)",
                }}
              >
                {formatDate(getDate(tooltipData))}
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
            fill="url(#area-background-gradient)"
            rx={14}
          />
          <LinearGradient
            id="area-background-gradient"
            from={background}
            to={background2}
          />
          <LinearGradient
            id="area-gradient"
            from={accentColor}
            to={accentColor}
            toOpacity={0.1}
          />
          <GridRows
            left={margin.left}
            scale={equityScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0}
            pointerEvents="none"
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
          />
          <AreaClosed<EnrichedAccountSummaryData>
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => equityUsdScale(getEquityUsdValue(d)) ?? 0}
            yScale={equityUsdScale}
            strokeWidth={1}
            stroke="url(#area-gradient)"
            fill="url(#area-gradient)"
            curve={curveBasis}
          />
          <LinePath
            data={data}
            curve={curveMonotoneX}
            x={(dataPoint) => dateScale(getDate(dataPoint)) ?? 0}
            y={(dataPoint) => equityScale(getEquityValue(dataPoint)) ?? 0}
            stroke="#222"
            strokeWidth={1.5}
            strokeOpacity={0.8}
            strokeDasharray="1,2"
          />
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={hideTooltip}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={accentColorDark}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipEquityUsd + 1}
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
                cy={tooltipEquityUsd}
                r={4}
                fill={accentColorDark}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={innerHeight + margin.top + 45}
              left={tooltipLeft - 50}
              style={tooltipStyles}
            >
              {`${getEquityValue(tooltipData)} ₿`}
            </TooltipWithBounds>
            <TooltipWithBounds
              key={Math.random()}
              top={innerHeight + margin.top + 15}
              left={tooltipLeft - 50}
              style={tooltipStyles}
            >
              {`${Math.round(getEquityUsdValue(tooltipData) * 100) / 100} $`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin.top - 15}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                minWidth: 72,
                textAlign: "center",
                transform: "translateX(-50%)",
              }}
            >
              {formatDate(getDate(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  },
);

export default function AreaChartHOC({
  type,
  data,
}: {
  type: AreaChartType;
  data: EnrichedAccountSummaryData[];
}) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <Chart data={data} type={type} width={width} height={height} />
      )}
    </ParentSize>
  );
}
