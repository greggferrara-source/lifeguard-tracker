import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function OpenShiftsAlert({ count }) {
  if (count === 0) return null;
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {count} Open Shift{count > 1 ? "s" : ""} Need Coverage
            </p>
            <p className="text-xs text-amber-700/70 mt-0.5">
              Assign employees to fill these shifts
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}