"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  getCitizenGrievances, 
  updateGrievanceAction, 
  ensureDemoSeedData, 
  type CitizenGrievance 
} from "@/lib/store"
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  Clock, 
  Building2, 
  User, 
  Phone, 
  FileText, 
  Search, 
  Filter, 
  Check, 
  X, 
  Scale, 
  ShieldCheck, 
  Truck, 
  AlertOctagon, 
  ArrowRight, 
  FileCheck2,
  Sparkles,
  Gavel
} from "lucide-react"

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<CitizenGrievance[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | CitizenGrievance["status"]>("All")
  const [selectedGrievance, setSelectedGrievance] = useState<CitizenGrievance | null>(null)

  // Action modal form states
  const [actionType, setActionType] = useState<
    "show_cause" | "deploy_inspector" | "emergency_reroute" | "impose_penalty" | "resolve"
  >("show_cause")
  const [actionNotes, setActionNotes] = useState("")
  const [officerName, setOfficerName] = useState("Dr. K. Ramanathan, District Health Officer (DHO), Puducherry")
  const [penaltyPoints, setPenaltyPoints] = useState<number>(15)

  const loadData = () => {
    ensureDemoSeedData()
    setGrievances(getCitizenGrievances())
  }

  useEffect(() => {
    loadData()
    const handleStorage = () => loadData()
    window.addEventListener("storage", handleStorage)
    window.addEventListener("medrelay-grievance-update", handleStorage)
    const interval = setInterval(loadData, 2000)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("medrelay-grievance-update", handleStorage)
      clearInterval(interval)
    }
  }, [])

  const handleOpenActionModal = (g: CitizenGrievance) => {
    setSelectedGrievance(g)
    if (g.category.includes("Emergency SOS") || g.category.includes("Not Responding")) {
      setActionType("show_cause")
      setActionNotes(
        `Formal show-cause notice served to In-charge Medical Officer, ${g.facility} under Section 43 of Puducherry Public Health Act. Explanation demanded within 24 hours regarding unaccepted emergency SOS / non-responsiveness.`
      )
      setPenaltyPoints(20)
    } else {
      setActionType("deploy_inspector")
      setActionNotes(
        `DHS Flying Squad dispatched to conduct surprise clinical audit at ${g.facility}. Inventory and duty registers to be seized for verification.`
      )
      setPenaltyPoints(10)
    }
  }

  const handleActionTypeChange = (type: typeof actionType) => {
    setActionType(type)
    if (!selectedGrievance) return

    if (type === "show_cause") {
      setActionNotes(
        `Formal show-cause notice served to In-charge Medical Officer, ${selectedGrievance.facility} under Section 43 of Puducherry Public Health Act. Written explanation required within 24 hours.`
      )
      setPenaltyPoints(20)
    } else if (type === "deploy_inspector") {
      setActionNotes(
        `Directorate Flying Squad deployed to ${selectedGrievance.facility} for surprise inspection of casualty, staff roster, and teleconsult logs.`
      )
      setPenaltyPoints(10)
    } else if (type === "emergency_reroute") {
      setActionNotes(
        `Emergency override initiated: Backup 108 Emergency Ambulance dispatched directly from Command. Patient re-routed to Indira Gandhi Govt General Hospital (IGGGH) Casualty.`
      )
      setPenaltyPoints(25)
    } else if (type === "impose_penalty") {
      setActionNotes(
        `Administrative sanction imposed: 30 Demerit Points deducted from ${selectedGrievance.facility} in the Puducherry Swasthya Leaderboard. Disciplinary inquiry initiated against night duty staff.`
      )
      setPenaltyPoints(30)
    } else if (type === "resolve") {
      setActionNotes(
        `Inquiry completed by Nodal Officer. Corrective remediation implemented at ${selectedGrievance.facility}. Patient contacted and informed of resolution. Case closed.`
      )
      setPenaltyPoints(0)
    }
  }

  const handleExecuteAction = () => {
    if (!selectedGrievance) return
    if (!actionNotes.trim()) {
      alert("Please provide the administrative order note.")
      return
    }

    let nextStatus: CitizenGrievance["status"] = "Under Investigation"
    if (actionType === "show_cause") nextStatus = "Show-Cause Issued"
    else if (actionType === "deploy_inspector") nextStatus = "Under Investigation"
    else if (actionType === "emergency_reroute") nextStatus = "Under Investigation"
    else if (actionType === "impose_penalty" || actionType === "resolve") nextStatus = "Resolved & Penalized"

    updateGrievanceAction(
      selectedGrievance.id,
      nextStatus,
      actionNotes.trim(),
      officerName.trim() || "District Health Officer, Puducherry",
      penaltyPoints > 0 ? -penaltyPoints : undefined
    )

    setSelectedGrievance(null)
    setActionNotes("")
    loadData()
  }

  const filteredGrievances = grievances.filter(g => {
    const matchesSearch = 
      (g.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.patientCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.facility || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    if (statusFilter === "All") return true
    return g.status === statusFilter
  })

  const totalCount = grievances.length
  const pendingCount = grievances.filter(g => g.status === "Pending Action").length
  const showCauseCount = grievances.filter(g => g.status === "Show-Cause Issued").length
  const resolvedCount = grievances.filter(g => g.status === "Resolved & Penalized").length

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Government Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Directorate of Health &amp; Family Welfare Services
            </span>
            <span className="text-xs font-semibold text-slate-500">Govt of Puducherry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Citizen Grievances &amp; Emergency Escalation Command
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review reported unresponsive PHCs, unaccepted emergency SOS distresses, and enforce strict administrative show-cause notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Ticket, Patient, PHC..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white w-64 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          onClick={() => setStatusFilter("All")}
          className={`cursor-pointer transition-all border-l-4 border-l-slate-900 shadow-xs hover:shadow-md ${statusFilter === "All" ? "ring-2 ring-slate-900" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports Filed</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <FileText size={22} />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter("Pending Action")}
          className={`cursor-pointer transition-all border-l-4 border-l-red-600 shadow-xs hover:shadow-md ${statusFilter === "Pending Action" ? "ring-2 ring-red-600" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Pending Govt Action</p>
              <p className="text-2xl font-black text-red-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 animate-pulse">
              <AlertTriangle size={22} />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter("Show-Cause Issued")}
          className={`cursor-pointer transition-all border-l-4 border-l-amber-500 shadow-xs hover:shadow-md ${statusFilter === "Show-Cause Issued" ? "ring-2 ring-amber-500" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Show-Cause Notices</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{showCauseCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Gavel size={22} />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter("Resolved & Penalized")}
          className={`cursor-pointer transition-all border-l-4 border-l-emerald-600 shadow-xs hover:shadow-md ${statusFilter === "Resolved & Penalized" ? "ring-2 ring-emerald-600" : ""}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved & Penalized</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(["All", "Pending Action", "Show-Cause Issued", "Under Investigation", "Resolved & Penalized"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              statusFilter === tab 
                ? "border-red-600 text-red-700" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dedicated Multi-Column Grievances Table */}
      <Card className="shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 w-[18%]">Grievance ID &amp; Citizen</th>
                <th className="py-3.5 px-4 w-[24%]">Facility &amp; Category</th>
                <th className="py-3.5 px-4 w-[25%]">Citizen Statement &amp; Severity</th>
                <th className="py-3.5 px-4 w-[18%]">Govt Action &amp; Remediation</th>
                <th className="py-3.5 px-4 w-[15%] text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ShieldCheck size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">No citizen grievances found matching your filter.</p>
                  </td>
                </tr>
              ) : (
                filteredGrievances.map(grv => {
                  const isPending = grv.status === "Pending Action"
                  const isShowCause = grv.status === "Show-Cause Issued"
                  const isInvestigation = grv.status === "Under Investigation"
                  const isResolved = grv.status === "Resolved & Penalized"

                  return (
                    <tr key={grv.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      
                      {/* Column 1: Grievance ID & Citizen */}
                      <td className="py-4 px-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                            {grv.id}
                          </span>
                          <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                            {grv.patientCode}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {grv.patientName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" />
                          {grv.phone}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(grv.createdAt).toLocaleString()}
                        </div>
                      </td>

                      {/* Column 2: Facility & Category */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building2 size={14} className="text-slate-500 shrink-0" />
                          <span>{grv.facility}</span>
                        </div>
                        <div className="text-xs text-red-900 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                          {grv.category}
                        </div>
                        {grv.emergencySosId && (
                          <span className="inline-block text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            Linked SOS: {grv.emergencySosId}
                          </span>
                        )}
                      </td>

                      {/* Column 3: Citizen Statement & Severity */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            grv.severity === "Critical" ? "bg-red-600 text-white shadow-xs" :
                            grv.severity === "High" ? "bg-amber-600 text-white shadow-xs" :
                            "bg-slate-700 text-white"
                          }`}>
                            {grv.severity} Severity
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          "{grv.description}"
                        </div>
                      </td>

                      {/* Column 4: Govt Status & Notes */}
                      <td className="py-4 px-4 space-y-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isPending ? "bg-red-100 text-red-800 border-red-200 animate-pulse" :
                          isShowCause ? "bg-amber-100 text-amber-800 border-amber-300" :
                          isInvestigation ? "bg-indigo-100 text-indigo-800 border-indigo-200" :
                          "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}>
                          {isPending && <AlertCircle size={12} />}
                          {isShowCause && <AlertTriangle size={12} />}
                          {isResolved && <CheckCircle2 size={12} />}
                          {grv.status}
                        </span>

                        {grv.actionNotes ? (
                          <div className="text-xs bg-amber-50/70 p-2 rounded-lg border border-amber-200 space-y-1 mt-1">
                            <p className="text-[11px] text-amber-950 font-medium leading-tight">
                              {grv.actionNotes}
                            </p>
                            <p className="text-[10px] text-amber-800/80">
                              By: {grv.actionTakenBy}
                            </p>
                            {grv.penaltyPoints && (
                              <span className="inline-block text-[10px] font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                Penalty: {grv.penaltyPoints} Pts
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            Awaiting review by District Health Officer.
                          </p>
                        )}
                      </td>

                      {/* Column 5: Action Button */}
                      <td className="py-4 px-4 text-right space-y-2">
                        <Button
                          size="sm"
                          onClick={() => handleOpenActionModal(grv)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 px-3 rounded-lg shadow-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          <Gavel size={13} className="mr-1" />
                          Take Govt Action
                        </Button>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Official Government Action Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Gavel size={18} className="text-amber-400" />
                  <h2 className="text-lg font-bold">Government Administrative Enforcement</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ticket: <span className="font-mono font-bold text-white">{selectedGrievance.id}</span> • Facility: <span className="text-amber-300 font-semibold">{selectedGrievance.facility}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedGrievance(null)}
                className="text-slate-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Grievance Summary Box */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-950 space-y-1">
                <div className="flex items-center justify-between font-bold text-red-900">
                  <span>Category: {selectedGrievance.category}</span>
                  <span className="font-mono text-red-700">{selectedGrievance.patientCode}</span>
                </div>
                <p className="leading-relaxed text-red-900">
                  <strong>Citizen Statement:</strong> "{selectedGrievance.description}"
                </p>
              </div>

              {/* Action Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Select Administrative Enforcement Action
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleActionTypeChange("show_cause")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      actionType === "show_cause" 
                        ? "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20" 
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    ⚖️ Issue Show-Cause Notice
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionTypeChange("deploy_inspector")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      actionType === "deploy_inspector" 
                        ? "bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20" 
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    🔍 Deploy Flying Squad / Inspector
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionTypeChange("emergency_reroute")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      actionType === "emergency_reroute" 
                        ? "bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500/20" 
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    🚑 Direct Emergency 108 Re-Route
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionTypeChange("impose_penalty")}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      actionType === "impose_penalty" 
                        ? "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20" 
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    📉 Impose Disciplinary Penalty (-30 Pts)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionTypeChange("resolve")}
                    className={`sm:col-span-2 p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      actionType === "resolve" 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20" 
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    ✅ Complete Inquiry &amp; Close with Remediation
                  </button>
                </div>
              </div>

              {/* Administrative Order Statement */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Official Administrative Order &amp; Remediation Directive
                </label>
                <textarea
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed text-slate-900"
                  placeholder="Enter official government directive, inquiry terms, or notice parameters..."
                />
              </div>

              {/* Authorizing Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Authorizing Officer
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={e => setOfficerName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Demerit Points Against Facility
                  </label>
                  <input
                    type="number"
                    value={penaltyPoints}
                    onChange={e => setPenaltyPoints(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedGrievance(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteAction}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Authorize &amp; Enforce Government Order
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

