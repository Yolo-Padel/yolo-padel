"use client"

import {ActivityLogTable} from './_components/log-table';
import {ActivityLogHeader} from './_components/log-header';
import {LogSearch} from './_components/log-search';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

import React from 'react'

export default function ActivityLogPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-between">
        <ActivityLogHeader />
        {/* Hide Search Button 
        <LogSearch 
            searchValue=""
            onSearchChange={() => {}}/>
        */}
      </div>
      <div className="flex justify-end gap-2">
        {/* Hide Filter Button 
        <Button variant="outline" className="flex items-center gap-2">
          <Filter />
          Filter
        </Button>
        */}
      </div>
      <ActivityLogTable />
    </div>
  )
}
