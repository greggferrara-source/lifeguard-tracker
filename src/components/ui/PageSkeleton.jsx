import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Generic stat card skeleton — 4-up grid */
export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/** A row of list items (cards) */
export function ListRowsSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Table skeleton */
export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-50 last:border-0 px-4 py-3 flex gap-6 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-3 ${j === 0 ? "w-32" : j === 1 ? "w-24" : "w-16"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Dashboard page skeleton */
export function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <StatCardsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
      <ListRowsSkeleton count={4} />
    </div>
  );
}

/** Employee grid skeleton */
export function EmployeeGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Incident / log list skeleton */
export function IncidentListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Compliance module card skeleton */
export function ComplianceSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <StatCardsSkeleton count={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-14 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}