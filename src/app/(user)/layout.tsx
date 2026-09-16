"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { OfflineBanner } from "@/components/layout/offline-banner"
import { ConsentBanner } from "@/components/layout/consent-banner"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Bell, User, Globe, KeyRound, Copy, Check, ShieldAlert } from "lucide-react"
import { useLanguage, LANGUAGES } from "@/lib/i18n"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { lang, setLang, t } = useLanguage()
  const [patientCode, setPatientCode] = useState("PT-8891")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const code = localStorage.getItem("medrelay.user_unique_code") || "PT-8891"
    setPatientCode(code)
  }, [])

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(patientCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <OfflineBanner />
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder={t("header.search")} className="w-full bg-slate-50 border-none rounded-full pl-12 pr-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium placeholder:text-slate-400 placeholder:font-normal" />
              <div className="absolute right-4 text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-1 rounded">⌘F</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Patient Unique Code Badge */}
            <button 
              type="button"
              onClick={handleCopyCode}
              title="Click to copy your unique code for PHC/Hospital visits"
              className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-800 rounded-full px-3 py-1.5 transition-all text-xs font-semibold shadow-xs shrink-0 cursor-pointer group"
            >
              <KeyRound size={13} className="text-teal-600 group-hover:rotate-12 transition-transform" />
              <span className="text-[11px] text-teal-600 uppercase font-bold tracking-wider hidden md:inline">Patient Code:</span>
              <span className="font-mono font-bold text-teal-950">{patientCode}</span>
              {copied ? (
                <Check size={13} className="text-emerald-600 shrink-0" />
              ) : (
                <Copy size={13} className="text-teal-500 opacity-60 group-hover:opacity-100 shrink-0" />
              )}
            </button>

            {/* Quick Report Grievance Link */}
            <Link 
               href="/report" 
               title="Report unaccepted SOS or unresponsive PHC to Govt Command"
               className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-2 rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
            >
               <ShieldAlert size={14} className="text-amber-700" />
               <span>Report PHC / SOS</span>
            </Link>

            {/* Quick Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-full px-3 py-1.5 transition-colors">
              <Globe size={16} className="text-slate-500 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as typeof lang)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="text-slate-500 hover:text-slate-800 transition-colors relative p-1.5 rounded-full hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full"></span>
            </button>
            <Link 
              href="/login" 
              className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm overflow-hidden flex justify-center items-center hover:opacity-90 transition-opacity"
              title="Profile"
            >
              <User size={20} className="text-orange-600" />
            </Link>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-auto flex flex-col items-center">
          <div className="w-full max-w-4xl">
             <ConsentBanner />
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>

        {/* Floating Bottom-Right Emergency SOS Circle Button (High-Visibility Neon Emergency Styling) */}
        <Link 
          href="/emergency" 
          className="fixed bottom-6 right-6 z-50 group relative flex items-center justify-center cursor-pointer"
          title="1-Tap Emergency SOS Gateway"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-extrabold shadow-2xl shadow-red-600/60 ring-4 ring-red-500/40 hover:ring-red-400 hover:scale-110 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center border-2 border-red-400">
            <span className="text-lg leading-none mb-0.5 animate-bounce">🚨</span>
            <span className="text-[10px] font-black tracking-widest uppercase leading-none text-white drop-shadow-sm">SOS</span>
          </div>
        </Link>
      </main>
    </div>
  )
}
