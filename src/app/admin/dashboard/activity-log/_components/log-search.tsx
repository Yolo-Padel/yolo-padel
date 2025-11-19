"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface LogSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function LogSearch({
    searchValue,
    onSearchChange
}: LogSearchProps) {

      return (
        <div className="gap-4 py-4">
          <InputGroup>
            <InputGroupInput
              placeholder="Search"
              className="w-full"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
    )
}