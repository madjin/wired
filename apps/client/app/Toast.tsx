"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("react-hot-toast").then((mod) => mod.Toaster));

export default function Toast() {
  return <Toaster position="bottom-center" />;
}
