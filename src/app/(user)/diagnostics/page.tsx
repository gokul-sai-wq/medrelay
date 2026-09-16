"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, TestTube2, FlaskConical, MapPin, Calendar, Clock, ArrowRight, AlertTriangle, CheckCircle2, X } from "lucide-react"

const TESTS = [
  { id: 1, name: "Complete Blood Count (CBC)", prep: "No fasting required", type: "Blood" },
  { id: 2, name: "Lipid Profile", prep: "10-12 hours fasting required", type: "Blood" },
  { id: 3, name: "Chest X-Ray", prep: "Remove metallic objects", type: "Imaging" },
  { id: 4, name: "HbA1c (Diabetes)", prep: "No fasting required", type: "Blood" },
]

export default function DiagnosticsPage() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [approvedTests, setApprovedTests] = useState<any[]>([])

  useEffect(() => {
    const fetchStorage = () => {
      const p = JSON.parse(localStorage.getItem("medrelay.pending_diagnostics") || "[]")
      const a = JSON.parse(localStorage.getItem("medrelay.approved_diagnostics") || "[]")
      setPendingRequests(p)
      setApprovedTests(a)
    }
    
    fetchStorage()
    const interval = setInterval(fetchStorage, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleApprove = (req: any) => {
    const newPending = pendingRequests.filter(p => p.id !== req.id)
    localStorage.setItem("medrelay.pending_diagnostics", JSON.stringify(newPending))
    
    const newApproved = [...approvedTests, { ...req, status: "Scheduled" }]
    localStorage.setItem("medrelay.approved_diagnostics", JSON.stringify(newApproved))
    
    setPendingRequests(newPending)
    setApprovedTests(newApproved)
  }

  const handleDecline = (id: string) => {
    const newPending = pendingRequests.filter(p => p.id !== id)
    localStorage.setItem("medrelay.pending_diagnostics", JSON.stringify(newPending))
    setPendingRequests(newPending)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Diagnostic Coordination</h1>
        <p className="text-slate-500 mt-1">Book lab tests and imaging seamlessly. We route you to the nearest equipped facility.</p>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" /> Action Required: Pending Prescriptions
          </h2>
          <div className="grid gap-4">
            {pendingRequests.map(req => (
              <Card key={req.id} className="border-2 border-amber-400 bg-amber-50 shadow-md">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Prescribed by {req.source}</div>
                    <h3 className="text-lg font-bold text-slate-900">{req.testName}</h3>
                    <p className="text-sm text-slate-600 mt-1">Requested on {req.date}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button onClick={() => handleDecline(req.id)} variant="outline" className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50">
                      <X className="w-4 h-4 mr-2" /> Decline
                    </Button>
                    <Button onClick={() => handleApprove(req)} className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col - Booking */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-t-4 border-t-indigo-600">
             <CardHeader>
                <CardTitle>Select Tests</CardTitle>
                <CardDescription>Choose the diagnostics recommended by your doctor.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {TESTS.map(test => (
                      <div key={test.id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer bg-white group">
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                               {test.type === 'Blood' ? <TestTube2 size={16} className="text-rose-500" /> : <Activity size={16} className="text-teal-500" />}
                               {test.name}
                            </div>
                            <div className="w-5 h-5 rounded border border-slate-300 group-hover:border-indigo-500"></div>
                         </div>
                         <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <FlaskConical size={14} /> {test.prep}
                         </div>
                      </div>
                   ))}
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                   <Button className="bg-slate-900 hover:bg-slate-800">Find Nearest Facility <ArrowRight size={16} className="ml-2" /></Button>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Col - Upcoming/Nearby */}
        <div className="space-y-6">
          <Card className="shadow-sm border-t-4 border-t-teal-500">
             <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2"><Calendar size={18} className="text-teal-600" /> Upcoming Appointments</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                {approvedTests.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {approvedTests.map((test, i) => (
                      <div key={i} className="p-4">
                        <div className="font-bold text-slate-900">{test.testName}</div>
                        <div className="text-xs text-slate-500 mt-1">Prescribed by {test.source}</div>
                        <div className="mt-2 text-xs font-semibold px-2 py-1 bg-teal-100 text-teal-700 rounded-full inline-block flex items-center gap-1 w-max">
                          <Clock size={12} /> Pending Facility Visit
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-slate-500 py-4">No diagnostic appointments scheduled.</p>
                  </div>
                )}
             </CardContent>
          </Card>

          <Card className="shadow-sm">
             <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2"><MapPin size={18} /> Nearby Partner Labs</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                   <div className="p-4">
                      <div className="font-bold text-sm text-slate-800">Villianur PHC, Pondicherry</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12} /> 2.4 km away</div>
                      <div className="mt-2 text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full inline-block">Basic Labs Available</div>
                   </div>
                   <div className="p-4">
                      <div className="font-bold text-sm text-slate-800">Indira Gandhi Govt Hospital Lab, Pondicherry</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12} /> 12.1 km away</div>
                      <div className="mt-2 text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full inline-block">Advanced Imaging Available</div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
