"use client";

import { useState } from "react";
import StatCard from "@/components/admin/StatCard";
import { 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock Data (will be replaced by React Query fetching from Supabase)
const revenueData = [
  { name: "Mon", revenue: 4000, orders: 24 },
  { name: "Tue", revenue: 3000, orders: 18 },
  { name: "Wed", revenue: 5500, orders: 35 },
  { name: "Thu", revenue: 4500, orders: 28 },
  { name: "Fri", revenue: 6000, orders: 40 },
  { name: "Sat", revenue: 8000, orders: 55 },
  { name: "Sun", revenue: 7500, orders: 48 },
];

const categoryData = [
  { name: "Smartphones", value: 45 },
  { name: "Laptops", value: 30 },
  { name: "Accessories", value: 15 },
  { name: "Tablets", value: 10 },
];
const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

const recentActivity = [
  { id: 1, text: "User John Doe placed Order #1029", time: "10 mins ago", type: "order" },
  { id: 2, text: "Product 'iPhone 15 Pro' stock changed to 0", time: "1 hour ago", type: "alert" },
  { id: 3, text: "New customer sign-up: sarah.smith@example.com", time: "2 hours ago", type: "user" },
  { id: 4, text: "Order #1025 was marked as Shipped", time: "3 hours ago", type: "order" },
  { id: 5, text: "Payment of $1,299 captured via Stripe", time: "5 hours ago", type: "payment" },
];

export default function AdminDashboard() {
  const [chartFilter, setChartFilter] = useState("7D");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your store&apos;s performance.</p>
        </div>
        <div className="flex gap-2">
          {["Today", "7D", "30D", "1Y"].map(filter => (
            <button
              key={filter}
              onClick={() => setChartFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartFilter === filter 
                ? "bg-blue-600 text-white shadow-sm" 
                : "bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Gross Revenue" 
          value="45,231" 
          prefix="$"
          trend={12.5} 
          trendLabel="vs last 30 days"
          icon={DollarSign}
        />
        <StatCard 
          title="Active Orders" 
          value="142" 
          trend={5.2} 
          trendLabel="vs last 30 days"
          icon={Package}
        />
        <StatCard 
          title="New Customers" 
          value="89" 
          trend={-2.4} 
          isNegativeTrend={true}
          trendLabel="vs last 30 days"
          icon={Users}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value="12" 
          trend={15.0}
          isNegativeTrend={true} // High low stock is bad
          trendLabel="vs last week"
          icon={AlertTriangle}
        />
      </div>

      {/* Middle Row: Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#18181b] p-6 rounded-[20px] border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue vs Orders</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(value) => `$${value}`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'var(--bg-card)' }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: 'var(--bg-card)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-[20px] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sales by Category</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">100%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Sales</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Activity Feed */}
      <div className="bg-white dark:bg-[#18181b] rounded-[20px] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                activity.type === 'order' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                activity.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
              }`}>
                {activity.type === 'order' ? <Package className="w-5 h-5" /> :
                 activity.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                 activity.type === 'payment' ? <DollarSign className="w-5 h-5" /> :
                 <Users className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
