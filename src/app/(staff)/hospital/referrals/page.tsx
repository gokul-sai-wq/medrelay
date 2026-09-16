"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  getStaffReferrals, 
  updateReferralStage, 
  closeReferral,
  ensureDemoSeedData,
  type Referral 
} from "@/lib/store"
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  UserPlus, 
  FileText, 
  Search, 
  Building2, 
  Check, 
  ShieldCheck, 
  History, 
  FileCheck2,
  Stethoscope
} from "lucide-react"

export default function HospitalReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "closed">("all")
  
  // Acknowledge or close stage modal state
  const [selectedReferral, setSelectedReferral] = useState<{ref: Referral, stageIndex: number} | null>(null)
  const [customNote, setCustomNote] = useState("")
  const [selectedDiag, setSelectedDiag] = useState("")
  const [patientCode, setPatientCode] = useState("")

  // Close referral modal state
  const [closingReferral, setClosingReferral] = useState<Referral | null>(null)
  const [closeNote, setCloseNote] = useState("")
  const [closePatientCode, setClosePatientCode] = useState("")

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
          facility: matched.facility || "District Hospital"
        }
      }
    } catch {}

    const lastDone = [...ref.stages].reverse().find(s => s.status === "done")
    return {
      note: lastDone?.note || "Pathway completed across all assigned healthcare tiers.",
      date: lastDone?.date || "Completed",
      facility: lastDone?.facility || "District Hospital"
    }
  }

  const handleAcknowledge = () => {
    if (!selectedReferral) return

    const isClosing = selectedReferral.stageIndex === selectedReferral.ref.stages.length - 1

    if (isClosing || selectedDiag) {
      const validCode = (localStorage.getItem("medrelay.user_unique_code") || "PT-8891").trim().toUpperCase()
      if (patientCode.trim().toUpperCase() !== validCode) {
        alert(`Invalid Patient Unique Code! Please use ${validCode} to verify consent.`)
        return
      }
    }

    updateReferralStage(
      selectedReferral.ref.id, 
      selectedReferral.stageIndex, 
      {
        status: "done",
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
        note: customNote.trim() || (isClosing ? "Specialist consultation completed at District Hospital." : "Acknowledged and accepted by hospital triage.")
      }
    )

    if (isClosing) {
      closeReferral(
        selectedReferral.ref.id,
        customNote.trim() || "Specialist consultation completed at District Hospital. Discharged with follow-up instructions.",
        "Indira Gandhi Govt General Hospital, Pondicherry"
      )
    }

    if (selectedDiag) {
      const pending = JSON.parse(localStorage.getItem("medrelay.pending_diagnostics") || "[]")
      pending.push({
        id: "REQ-" + Math.floor(Math.random() * 10000),
        testName: selectedDiag,
        source: "Indira Gandhi Govt General Hospital, Pondicherry",
        date: new Date().toLocaleString(),
      })
      localStorage.setItem("medrelay.pending_diagnostics", JSON.stringify(pending))
    }

    setSelectedReferral(null)
    setCustomNote("")
    setSelectedDiag("")
    setPatientCode("")
    loadData()
  }

  const handleDirectClose = () => {
    if (!closingReferral) return
    const validCode = (localStorage.getItem("medrelay.user_unique_code") || "PT-8891").trim().toUpperCase()
    if (closePatientCode.trim().toUpperCase() !== validCode) {
      alert(`Invalid Patient Unique Code! Please use ${validCode} to verify consent.`)
      return
    }

    closeReferral(
      closingReferral.id,
      closeNote.trim() || "Specialist inpatient treatment completed. Formal discharge note issued and referral closed.",
      "Indira Gandhi Govt General Hospital, Pondicherry"
    )

    setClosingReferral(null)
    setCloseNote("")
    setClosePatientCode("")
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inbound Referrals & Closures</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
              IGGGH / District Hospital
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Review incoming Sub-Centre/PHC transfers, order pre-arrival diagnostics, and finalize discharge summaries.
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
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white w-64 shadow-xs"
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Inbound Transfers</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <UserPlus size={22} />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setActiveTab("active")} 
          className={`cursor-pointer transition-all border-l-4 border-l-amber-500 shadow-xs hover:shadow-md ${activeTab === "active" ? "ring-2 ring-amber-500" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Active Inbound / Pending Action</p>
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
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed / Discharged</p>
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
            activeTab === "all" ? "border-red-600 text-red-800" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All Inbound ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "active" ? "border-amber-500 text-amber-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Action Required ({activeCount})
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

      {/* Dedicated Multi-Column Table */}
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
                    <UserPlus size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">No inbound referrals matching your selection.</p>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map(ref => {
                  const closed = isReferralClosed(ref)
                  const closureInfo = closed ? getClosureDetails(ref) : null
                  const activeStageIndex = ref.stages.findIndex(s => s.status === "current")
                  const activeStage = activeStageIndex !== -1 ? ref.stages[activeStageIndex] : null

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      {/* Column 1: Referral ID & Patient */}
                      <td className="py-4 px-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs">
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
                          {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : "Active Inbound"}
                        </div>
                      </td>

                      {/* Column 2: Medical History & Reason */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-900 block mb-0.5">Clinical Indication:</span>
                          {ref.reason}
                        </div>
                        {ref.stages.find(s => s.note) && (
                          <div className="text-[11px] text-slate-500 italic pl-1 border-l-2 border-red-300">
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
                          Origin: <strong className="text-slate-600">{ref.stages[0]?.facility.split(',')[0]}</strong> → Tertiary: <strong className="text-slate-600">IGGGH, Pondicherry</strong>
                        </div>
                      </td>

                      {/* Column 4: Referral Close & Discharge */}
                      <td className="py-4 px-4 space-y-1.5">
                        {closed ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={13} />
                              Discharged & Closed
                            </span>
                            {closureInfo && (
                              <div className="text-xs bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 space-y-1">
                                <p className="text-[11px] text-emerald-950 font-medium leading-tight">
                                  {closureInfo.note}
                                </p>
                                <p className="text-[10px] text-emerald-700/80">
                                  Closed at: {closureInfo.facility} • {closureInfo.date}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock size={13} />
                              Hospital Action Pending
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Active Stage: <strong className="text-slate-700">{activeStage ? activeStage.facility : "Pending next step"}</strong>
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-4 px-4 text-right space-y-2">
                        {!closed ? (
                          <div className="flex flex-col items-end gap-1.5">
                            {activeStageIndex !== -1 && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedReferral({ ref, stageIndex: activeStageIndex })}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-3 rounded-lg shadow-xs font-bold cursor-pointer whitespace-nowrap"
                              >
                                {activeStageIndex === ref.stages.length - 1 ? "Complete & Close" : "Accept & Prescribe"}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setClosingReferral(ref)}
                              className="text-xs h-8 px-3 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer whitespace-nowrap"
                            >
                              Direct Discharge
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 inline-flex items-center gap-1">
                            <FileCheck2 size={14} className="text-emerald-500" />
                            Discharged
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

      {/* Modal: Acknowledgment & Pre-Arrival Diagnostics */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedReferral.stageIndex === selectedReferral.ref.stages.length - 1 ? "Complete Consultation & Discharge" : "Acknowledge Inbound Referral"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Ref ID: <span className="font-mono font-bold text-red-700">{selectedReferral.ref.id}</span></p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {selectedReferral.stageIndex === selectedReferral.ref.stages.length - 1 ? "Consultation Notes / Discharge Diagnosis" : "Clinical Triage Note"}
                </label>
                <textarea 
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder={selectedReferral.stageIndex === selectedReferral.ref.stages.length - 1 ? "e.g., Patient stabilized, appendectomy completed successfully. Discharged." : "e.g., Bed reserved in surgical casualty. Patient should report immediately."}
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                />
              </div>

              {selectedReferral.stageIndex === selectedReferral.ref.stages.length - 1 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Unique Code (ABDM Consent)</label>
                    <button 
                      type="button" 
                      onClick={() => setPatientCode("PT-8891")}
                      className="text-xs text-red-700 hover:text-red-800 font-bold bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      ⚡ Auto-Fill: PT-8891
                    </button>
                  </div>
                  <input 
                    type="text"
                    placeholder="Enter PT-8891" 
                    value={patientCode} 
                    onChange={e => setPatientCode(e.target.value.toUpperCase())} 
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
                  />
                </div>
              )}

              {selectedReferral.stageIndex !== selectedReferral.ref.stages.length - 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Prescribe Diagnostics Pre-Arrival (Optional)</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                      className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={selectedDiag}
                      onChange={e => setSelectedDiag(e.target.value)}
                    >
                      <option value="">-- No test requested --</option>
                      <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                      <option value="Chest X-Ray">Chest X-Ray</option>
                      <option value="Ultrasound Abdomen">Ultrasound Abdomen</option>
                      <option value="ECG">ECG</option>
                    </select>
                    {selectedDiag && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          placeholder="Code (PT-8891)" 
                          value={patientCode} 
                          onChange={e => setPatientCode(e.target.value.toUpperCase())} 
                          className="w-32 p-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={() => setPatientCode("PT-8891")}
                          className="text-xs text-red-700 font-bold bg-red-100 px-2 py-1.5 rounded-lg cursor-pointer"
                        >
                          PT-8891
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setSelectedReferral(null); setCustomNote(""); setSelectedDiag(""); setPatientCode(""); }}>Cancel</Button>
              <Button onClick={handleAcknowledge} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                {selectedReferral.stageIndex === selectedReferral.ref.stages.length - 1 ? "Complete & Discharge" : "Accept Referral"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Direct Close / Discharge Referral */}
      {closingReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Hospital Discharge & Referral Closure</h2>
                <p className="text-xs text-slate-500 mt-0.5">Referral ID: <span className="font-mono font-bold text-red-700">{closingReferral.id}</span></p>
              </div>
              <button 
                onClick={() => setClosingReferral(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900">
                <strong>Patient:</strong> {closingReferral.patientName}<br/>
                <strong>Admission Reason:</strong> {closingReferral.reason}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hospital Discharge Summary & Closure Note
                </label>
                <textarea 
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="e.g., Surgery completed successfully. Patient afebrile with normal vitals. Discharged back to PHC for follow-up care."
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
                    onClick={() => setClosePatientCode("PT-8891")}
                    className="text-xs text-red-700 hover:text-red-800 font-bold bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    ⚡ Auto-Fill: PT-8891
                  </button>
                </div>
                <input 
                  type="text"
                  placeholder="Enter PT-8891" 
                  value={closePatientCode} 
                  onChange={e => setClosePatientCode(e.target.value.toUpperCase())} 
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setClosingReferral(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDirectClose} 
                disabled={!closePatientCode.trim()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirm Discharge & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
