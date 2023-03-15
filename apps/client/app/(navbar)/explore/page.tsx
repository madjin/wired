import { Metadata } from "next";

import Search from "./Search";
import Spaces from "./Spaces";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore",
};

export default function Explore() {
  return (
    <div className="flex justify-center">
      <div className="max-w-content mx-4 flex flex-col items-center space-y-8 py-8">
        <div className="text-center text-3xl font-black">Explore</div>

        <Search />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* @ts-expect-error Server Component */}
          <Spaces />
        </div>
      </div>
    </div>
  );
}
