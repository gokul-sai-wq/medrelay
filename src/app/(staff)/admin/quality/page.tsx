"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, TrendingDown, GitBranch, Star, PackageX, Clock, ShieldAlert, Activity, 
  Users, AlertTriangle, FileText, CheckCircle2, Filter, ArrowUpRight, Check
} from "lucide-react"

const METRICS = [
  { label: "Referral Completion", value: "92.4%", trend: "up", detail: "+3.2% vs last month", icon: GitBranch, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Avg. Patient Wait Time", value: "24 min", trend: "down", detail: "-10 min vs last month", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
  { label: "Patient Satisfaction", value: "4.8 / 5", trend: "up", detail: "850 responses in Pondicherry", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Stock-out Incidents", value: "1", trend: "down", detail: "vs 9 last month", icon: PackageX, color: "text-rose-500", bg: "bg-rose-50" },
]

const INITIAL_FLAGS = [
  { id: "FLG-102", facility: "Sub-Centre PHC, Villianur, Pondicherry", issue: "Iron & Folic Acid stock below threshold for 6 days", severity: "Medium", status: "Open", assigned: "Logistics Team" },
  { id: "FLG-103", facility: "Villianur PHC, Pondicherry", issue: "3 high-risk referrals unacknowledged for over 24 hours", severity: "High", status: "Escalated", assigned: "Dr. Sharma (IGGGH)" },
  { id: "FLG-104", facility: "Indira Gandhi Govt General Hospital, Pondicherry", issue: "Teleconsult wait times exceeded 45 mins on weekend", severity: "Low", status: "Resolved", assigned: "System Auto" },
  { id: "FLG-105", facility: "Bahour PHC, Pondicherry", issue: "Maternal follow-up delay reported by ASHA team", severity: "Medium", status: "Open", assigned: "ASHA Nodal Officer" },
  { id: "FLG-106", facility: "Ariyankuppam Sub-Centre, Pondicherry", issue: "Ambulance response time exceeded 25 mins in rural sector", severity: "High", status: "Open", assigned: "108 Dispatch Command" },
]

const PERFORMANCE = [
  { rank: 1, facility: "Indira Gandhi Govt General Hospital, Pondicherry", score: 98, change: "+2" },
  { rank: 2, facility: "Villianur PHC, Pondicherry", score: 94, change: "0" },
  { rank: 3, facility: "Bahour PHC, Pondicherry", score: 88, change: "-1" },
  { rank: 4, facility: "Ariyankuppam Sub-Centre, Pondicherry", score: 82, change: "0" },
  { rank: 5, facility: "Nettapakkam PHC, Pondicherry", score: 80, change: "+1" },
]

const severityStyle: Record<string, string> = {
  High: "bg-red-500 text-white shadow-red-500/30",
  Medium: "bg-amber-500 text-white shadow-amber-500/30",
  Low: "bg-emerald-500 text-white shadow-emerald-500/30",
}

export default function QualityDashboardPage() {
  const [flags, setFlags] = useState(INITIAL_FLAGS)
  const [severityFilter, setSeverityFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleResolveFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, status: "Resolved" } : f))
  }

  const handleEscalateFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, status: "Escalated", assigned: "Directorate of Health Services (DHS)" } : f))
  }

  const handleDownloadPDF = () => {
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 3000)
  }

  const filteredFlags = flags.filter(f => {
    const matchesSeverity = severityFilter === "All" || f.severity === severityFilter
    const matchesStatus = statusFilter === "All" || f.status === statusFilter
    return matchesSeverity && matchesStatus
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <ShieldAlert className="text-indigo-600" size={32} /> Quality Assurance & Accountability
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            Network-wide monitoring for continuity of care, service-level compliance, and clinical governance in Puducherry District. 
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold border border-indigo-100">
           <Activity size={16} /> Live System Status: Optimal (99.8%)
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((m, i) => {
          const Icon = m.icon
          const Trend = m.trend === "up" ? TrendingUp : TrendingDown
          const trendColor = m.trend === "up" ? (m.label === "Stock-out Incidents" ? "text-red-500" : "text-emerald-500") : (m.label === "Stock-out Incidents" ? "text-emerald-500" : "text-red-500")
          
          return (
            <Card key={i} className="shadow-sm border-slate-100 hover:shadow-md transition-all group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.bg} ${m.color} group-hover:scale-105 transition-transform`}>
                      <Icon size={24} />
                   </div>
                   <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-50 ${trendColor}`}>
                      <Trend size={14} /> {m.trend === 'up' ? 'Up' : 'Down'}
                   </div>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{m.value}</div>
                <div className="text-sm font-semibold text-slate-600">{m.label}</div>
                <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                   <span>Performance</span>
                   <span className="font-medium text-slate-600">{m.detail}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Flags / Escalations Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200 overflow-hidden h-full">
            <CardHeader className="bg-slate-50/70 border-b border-slate-200 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                       <AlertTriangle className="text-amber-500" size={20} /> Quality Flags & SLA Breaches
                    </CardTitle>
                    <CardDescription className="mt-1">Surfaced from referral delays, stock thresholds, and missed follow-ups.</CardDescription>
                 </div>
                 <div className="flex gap-2 items-center">
                   {/* Severity filter */}
                   <select 
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                   >
                     <option value="All">All Severities</option>
                     <option value="High">High</option>
                     <option value="Medium">Medium</option>
                     <option value="Low">Low</option>
                   </select>

                   {/* Status filter */}
                   <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                   >
                     <option value="All">All Statuses</option>
                     <option value="Open">Open</option>
                     <option value="Escalated">Escalated</option>
                     <option value="Resolved">Resolved</option>
                   </select>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                           <th className="px-5 py-3">ID</th>
                           <th className="px-5 py-3">Facility / Incident</th>
                           <th className="px-5 py-3">Severity</th>
                           <th className="px-5 py-3">Status & Owner</th>
                           <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredFlags.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                              No quality flags match the selected filters.
                            </td>
                          </tr>
                        ) : filteredFlags.map((f) => (
                           <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-4 font-mono text-slate-400 text-xs">{f.id}</td>
                              <td className="px-5 py-4">
                                 <div className="font-bold text-slate-900 text-sm">{f.facility}</div>
                                 <div className="text-slate-500 text-xs mt-0.5">{f.issue}</div>
                              </td>
                              <td className="px-5 py-4">
                                 <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-xs ${severityStyle[f.severity]}`}>
                                    {f.severity}
                                 </span>
                              </td>
                              <td className="px-5 py-4">
                                 <div className="flex flex-col gap-0.5">
                                    <span className={`font-semibold text-xs ${f.status === 'Resolved' ? 'text-emerald-600' : f.status === 'Escalated' ? 'text-rose-600' : 'text-amber-600'}`}>
                                       ● {f.status}
                                    </span>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                       <Users size={12} /> {f.assigned}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-5 py-4 text-right">
                                {f.status !== "Resolved" ? (
                                  <div className="flex justify-end gap-1.5">
                                    <Button 
                                      onClick={() => handleResolveFlag(f.id)} 
                                      size="sm" 
                                      variant="outline"
                                      className="text-xs h-7 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    >
                                      Resolve
                                    </Button>
                                    {f.status !== "Escalated" && (
                                      <Button 
                                        onClick={() => handleEscalateFlag(f.id)} 
                                        size="sm" 
                                        variant="outline"
                                        className="text-xs h-7 px-2 border-red-300 text-red-700 hover:bg-red-50"
                                      >
                                        Escalate
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                                    <CheckCircle2 size={14} /> Closed
                                  </span>
                                )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Facility Leaderboard & Analytics */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200 h-full flex flex-col justify-between">
            <div>
              <CardHeader className="bg-slate-900 text-white rounded-t-xl pb-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                   <Star className="text-amber-400 fill-amber-400" size={20} /> Facility Compliance Score
                </CardTitle>
                <CardDescription className="text-slate-300 mt-1">SLA & clinical audit scores for Puducherry facilities.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-slate-100">
                    {PERFORMANCE.map((p, i) => (
                       <div key={i} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${p.rank === 1 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400' : 'bg-slate-100 text-slate-600'}`}>
                             #{p.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="font-bold text-slate-900 text-xs truncate">{p.facility}</div>
                             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className={`h-full rounded-full ${p.score >= 90 ? 'bg-emerald-500' : p.score >= 85 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${p.score}%` }}></div>
                             </div>
                          </div>
                          <div className="text-right shrink-0">
                             <div className="text-sm font-black text-slate-900">{p.score}</div>
                             <div className={`text-[10px] font-bold ${p.change.startsWith('+') ? 'text-emerald-600' : p.change.startsWith('-') ? 'text-red-500' : 'text-slate-400'}`}>
                                {p.change === '0' ? 'No change' : p.change}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
               <span className="text-indigo-600 text-xs font-bold hover:underline cursor-pointer flex items-center justify-center gap-1">
                 View Full DHS Audit Breakdown <ArrowUpRight size={14} />
               </span>
            </div>
          </Card>
        </div>

      </div>

      {/* PDF Audit Download Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200 gap-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
               <FileText size={20} />
            </div>
            <div>
               <h3 className="font-bold text-emerald-900 text-base">Monthly Clinical Audit PDF Ready</h3>
               <p className="text-xs text-emerald-700 mt-0.5">Automated Puducherry Directorate of Health Services audit report for September 2026.</p>
            </div>
         </div>
         <Button 
            onClick={handleDownloadPDF} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-semibold shadow-md shrink-0"
         >
            {downloadSuccess ? (
              <span className="flex items-center gap-1.5"><Check size={16} /> Audit PDF Downloaded</span>
            ) : (
              <span className="flex items-center gap-1.5"><FileText size={16} /> Download Full Audit PDF</span>
            )}
         </Button>
      </div>

    </div>
  )
}
