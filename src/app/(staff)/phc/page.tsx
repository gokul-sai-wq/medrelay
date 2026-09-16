"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CloudOff, RefreshCw, CheckCircle2, User, Baby, Activity, HeartPulse, History } from "lucide-react"

const HIGH_RISK_PATIENTS = [
  { id: "P-1092", name: "Sunita Devi", type: "Maternal", issue: "3rd Trimester - High BP", lastVisit: "2 days ago", due: "Today" },
  { id: "P-1104", name: "Rahul (Infant)", type: "Child", issue: "Severe Malnutrition (SAM)", lastVisit: "1 week ago", due: "Tomorrow" },
  { id: "P-0822", name: "Ramesh Kumar", type: "Chronic", issue: "Asthma Exacerbation", lastVisit: "1 month ago", due: "Overdue by 2 days" },
]

export default function PHCDashboardPage() {
  const [syncing, setSyncing] = useState(false)
  const [queueCount, setQueueCount] = useState(3)
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchHistory = () => {
      const history = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
      history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      // Filter for this facility and limit to 5
      setMedicalHistory(history.filter((h: any) => h.facility === "Villianur PHC, Pondicherry" || h.facility === "Shirur PHC" || h.facility.includes("PHC")).slice(0, 5))
    }
    
    fetchHistory()
    const interval = setInterval(fetchHistory, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setQueueCount(0)
    }, 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sub-Centre Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your high-risk follow-ups and offline synchronization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Col - Follow-ups */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-t-4 border-t-rose-500">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><HeartPulse className="text-rose-500" /> High-Risk Patient Follow-up</CardTitle>
                <CardDescription>Maternal, Child, and Chronic care patients requiring immediate field visits.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                   {HIGH_RISK_PATIENTS.map((p, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${p.type === 'Maternal' ? 'bg-rose-400' : p.type === 'Child' ? 'bg-amber-400' : 'bg-indigo-400'}`}>
                               {p.type === 'Maternal' ? <User size={20} /> : p.type === 'Child' ? <Baby size={20} /> : <Activity size={20} />}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{p.name}</p>
                               <p className="text-sm text-slate-500">{p.type} • {p.issue}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${p.due.includes('Overdue') ? 'bg-red-100 text-red-700' : p.due === 'Today' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                               Due: {p.due}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Last seen: {p.lastVisit}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Col - Offline Sync Queue */}
        <div className="space-y-6">
          <Card className={`shadow-sm border-2 ${queueCount > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
             <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                   {queueCount > 0 ? <CloudOff className="text-amber-500" /> : <CheckCircle2 className="text-emerald-500" />} 
                   Offline Sync Queue
                </CardTitle>
                <CardDescription>Low-connectivity operation mode.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                {queueCount > 0 ? (
                   <>
                      <div className="bg-white p-4 rounded-xl border border-amber-200 text-center">
                         <div className="text-3xl font-black text-amber-600 mb-1">{queueCount}</div>
                         <div className="text-sm font-semibold text-slate-600">Pending Actions</div>
                         <p className="text-xs text-slate-400 mt-1">Stored locally on device.</p>
                      </div>
                      <Button 
                         onClick={handleSync} 
                         disabled={syncing}
                         className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                      >
                         {syncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                         {syncing ? "Syncing..." : "Sync to Cloud Now"}
                      </Button>
                   </>
                ) : (
                   <div className="bg-white p-6 rounded-xl border border-emerald-200 text-center">
                      <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
                      <div className="font-bold text-emerald-800">All Systems Synced</div>
                      <p className="text-xs text-emerald-600/80 mt-1">Connected to cloud database.</p>
                   </div>
                )}
             </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
