"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, LayoutDashboard, Stethoscope, AlertTriangle, FileText, Activity, User, Settings, Stethoscope as SymptomIcon, CalendarClock, GitBranch, Pill, FlaskConical, LogOut, ShieldAlert } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    {
      section: t("nav.main"),
      items: [
        { name: t("nav.medrelay"), href: "/", icon: Sparkles },
        { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      section: t("nav.services"),
      items: [
        { name: t("nav.triage"), href: "/triage", icon: SymptomIcon },
        { name: t("nav.consultation"), href: "/consultation", icon: Stethoscope },
        { name: t("nav.diagnostics"), href: "/diagnostics", icon: FlaskConical },
        { name: t("nav.appointments"), href: "/appointments", icon: CalendarClock },
        { name: t("nav.emergency"), href: "/emergency", icon: AlertTriangle },
        { name: "Report & Grievances", href: "/report", icon: ShieldAlert },
      ]
    },
    {
      section: t("nav.myhealth"),
      items: [
        { name: t("nav.records"), href: "/records", icon: FileText },
        { name: t("nav.referrals"), href: "/referrals", icon: GitBranch },
        { name: t("nav.availability"), href: "/availability", icon: Pill },
      ]
    },
    {
      section: t("nav.tools"),
      items: [
        { name: t("nav.profile"), href: "/profile", icon: User },
        { name: t("nav.settings"), href: "/settings", icon: Settings },
      ]
    }
  ]

  return (
    <aside className="w-64 bg-slate-50/50 border-r border-slate-100 hidden md:flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <img src="/vercel.svg" alt="MedRelay" className="w-8 h-8 shrink-0" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">Med<span className="text-teal-600">Relay</span></span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6 px-4 flex flex-col justify-between">
        <nav className="space-y-6">
          {navItems.map((group, i) => (
            <div key={i}>
              <div className="px-4 text-[13px] font-semibold text-slate-900 mb-3 tracking-wide">{group.section}</div>
              <div className="space-y-1">
                {group.items.map((item, j) => {
                  const isActive = pathname === item.href
                  const isEmergency = item.name === t("nav.emergency")
                  const Icon = item.icon
                  return (
                    <Link 
                      key={j} 
                      href={item.href} 
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 ${
                        isActive 
                          ? isEmergency ? "bg-red-600 text-white font-medium shadow-md shadow-red-200/50" : "bg-slate-900 text-white font-medium shadow-md shadow-slate-200/50" 
                          : isEmergency ? "text-red-600 hover:bg-red-50 font-medium" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : isEmergency ? "text-red-500" : "text-slate-500"} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="pt-6 border-t border-slate-200/60 mt-6">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-full text-red-600 hover:bg-red-50 font-semibold transition-all duration-200"
          >
            <LogOut size={18} className="text-red-500" />
            <span className="text-sm">Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
