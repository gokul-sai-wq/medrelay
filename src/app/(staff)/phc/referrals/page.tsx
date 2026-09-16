"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  getStaffReferrals, 
  closeReferral, 
  updateReferralStage, 
  ensureDemoSeedData, 
  type Referral 
} from "@/lib/store"
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Share2, 
  Search, 
  Building2, 
  Check, 
  ShieldCheck, 
  History, 
  FileCheck2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  UserCheck
} from "lucide-react"

export default function PHCReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "closed">("all")
  const [closingReferral, setClosingReferral] = useState<Referral | null>(null)
  const [closeNote, setCloseNote] = useState("")
  const [patientCode, setPatientCode] = useState("")
  const [activeStageUpdate, setActiveStageUpdate] = useState<{ref: Referral, stageIndex: number} | null>(null)
  const [stageNote, setStageNote] = useState("")

  const loadData = () => {
    ensureDemoSeedData()
    setReferrals(getStaffReferrals())
  }

  useEffect(() => {
    loadData()
    const handleStorage = () => loadData()
    window.addEventListener("storage", handleStorage)
    window.addEventListener("medrelay-referral-update", handleStorage)
    const interval = setInterval(loadData, 2000)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("medrelay-referral-update", handleStorage)
      clearInterval(interval)
    }
  }, [])

  // Check closure status of a referral
  const isReferralClosed = (ref: Referral) => {
    const allDone = ref.stages.every(s => s.status === "done")
    if (allDone) return true
    try {
      const hist = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
      const matched = hist.find((h: any) => h.referralId === ref.id)
      return matched?.referralClosed === true
    } catch {
      return false
    }
  }

  // Get closure metadata (note, timestamp, facility)
  const getClosureDetails = (ref: Referral) => {
    try {
      const hist = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
      const matched = hist.find((h: any) => h.referralId === ref.id)
      if (matched?.closeNote || matched?.closeDate) {
        return {
          note: matched.closeNote || "Discharge summary recorded and referral completed.",
          date: matched.closeDate ? new Date(matched.closeDate).toLocaleString() : "Recently",
          facility: matched.facility || "Discharge Facility"
        }
      }
    } catch {}

    const lastDone = [...ref.stages].reverse().find(s => s.status === "done")
    return {
      note: lastDone?.note || "Pathway completed across all assigned healthcare tiers.",
      date: lastDone?.date || "Completed",
      facility: lastDone?.facility || "Healthcare Network"
    }
  }

  const handleCloseReferral = () => {
    if (!closingReferral) return
    const validCode = (localStorage.getItem("medrelay.user_unique_code") || "PT-8891").trim().toUpperCase()
    if (patientCode.trim().toUpperCase() !== validCode) {
      alert(`Invalid Patient Unique Code! Please use ${validCode} to verify consent.`)
      return
    }

    closeReferral(
      closingReferral.id, 
      closeNote.trim() || "PHC primary care post-discharge review completed. Case formally closed.",
      "Villianur PHC, Pondicherry"
    )

    setClosingReferral(null)
    setCloseNote("")
    setPatientCode("")
    loadData()
  }

  const handleUpdateStage = () => {
    if (!activeStageUpdate) return
    updateReferralStage(
      activeStageUpdate.ref.id,
      activeStageUpdate.stageIndex,
      {
        status: "done",
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
        note: stageNote.trim() || "Evaluated and processed at PHC tier."
      }
    )
    setActiveStageUpdate(null)
    setStageNote("")
    loadData()
  }

  const filteredReferrals = referrals.filter(r => {
    const matchesSearch = 
      (r.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reason || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    const closed = isReferralClosed(r)
    if (activeTab === "active") return !closed
    if (activeTab === "closed") return closed
    return true
  })

  const totalCount = referrals.length
  const activeCount = referrals.filter(r => !isReferralClosed(r)).length
  const closedCount = referrals.filter(r => isReferralClosed(r)).length

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Referrals & Pathways</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Villianur PHC / Sub-Centre
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Track multi-tier patient journeys from Sub-Centres to Primary Health Centres and District Tertiary Hospitals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Ref ID, Patient, Reason..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white w-64 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          onClick={() => setActiveTab("all")} 
          className={`cursor-pointer transition-all border-l-4 border-l-slate-800 shadow-xs hover:shadow-md ${activeTab === "all" ? "ring-2 ring-slate-800" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Referrals Tracked</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Share2 size={22} />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setActiveTab("active")} 
          className={`cursor-pointer transition-all border-l-4 border-l-amber-500 shadow-xs hover:shadow-md ${activeTab === "active" ? "ring-2 ring-amber-500" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Active Pathways</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{activeCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setActiveTab("closed")} 
          className={`cursor-pointer transition-all border-l-4 border-l-emerald-500 shadow-xs hover:shadow-md ${activeTab === "closed" ? "ring-2 ring-emerald-500" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Closed & Discharged</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{closedCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "all" ? "border-teal-600 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All Referrals ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "active" ? "border-amber-500 text-amber-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Active Pathways ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab("closed")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "closed" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Closed & Discharged ({closedCount})
        </button>
      </div>

      {/* Dedicated Multi-Column Referrals Table */}
      <Card className="shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 w-[20%]">Referral ID & Patient</th>
                <th className="py-3.5 px-4 w-[22%]">Medical History & Reason</th>
                <th className="py-3.5 px-4 w-[28%]">Referral Pathway & Route</th>
                <th className="py-3.5 px-4 w-[18%]">Referral Close & Discharge</th>
                <th className="py-3.5 px-4 w-[12%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Share2 size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">No referrals found matching your filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching tabs or clearing your search term.</p>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map(ref => {
                  const closed = isReferralClosed(ref)
                  const closureInfo = closed ? getClosureDetails(ref) : null
                  const activeStageIndex = ref.stages.findIndex(s => s.status === "current")
                  const activeStage = activeStageIndex !== -1 ? ref.stages[activeStageIndex] : null
                  const isCurrentAtPHC = activeStage && (
                    activeStage.facility.includes("PHC") || 
                    activeStage.facility.includes("Sub-Centre") ||
                    activeStage.facility.includes("Villianur")
                  )

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      
                      {/* Column 1: Referral ID & Patient */}
                      <td className="py-4 px-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-xs">
                            {ref.id}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            ref.priority === "Critical" ? "bg-red-100 text-red-700" :
                            ref.priority === "High" ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {ref.priority || "Normal"}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 text-sm">{ref.patientName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : "Active Record"}
                        </div>
                      </td>

                      {/* Column 2: Medical History & Reason */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-900 block mb-0.5">Clinical Indication:</span>
                          {ref.reason}
                        </div>
                        {ref.stages.find(s => s.note) && (
                          <div className="text-[11px] text-slate-500 italic pl-1 border-l-2 border-teal-300">
                            Last clinical note: "{ref.stages.find(s => s.note)?.note}"
                          </div>
                        )}
                      </td>

                      {/* Column 3: Referral Pathway & Route */}
                      <td className="py-4 px-4 space-y-2.5">
                        <div className="space-y-1.5">
                          {ref.stages.map((stage, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {stage.status === "done" ? (
                                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                              ) : stage.status === "current" ? (
                                <AlertCircle size={15} className="text-amber-500 animate-pulse shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 ml-0.5 mr-0.5" />
                              )}
                              <span className={`font-semibold ${
                                stage.status === "current" ? "text-amber-800 font-bold" :
                                stage.status === "done" ? "text-slate-700" :
                                "text-slate-400"
                              }`}>
                                {stage.label}:
                              </span>
                              <span className={`truncate text-[11px] ${
                                stage.status === "current" ? "text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" :
                                "text-slate-500"
                              }`}>
                                {stage.facility}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Route: <strong className="text-slate-600">{ref.stages[0]?.facility.split(',')[0]}</strong> → <strong className="text-slate-600">{ref.stages[ref.stages.length - 1]?.facility.split(',')[0]}</strong>
                        </div>
                      </td>

                      {/* Column 4: Referral Close & Discharge */}
                      <td className="py-4 px-4 space-y-1.5">
                        {closed ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={13} />
                              Closed & Discharged
                            </span>
                            {closureInfo && (
                              <div className="text-xs bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 space-y-1">
                                <p className="text-[11px] text-emerald-950 font-medium leading-tight">
                                  {closureInfo.note}
                                </p>
                                <p className="text-[10px] text-emerald-700/80">
                                  At: {closureInfo.facility} • {closureInfo.date}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock size={13} />
                              Active in Transit
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Current stage: <strong className="text-slate-700">{activeStage ? activeStage.facility : "Pending next step"}</strong>
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-4 px-4 text-right space-y-2">
                        {!closed ? (
                          <div className="flex flex-col items-end gap-1.5">
                            {isCurrentAtPHC && activeStageIndex !== -1 && (
                              <Button
                                size="sm"
                                onClick={() => setActiveStageUpdate({ ref, stageIndex: activeStageIndex })}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 rounded-lg shadow-xs font-bold cursor-pointer"
                              >
                                Accept & Advance
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setClosingReferral(ref)}
                              className="text-xs h-8 px-3 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              Close Referral
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 inline-flex items-center gap-1">
                            <FileCheck2 size={14} className="text-emerald-500" />
                            Completed
                          </span>
                        )}
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Close Referral with Patient Code */}
      {closingReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Close Referral & Record Discharge</h2>
                <p className="text-xs text-slate-500 mt-0.5">Referral ID: <span className="font-mono font-bold text-teal-800">{closingReferral.id}</span></p>
              </div>
              <button 
                onClick={() => setClosingReferral(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900">
                <strong>Patient:</strong> {closingReferral.patientName}<br/>
                <strong>Clinical Reason:</strong> {closingReferral.reason}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Discharge Summary / Clinical Closure Notes
                </label>
                <textarea 
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  placeholder="e.g., Post-surgical recuperation complete. Suture removal done. Patient discharged back into routine PHC surveillance."
                  value={closeNote}
                  onChange={e => setCloseNote(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient Unique Code (ABDM Consent Verification)
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setPatientCode("PT-8891")}
                    className="text-xs text-teal-700 hover:text-teal-800 font-bold bg-teal-100 hover:bg-teal-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    ⚡ Auto-Fill: PT-8891
                  </button>
                </div>
                <input 
                  type="text"
                  placeholder="Enter PT-8891" 
                  value={patientCode} 
                  onChange={e => setPatientCode(e.target.value.toUpperCase())} 
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setClosingReferral(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCloseReferral} 
                disabled={!patientCode.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Confirm & Close Referral
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Acknowledge / Update Stage */}
      {activeStageUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Acknowledge & Update Pathway Stage</h2>
              <p className="text-xs text-slate-500 mt-0.5">Stage: {activeStageUpdate.ref.stages[activeStageUpdate.stageIndex]?.label}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Clinical Action Note
                </label>
                <textarea 
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  placeholder="e.g., Patient evaluated by PHC Medical Officer. Stabilized and referral endorsed to higher tier."
                  value={stageNote}
                  onChange={e => setStageNote(e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveStageUpdate(null)}>Cancel</Button>
              <Button onClick={handleUpdateStage} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                Update & Advance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

