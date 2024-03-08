import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Table Cash&Carry",
  description: "Enjoy cash&carry tables",
};

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
