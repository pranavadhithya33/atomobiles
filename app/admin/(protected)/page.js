"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/admin/StatCard";
import { 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ShoppingBag
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

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

function formatTimeAgo(dateString) {
  if (!dateString) return "unknown time";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " days ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hours ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " mins ago";
  return "just now";
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartFilter, setChartFilter] = useState("7D");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsRes = await fetch("/api/admin/stats");
      const statsJson = await statsRes.json();
      if (!statsJson.success) throw new Error(statsJson.error || "Failed to fetch stats");

      const ordersRes = await fetch("/api/admin/orders");
      const ordersJson = await ordersRes.json();
      if (!ordersJson.success) throw new Error(ordersJson.error || "Failed to fetch orders");

      setStats(statsJson.data);
      setOrders(ordersJson.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">Loading store analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl max-w-xl mx-auto my-8 text-center">
        <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Failed to Load Dashboard</h3>
        <p className="text-sm text-red-600 dark:text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Process data for charts
  // 1. Line chart: Revenue vs Orders (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      date: d,
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: 0,
      orders: 0
    };
  }).reverse();

  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    const day = last7Days.find(d => d.date.toDateString() === orderDate.toDateString());
    if (day) {
      day.revenue += order.final_price || 0;
      day.orders += 1;
    }
  });

  // 2. Pie chart: Sales by Category
  const categoryCounts = {};
  orders.forEach(order => {
    if (Array.isArray(order.items)) {
      order.items.forEach(item => {
        const cat = item.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + (item.quantity || 1);
      });
    }
  });

  const categoryData = Object.entries(categoryCounts).length > 0 
    ? Object.entries(categoryCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }))
    : [{ name: "No Sales", value: 1 }];

  // 3. Activity feed: Latest 5 orders
  const recentActivities = orders.slice(0, 5).map(o => ({
    id: o.id,
    text: `Order placed by ${o.full_name || 'Guest'} for ₹${(o.final_price || 0).toLocaleString()}`,
    time: formatTimeAgo(o.created_at),
    type: "order"
  }));

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
          value={(stats?.totalRevenue || 0).toLocaleString()} 
          prefix="₹"
          trend={0} 
          trendLabel="vs last 30 days"
          icon={DollarSign}
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          trend={0} 
          trendLabel="vs last 30 days"
          icon={ShoppingBag}
        />
        <StatCard 
          title="Pending Orders" 
          value={stats?.pendingOrders || 0} 
          trend={0} 
          isNegativeTrend={true}
          trendLabel="requires action"
          icon={AlertTriangle}
        />
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts || 0} 
          trend={0}
          trendLabel="in catalog"
          icon={Package}
        />
      </div>

      {/* Middle Row: Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#18181b] p-6 rounded-[20px] border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue vs Orders (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(value) => `₹${value}`} />
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
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Items</span>
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
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-sm text-gray-500 dark:text-gray-400 text-center">No recent activities found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
