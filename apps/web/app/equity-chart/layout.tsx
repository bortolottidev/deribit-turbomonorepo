import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equity Cash&Carry",
  description: "Enjoy cash&carry equity chart",
};

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
