"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, Activity, Calendar, Stethoscope, AlertCircle, FileText, FlaskConical, Link2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

export default function UserDashboard() {
  const { t } = useLanguage()
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchHistory = () => {
      const history = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
      // Sort by date descending
      history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setMedicalHistory(history)
    }
    
    fetchHistory()
    const interval = setInterval(fetchHistory, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">{t("nav.dashboard")}</h1>
           <p className="text-slate-500 font-medium mt-1">ABDM Linked Health Records (ID: 91-xxxx-xxxx-45)</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm border border-green-200">
           <ShieldCheck size={20} /> Identity Verified
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content (Medical Records Table) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <FileText size={24} className="text-indigo-600" /> Longitudinal Medical Records
                </h2>
                <div className="text-sm font-semibold text-slate-500">Auto-synced via MedRelay</div>
             </div>
             
             {medicalHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                   <Activity size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="font-semibold text-lg">No medical records found.</p>
                   <p className="text-sm">Records will appear here once processed by a PHC or Hospital.</p>
                </div>
             ) : (
                <div className="w-full overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                       <tr>
                         <th className="px-6 py-4">Date / Facility</th>
                         <th className="px-6 py-4">Diagnosis / Complaint</th>
                         <th className="px-6 py-4">Action Taken / Prescription</th>
                         <th className="px-6 py-4 text-center">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {medicalHistory.map((record, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                                   <Link2 size={12} /> {record.facility}
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="font-semibold text-slate-800 line-clamp-2" title={record.chiefComplaint || record.diagnosis}>
                                   {record.chiefComplaint || record.diagnosis || "Consultation"}
                                </div>
                                {record.flags && record.flags.length > 0 && (
                                   <div className="flex flex-wrap gap-1 mt-2">
                                      {record.flags.slice(0,2).map((flag: string, i: number) => (
                                         <span key={i} className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">
                                            {flag}
                                         </span>
                                      ))}
                                      {record.flags.length > 2 && <span className="text-[10px] text-slate-400 font-bold">+{record.flags.length - 2}</span>}
                                   </div>
                                )}
                             </td>
                             <td className="px-6 py-4">
                                <div className="font-medium text-slate-700">{record.actionTaken || record.prescription || "Consultation Completed"}</div>
                                {record.diagnostics && (
                                   <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-2 bg-blue-50 w-fit px-2 py-1 rounded-md">
                                      <FlaskConical size={12} /> {record.diagnostics}
                                   </div>
                                )}
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                   record.status === 'Referred' ? 'bg-orange-100 text-orange-700' :
                                   record.status === 'Admitted' ? 'bg-red-100 text-red-700' :
                                   'bg-teal-100 text-teal-700'
                                }`}>
                                   {record.status || 'Treated'}
                                </span>
                             </td>
                          </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             )}
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Quick Actions */}
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Stethoscope size={20} className="text-teal-400"/> Need Assistance?</h3>
              <p className="text-sm text-slate-300 mb-6">Start a new AI Voice Triage session or contact emergency services.</p>
              
              <div className="space-y-3">
                 <Link href="/" className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-bold transition-colors shadow-sm">
                    <Activity size={18} /> Start Voice Triage
                 </Link>
                 <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors">
                    <AlertCircle size={18} className="text-red-400" /> Emergency Ambulance
                 </button>
              </div>
           </div>

           {/* Demographics / Profile Summary */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Patient Profile</h3>
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Name</span>
                    <span className="font-bold text-slate-900">Moni Kumar</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Age / Gender</span>
                    <span className="font-bold text-slate-900">28 / M</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Blood Group</span>
                    <span className="font-bold text-rose-600">O+</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Primary PHC</span>
                    <span className="font-bold text-slate-900">Villianur PHC, Pondicherry</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
