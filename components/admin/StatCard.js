"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, prefix = "", suffix = "", trend, trendLabel, icon: Icon, isNegativeTrend }) {
  return (
    <div className="bg-white dark:bg-[#18181b] p-6 rounded-[20px] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
      {/* Decorative gradient blur on hover */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[20px] pointer-events-none" />
      
      <div className="relative flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {prefix}{value}{suffix}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-md ${
              isNegativeTrend
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500"
            }`}
          >
            {isNegativeTrend ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
