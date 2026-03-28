"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Banknote, Receipt, PiggyBank, FileCheck, Calculator, FileText, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/income",      label: "Income",       icon: Banknote },
  { href: "/expenses",    label: "Expenses",     icon: Receipt },
  { href: "/investments", label: "Investments",  icon: PiggyBank },
  { href: "/tds",         label: "TDS",          icon: FileCheck },
  { href: "/calculator",  label: "Calculator",   icon: Calculator },
  { href: "/report",      label: "ITR Report",   icon: FileText },
];

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("itr_user");
    if (stored) setUser(JSON.parse(stored));
  }, [path]); // re-read on every navigation

  function logout() {
    localStorage.removeItem("itr_user");
    router.push("/login");
  }

  // Don't show nav on login page
  if (path === "/login") return null;

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-blue-400 font-bold text-xl shrink-0">📋 ITR Auto</Link>
        <nav className="flex gap-1 flex-wrap">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all
                ${path === href
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              <Icon size={14} />{label}
            </Link>
          ))}
        </nav>
        {user && (
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-gray-800 transition shrink-0">
            <LogOut size={14} /> Logout
          </button>
        )}
      </div>
    </header>
  );
}
