"use client";

import { ActivityLogTable } from "./_components/log-table";
import { ActivityLogHeader } from "./_components/log-header";
import React from "react";

export default function ActivityLogPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-between">
        <ActivityLogHeader />
      </div>
      <ActivityLogTable />
    </div>
  );
}
