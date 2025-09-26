"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to swap page
    router.push("/swap");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-accent">Redirecting to Swap...</p>
      </div>
    </div>
  );
};

export default Home;
