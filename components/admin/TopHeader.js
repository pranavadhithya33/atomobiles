"use client";

import { Search, Bell, Moon, Sun, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminHeader({ user }) {
  const [theme, setTheme] = useState("light");

  // Simple client-side theme toggle logic
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#09090b]"></span>
        </button>

        {/* Profile Dropdown Trigger (simplified) */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200 dark:border-gray-800">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none mb-1">
              {user?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">
              Super Admin
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
