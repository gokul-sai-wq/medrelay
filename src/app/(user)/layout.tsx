"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { OfflineBanner } from "@/components/layout/offline-banner"
import { ConsentBanner } from "@/components/layout/consent-banner"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Bell, User, Globe, KeyRound, Copy, Check, ShieldAlert, Menu, X, Sparkles, LayoutDashboard, Stethoscope, AlertTriangle, FileText, CalendarClock, GitBranch, Pill, FlaskConical, LogOut, Stethoscope as SymptomIcon, Settings } from "lucide-react"
import { useLanguage, LANGUAGES } from "@/lib/i18n"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { lang, setLang, t } = useLanguage()
  const pathname = usePathname()
  const [patientCode, setPatientCode] = useState("PT-8891")
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const code = localStorage.getItem("medrelay.user_unique_code") || "PT-8891"
    setPatientCode(code)
  }, [])

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(patientCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const mobileNavGroups = [
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
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <Sidebar />

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <img src="/vercel.svg" alt="MedRelay" className="w-7 h-7 shrink-0" />
                <span className="text-lg font-extrabold tracking-tight text-slate-900 uppercase">Med<span className="text-teal-600">Relay</span></span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto py-5 px-4 space-y-6">
              {mobileNavGroups.map((group, i) => (
                <div key={i}>
                  <div className="px-3 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{group.section}</div>
                  <div className="space-y-1">
                    {group.items.map((item, j) => {
                      const isActive = pathname === item.href
                      const isEmergency = item.name === t("nav.emergency")
                      const Icon = item.icon
                      return (
                        <Link 
                          key={j} 
                          href={item.href} 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                            isActive 
                              ? isEmergency ? "bg-red-600 text-white font-bold" : "bg-slate-900 text-white font-bold" 
                              : isEmergency ? "text-red-600 hover:bg-red-50 font-medium" : "text-slate-700 hover:bg-slate-100 font-medium"
                          }`}
                        >
                          <Icon size={18} className={isActive ? "text-white" : isEmergency ? "text-red-500" : "text-slate-500"} />
                          <span className="text-sm">{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold"
                >
                  <LogOut size={18} className="text-red-500" />
                  <span className="text-sm">Logout</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <OfflineBanner />
        {/* Topbar */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-3 sm:px-8 sticky top-0 z-10 gap-2">
          
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu size={20} />
            </button>
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Med<span className="text-teal-600">Relay</span></span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative flex items-center w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder={t("header.search")} className="w-full bg-slate-50 border-none rounded-full pl-12 pr-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium placeholder:text-slate-400 placeholder:font-normal" />
              <div className="absolute right-4 text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-1 rounded">⌘F</div>
            </div>
          </div>

          {/* Header Controls (Patient Code, Language, Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Patient Unique Code Badge */}
            <button 
              type="button"
              onClick={handleCopyCode}
              title="Click to copy your unique code for PHC/Hospital visits"
              className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-800 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 transition-all text-xs font-semibold shadow-xs shrink-0 cursor-pointer group"
            >
              <KeyRound size={12} className="text-teal-600 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="text-[10px] sm:text-[11px] text-teal-600 uppercase font-bold tracking-wider hidden lg:inline">Patient Code:</span>
              <span className="font-mono font-bold text-[11px] sm:text-xs text-teal-950">{patientCode}</span>
              {copied ? (
                <Check size={12} className="text-emerald-600 shrink-0" />
              ) : (
                <Copy size={12} className="text-teal-500 opacity-60 group-hover:opacity-100 shrink-0" />
              )}
            </button>

            {/* Quick Report Grievance Link */}
            <Link 
               href="/report" 
               title="Report unaccepted SOS or unresponsive PHC to Govt Command"
               className="hidden xl:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-2 rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
            >
               <ShieldAlert size={14} className="text-amber-700" />
               <span>Report PHC / SOS</span>
            </Link>

            {/* Quick Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 transition-colors">
              <Globe size={14} className="text-slate-500 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as typeof lang)}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-0.5"
                aria-label="Select Language"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button className="text-slate-500 hover:text-slate-800 transition-colors relative p-1.5 rounded-full hover:bg-slate-100 shrink-0">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 border-2 border-white rounded-full"></span>
            </button>
            
            <Link 
              href="/login" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm overflow-hidden flex justify-center items-center hover:opacity-90 transition-opacity shrink-0"
              title="Profile"
            >
              <User size={18} className="text-orange-600" />
            </Link>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-3 sm:p-8 overflow-auto flex flex-col items-center">
          <div className="w-full max-w-4xl">
             <ConsentBanner />
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>

        {/* Floating Bottom-Right Emergency SOS Circle Button */}
        <Link 
          href="/emergency" 
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-600 text-white font-black shadow-2xl shadow-red-600/60 flex flex-col items-center justify-center ring-4 ring-red-500/30 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
          title="1-Tap Emergency SOS Gateway"
        >
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-red-600"></span>
          </span>
          <span className="text-lg sm:text-xl leading-none mb-0.5 group-hover:scale-110 transition-transform">🚨</span>
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase leading-none text-red-50">SOS</span>
        </Link>
      </main>
    </div>
  )
}
