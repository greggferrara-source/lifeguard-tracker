// Redirect to main Docs page — all content consolidated there
import { useEffect } from "react";
import { createPageUrl } from "@/utils";

export default function DocsUpdated() {
  useEffect(() => {
    window.location.replace(createPageUrl("Docs"));
  }, []);
  return null;
}