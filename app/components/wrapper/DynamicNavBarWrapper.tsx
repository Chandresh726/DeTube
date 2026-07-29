"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const NavBarWrapper = dynamic(() => import("./NavBarWrapper"), {
  ssr: false,
});

export default function DynamicNavBarWrapper({
  session,
  children,
}: {
  session: any;
  children: ReactNode;
}) {
  return <NavBarWrapper session={session}>{children}</NavBarWrapper>;
}
