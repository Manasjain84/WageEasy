import React from "react";
import { Navbar } from "@/components/Navbar";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar role="worker" orgName="Precision Manufacturing" userName="Ramesh Kumar" />
      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
