"use client"

import { useState, useEffect } from "react"
import { Terminal, ShieldAlert, Cpu, Network, Database, RefreshCw, AlertTriangle, Download, Search, CheckCircle2, Pause, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const INITIAL_LOGS = [
  { id: "L1", timestamp: "2026-09-15 00:19:41", level: "INFO", source: "AI_DIAGNOSIS", message: "Patient symptom analysis complete (Pondicherry Triage). Processing time: 142ms. Confidence: 94%." },
  { id: "L2", timestamp: "2026-09-15 00:18:05", level: "INFO", source: "ABDM_GATEWAY", message: "ABHA ID verification successful for citizen in Villianur PHC. Token issued." },
  { id: "L3", timestamp: "2026-09-15 00:16:12", level: "WARN", source: "HOSP_API_SYNC", message: "Bed capacity sync delayed by 850ms from Indira Gandhi Govt Hospital Pondicherry." },
  { id: "L4", timestamp: "2026-09-15 00:12:00", level: "ERROR", source: "AUTH_GATEWAY", message: "Failed login attempt detected from IP 10.42.18.5 (Location: Lawspet Sub-center node)." },
  { id: "L5", timestamp: "2026-09-15 00:08:30", level: "INFO", source: "EMERGENCY_SOS", message: "Dual-dispatch alert dispatched to Villianur PHC & 108 Ambulance Unit 4." },
  { id: "L6", timestamp: "2026-09-15 00:05:00", level: "CRITICAL", source: "STOCK_ALERT", message: "Anti-Snake Venom stock dropped below 15% threshold at Villianur PHC Pondicherry." },
  { id: "L7", timestamp: "2026-09-15 00:01:22", level: "INFO", source: "SYSTEM", message: "Database automated backup completed successfully. Storage: Puducherry Regional Depot." },
  { id: "L8", timestamp: "2026-09-14 23:55:00", level: "INFO", source: "VIDEO_RTC", message: "Doctor-Patient WebRTC stream established (Dr. Sharma - Bahour PHC). Bitrate: 4200kbps." },
]

export default function AdminLogs() {
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [filterLevel, setFilterLevel] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLiveTail, setIsLiveTail] = useState(false)
  const [exportDownloaded, setExportDownloaded] = useState(false)

  // Live Tail effect
  useEffect(() => {
    if (!isLiveTail) return

    const sampleSources = ["AI_DIAGNOSIS", "ABDM_GATEWAY", "EMERGENCY_SOS", "HOSP_API_SYNC", "SYSTEM"]
    const sampleLevels = ["INFO", "INFO", "WARN", "INFO", "ERROR"]
    const sampleMsgs = [
      "ASHA worker submitted maternal screening report (Bahour PHC).",
      "ABDM Health Repository sync complete (IGGGH Pondicherry).",
      "Ambulance Unit 3 GPS packet received. Telemetry nominal.",
      "WhatsApp simulation webhook payload delivered to citizen.",
      "Inventory auto-route order validated by Central Medical Depot."
    ]

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * sampleMsgs.length)
      const now = new Date()
      const timeStr = now.toISOString().replace('T', ' ').substring(0, 19)

      const newLog = {
        id: `L-${Date.now()}`,
        timestamp: timeStr,
        level: sampleLevels[randomIndex],
        source: sampleSources[randomIndex],
        message: sampleMsgs[randomIndex]
      }

      setLogs(prev => [newLog, ...prev.slice(0, 49)])
    }, 2000)

    return () => clearInterval(interval)
  }, [isLiveTail])

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "medrelay-system-logs-pondicherry.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()

    setExportDownloaded(true)
    setTimeout(() => setExportDownloaded(false), 3000)
  }

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === "ALL" || log.level === filterLevel
    const matchesSearch = searchQuery === "" || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.timestamp.includes(searchQuery)
    return matchesLevel && matchesSearch
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Terminal className="text-slate-900" size={28} /> ABDM & System Audit Logs
          </h2>
          <p className="text-slate-500 text-sm mt-1">Real-time infrastructure monitoring, AI diagnosis trace & ABDM gateway logs in Pondicherry.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportLogs} 
            variant="outline" 
            className="text-slate-700 bg-white border-slate-300 hover:bg-slate-50"
          >
            {exportDownloaded ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-600" /> Exported JSON</span>
            ) : (
              <span className="flex items-center gap-1.5"><Download size={16} /> Export Logs</span>
            )}
          </Button>
          <Button 
            onClick={() => setIsLiveTail(!isLiveTail)}
            className={`${isLiveTail ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"} text-white`}
          >
            {isLiveTail ? (
              <span className="flex items-center gap-1.5"><Pause size={16} /> Pause Tail</span>
            ) : (
              <span className="flex items-center gap-1.5"><Play size={16} /> Live Tail</span>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-slate-100 text-slate-700 p-3 rounded-xl"><Cpu size={24} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">14%</div>
              <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">CPU Load (Puducherry Node)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-slate-100 text-slate-700 p-3 rounded-xl"><Database size={24} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">32%</div>
              <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">RAM Usage</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-teal-50 text-teal-700 p-3 rounded-xl"><Network size={24} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">14ms</div>
              <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">ABDM API Latency</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl"><ShieldAlert size={24} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">1</div>
              <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Active Security Audit</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "INFO", "WARN", "ERROR", "CRITICAL"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterLevel === lvl 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by keyword or source..." 
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-800"
          />
        </div>
      </div>

      {/* Live Log Terminal Output */}
      <Card className="border-0 shadow-xl bg-[#0d1117] overflow-hidden rounded-2xl">
        <CardHeader className="bg-[#161b22] border-b border-slate-800 py-3 px-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
            <Terminal size={14} className="text-teal-400" /> medrelay-puducherry-cluster-01
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex h-2 w-2 rounded-full ${isLiveTail ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
              {isLiveTail ? 'Live Tail Active' : 'Static Snapshot'}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 font-mono text-xs">
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto p-4 space-y-1.5 leading-relaxed">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                No system log events match filter "{filterLevel}" / search "{searchQuery}".
              </div>
            ) : filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-3 group hover:bg-[#1f242c] p-1.5 rounded transition-colors break-all">
                <span className="text-slate-500 shrink-0 select-none font-mono">[{log.timestamp}]</span>
                <span className={`shrink-0 w-20 font-bold ${
                  log.level === 'INFO' ? 'text-teal-400' :
                  log.level === 'WARN' ? 'text-amber-400' :
                  log.level === 'ERROR' ? 'text-rose-400' :
                  'text-red-400 bg-red-950/60 px-1 rounded'
                }`}>
                  {log.level}
                </span>
                <span className="text-purple-400 shrink-0 w-32 truncate select-none">[{log.source}]</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
