"use client"

import { useState, useEffect } from "react"
import { FileText, Search, User, Filter, ChevronRight, Activity, Link2, FlaskConical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DoctorPatientRecords() {
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    const fetchHistory = () => {
      const history = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
      history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecords(history)
    }
    fetchHistory()
    const interval = setInterval(fetchHistory, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Patient Records</h2>
          <p className="text-slate-500">View and manage the longitudinal medical history across all facilities.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Export Records</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center gap-4 space-y-0 rounded-t-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search patients by name or ID..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <Button variant="outline" className="text-slate-600 border-slate-300">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
             <div className="p-16 text-center text-slate-500">
                <Activity size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-lg">No medical records found.</p>
                <p className="text-sm">Records will appear here once processed by a facility.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-slate-500 font-semibold bg-white">
                    <th className="p-4 py-3">Patient / Date</th>
                    <th className="p-4 py-3">Facility</th>
                    <th className="p-4 py-3">Chief Complaint</th>
                    <th className="p-4 py-3">Action / Prescriptions</th>
                    <th className="p-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {records.map((record, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <User size={14} className="text-indigo-600" />
                          </div>
                          <div>
                             <span className="font-bold text-slate-900 block">Patient #8891</span>
                             <span className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-2">
                         <Link2 size={14} className="text-slate-400" /> {record.facility}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{record.chiefComplaint || "Routine Consultation"}</div>
                        {record.flags && record.flags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                               {record.flags.map((flag: string, idx: number) => (
                                  <span key={idx} className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 rounded-full border border-rose-100">
                                     {flag}
                                  </span>
                               ))}
                            </div>
                        )}
                      </td>
                      <td className="p-4">
                         <div className="text-sm text-slate-700">{record.actionTaken}</div>
                         {record.diagnostics && (
                            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
                               <FlaskConical size={12} /> {record.diagnostics}
                            </div>
                         )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          record.status === 'Treated' ? 'bg-teal-100 text-teal-700' :
                          record.status === 'Referred' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
