
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { CourtModal } from "../admin/dashboard/court/components/court-modal";


export default function PreviewPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Court Modal Preview</h1>
        <Button onClick={() => setModalOpen(true)}>
          Open Court Modal
        </Button>
        
        {/* <CourtModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode="add"
          venueName="Slipi Padel Center"
        /> */}

        
        
      </div>
    </div>
  );
}
