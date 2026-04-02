import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import ShareDialog from "./ShareDialog";

export default function ShareButton({ recordType, recordId, recordLabel, variant = "outline", size = "sm", className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} className={`gap-1.5 ${className}`} onClick={() => setOpen(true)}>
        <Share2 className="w-3.5 h-3.5" />
        Share
      </Button>
      <ShareDialog
        open={open}
        onOpenChange={setOpen}
        recordType={recordType}
        recordId={recordId}
        recordLabel={recordLabel}
      />
    </>
  );
}