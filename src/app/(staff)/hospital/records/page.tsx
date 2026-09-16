"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  FileText, Search, User, Filter, Activity, Link2, FlaskConical, 
  ArrowRight, CheckCircle2, Clock, X, ShieldAlert, KeyRound, Download, 
  Building2, Hospital
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStaffReferrals, closeReferral, ensureDemoSeedData, type Referral } from "@/lib/store"

export default function HospitalPatientRecords() {
  const [records, setRecords] = useState<any[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "history" | "active-referrals" | "closed-referrals">("all")
  
  // Close Referral Modal State
  const [closingRefId, setClosingRefId] = useState<string | null>(null)
  const [closureNote, setClosureNote] = useState("")
  const [patientCode, setPatientCode] = useState("")

  const loadData = () => {
    ensureDemoSeedData()
    const history = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
    history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setRecords(history.filter((h: any) => 
      h.facility.includes("Hospital") || 
      h.facility.includes("District") ||
      h.facility.includes("IGGGH") ||
      h.facility.includes("JIPMER")
    ))
    setReferrals(getStaffReferrals())
  }

  useEffect(() => {
    loadData()
    const handleSync = () => loadData()
    window.addEventListener("storage", handleSync)
    window.addEventListener("medrelay-referral-update", handleSync)
    const interval = setInterval(loadData, 2000)
    return () => {
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("medrelay-referral-update", handleSync)
      clearInterval(interval)
    }
  }, [])

  // Link medical record with referral if referralId exists
  const combinedRecords = useMemo(() => {
    return records.map(rec => {
      const matchedRef = referrals.find(r => r.id === rec.referralId)
      const isRefClosed = rec.referralClosed || (matchedRef && matchedRef.stages[matchedRef.stages.length - 1].status === "done")
      return {
        ...rec,
        matchedRef,
        isRefClosed
      }
    })
  }, [records, referrals])

  // Filtered by Tab & Search Query
  const filteredRecords = useMemo(() => {
    return combinedRecords.filter(rec => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = 
        (rec.patientName && rec.patientName.toLowerCase().includes(q)) ||
        (rec.patient && rec.patient.toLowerCase().includes(q)) ||
        (rec.chiefComplaint && rec.chiefComplaint.toLowerCase().includes(q)) ||
        (rec.referralId && rec.referralId.toLowerCase().includes(q)) ||
        (rec.facility && rec.facility.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (activeTab === "history") return !rec.referralId || rec.status === "Treated"
      if (activeTab === "active-referrals") return rec.referralId && !rec.isRefClosed
      if (activeTab === "closed-referrals") return rec.referralId && rec.isRefClosed
      return true
    })
  }, [combinedRecords, searchQuery, activeTab])

  const handleCloseReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!closingRefId) return

    const validCode = (localStorage.getItem("medrelay.user_unique_code") || "PT-8891").trim().toUpperCase()
    if (patientCode.trim().toUpperCase() !== validCode) {
      alert("Invalid Patient Unique Code. Consent verification required to close referral.")
      return
    }

    closeReferral(closingRefId, closureNote.trim() || "Hospital consultation completed. Patient discharged with PHC continuity care plan.", "Indira Gandhi Govt General Hospital, Pondicherry")
    setClosingRefId(null)
    setClosureNote("")
    setPatientCode("")
    loadData()
  }

  const exportRecords = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(combinedRecords, null, 2))
    const dlAnchor = document.createElement("a")
    dlAnchor.setAttribute("href", dataStr)
    dlAnchor.setAttribute("download", `medrelay-hospital-patient-records-${new Date().toISOString().slice(0, 10)}.json`)
    dlAnchor.click()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hospital Patient Records & Inpatient Registry</h1>
          <p className="text-slate-500 text-sm mt-1">
            Indira Gandhi Govt General Hospital (IGGGH) — Longitudinal clinical records, inbound referral triage, and specialist discharge summaries.
          </p>
        </div>
        <Button onClick={exportRecords} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2">
          <Download size={16} /> Export ABDM Records (JSON)
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Encounters</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{combinedRecords.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Inbound Referrals</p>
          <p className="text-2xl font-black text-amber-800 mt-1">
            {combinedRecords.filter(r => r.referralId && !r.isRefClosed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Closed / Discharged</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {combinedRecords.filter(r => r.referralId && r.isRefClosed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Clinical Histories</p>
          <p className="text-2xl font-black text-indigo-800 mt-1">
            {combinedRecords.filter(r => !r.referralId || r.status === "Treated").length}
          </p>
        </div>
      </div>

      {/* Main Card with Tabs & Search */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b pb-4 space-y-4 rounded-t-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Hospital Records ({combinedRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "history" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Medical History
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("active-referrals")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "active-referrals" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active Referrals ({combinedRecords.filter(r => r.referralId && !r.isRefClosed).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("closed-referrals")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "closed-referrals" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Closed Referrals ({combinedRecords.filter(r => r.referralId && r.isRefClosed).length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient, code, REF ID..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
             <div className="p-16 text-center text-slate-500">
                <Activity size={44} className="mx-auto mb-3 opacity-25 text-blue-600" />
                <p className="font-bold text-base text-slate-700">No matching hospital records found.</p>
                <p className="text-xs text-slate-400 mt-1">Try switching tabs or resetting your search filter.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b text-xs text-slate-500 uppercase tracking-wider font-extrabold bg-slate-100/60">
                    <th className="p-4 py-3.5">Patient / Unique Code</th>
                    <th className="p-4 py-3.5">Medical History & Diagnosis</th>
                    <th className="p-4 py-3.5">Hospital Orders & Labs</th>
                    <th className="p-4 py-3.5">Inbound Referral Origin</th>
                    <th className="p-4 py-3.5">Referral Close & Discharge</th>
                    <th className="p-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {filteredRecords.map((record, i) => {
                    const ref = record.matchedRef
                    const hasReferral = Boolean(record.referralId)
                    const isClosed = record.isRefClosed

                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* COLUMN 1: PATIENT & UNIQUE CODE */}
                        <td className="p-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                              <User size={16} className="text-blue-700" />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block leading-tight">
                                {record.patientName || "Patient (PT-8891)"}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-max border border-slate-200">
                                <KeyRound size={10} className="text-slate-400" />
                                {record.patient || "PT-8891"}
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-1">
                                {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* COLUMN 2: SEPARATE MEDICAL HISTORY & DIAGNOSIS */}
                        <td className="p-4 align-top max-w-xs">
                          <div className="font-bold text-slate-900 leading-snug">
                            {record.chiefComplaint || "Tertiary Specialist Consultation"}
                          </div>
                          
                          {/* Clinical Risk Flags */}
                          {record.flags && record.flags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {record.flags.map((flag: string, idx: number) => (
                                <span key={idx} className="text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200/70">
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Hospital size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{record.facility}</span>
                          </div>
                        </td>

                        {/* COLUMN 3: ORDERS & DIAGNOSTICS */}
                        <td className="p-4 align-top max-w-xs">
                          <div className="text-xs text-slate-700 leading-relaxed font-medium">
                            {record.actionTaken || "Specialist clinical examination and treatment administered."}
                          </div>
                          {record.diagnostics && (
                            <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 mt-2 w-max">
                              <FlaskConical size={12} className="text-blue-600 shrink-0" />
                              <span>{record.diagnostics}</span>
                            </div>
                          )}
                        </td>

                        {/* COLUMN 4: SEPARATE REFERRAL COLUMN */}
                        <td className="p-4 align-top max-w-xs">
                          {hasReferral ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-black text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                                  {record.referralId}
                                </span>
                                {ref?.priority && (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                    {ref.priority}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-800">
                                {ref?.reason || record.chiefComplaint}
                              </p>
                              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                <Building2 size={11} className="text-slate-400" />
                                <span>Origin: Villianur Sub-Centre / PHC</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block">
                              — Walk-in Direct Admission —
                            </span>
                          )}
                        </td>

                        {/* COLUMN 5: SEPARATE REFERRAL CLOSE / DISCHARGE COLUMN */}
                        <td className="p-4 align-top max-w-xs">
                          {hasReferral ? (
                            isClosed ? (
                              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span>Referral Closed & Discharged</span>
                                </div>
                                <p className="text-xs text-emerald-900 leading-snug font-medium">
                                  {record.closeNote || (ref && ref.stages[ref.stages.length - 1].note) || "Patient treated and officially discharged back to primary PHC follow-up."}
                                </p>
                                <span className="text-[10px] text-emerald-600 block">
                                  {record.closeDate ? new Date(record.closeDate).toLocaleDateString() : "Discharge Finalized"}
                                </span>
                              </div>
                            ) : (
                              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800">
                                  <Clock size={13} className="text-amber-600 animate-pulse shrink-0" />
                                  <span>Active Inpatient / Pending</span>
                                </div>
                                <p className="text-[11px] text-amber-900 leading-snug">
                                  {ref?.stages.find((s: any) => s.status === "current")?.note || "Consultation in progress at IGGGH Pondicherry."}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setClosingRefId(record.referralId)
                                    setPatientCode(record.patient || "PT-8891")
                                    setClosureNote("Consultation completed, patient stabilized. Discharged to Villianur PHC follow-up.")
                                  }}
                                  className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-1.5 px-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                                >
                                  Close Referral & Discharge
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-slate-400 italic">No referral required</span>
                          )}
                        </td>

                        {/* COLUMN 6: STATUS */}
                        <td className="p-4 align-top text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            isClosed ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                            record.status === "Referred" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                            "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}>
                            {isClosed ? "Discharged" : record.status}
                          </span>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: CLOSE REFERRAL DIRECTLY FROM TABLE */}
      {closingRefId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/80">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Close Referral & Complete Discharge</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Referral ID: {closingRefId}</p>
              </div>
              <button onClick={() => setClosingRefId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCloseReferralSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Discharge Summary & Specialist Closer Note *
                </label>
                <textarea
                  required
                  rows={3}
                  value={closureNote}
                  onChange={e => setClosureNote(e.target.value)}
                  placeholder="e.g. Surgery performed successfully. Patient afebrile and vitals stable. Discharged to Villianur PHC for suture removal and follow-up."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient Unique Code (ABDM Consent Verification) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPatientCode("PT-8891")}
                    className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded cursor-pointer"
                  >
                    ⚡ Use PT-8891
                  </button>
                </div>
                <input
                  required
                  type="text"
                  value={patientCode}
                  onChange={e => setPatientCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PT-8891"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase tracking-widest bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setClosingRefId(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Complete & Close Referral
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

