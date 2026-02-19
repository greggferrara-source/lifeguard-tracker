import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className={`absolute inset-0 opacity-[0.03] ${gradient}`} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>
              )}
            </div>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}