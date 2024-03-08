import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart Cash&Carry",
  description: "Enjoy cash&carry chart",
};

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
