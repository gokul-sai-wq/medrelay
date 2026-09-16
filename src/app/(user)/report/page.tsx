"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  getCitizenGrievances, 
  submitCitizenGrievance, 
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
  Send, 
  Mic, 
  MicOff, 
  KeyRound, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Sparkles
} from "lucide-react"

const CATEGORIES = [
  { id: "Emergency SOS Not Accepted / Ignored", label: "🚨 Emergency SOS Not Accepted / Ignored", urgent: true },
  { id: "PHC / Sub-Centre Not Responding", label: "🏥 PHC / Sub-Centre Not Responding", urgent: true },
  { id: "No Proper Response / Inadequate Medical Care", label: "⚠️ No Proper Response / Care Negligence", urgent: false },
  { id: "Ambulance (108) Delayed or Denied", label: "🚑 Ambulance (108) Delayed / Denied", urgent: true },
  { id: "Staff Absent / Facility Locked during OPD", label: "🔒 Staff Absent / Facility Locked during OPD", urgent: false },
  { id: "Medicines Denied / False Out of Stock", label: "💊 Medicines Denied / Stock Withheld", urgent: false },
  { id: "Bribery / Undue Demand", label: "🚫 Bribery / Undue Demand / Misconduct", urgent: false }
]

const FACILITIES = [
  "Villianur Sub-Centre PHC, Pondicherry",
  "Villianur PHC, Pondicherry",
  "Bahour PHC, Pondicherry",
  "Ariyankuppam Sub-Centre, Pondicherry",
  "Nettapakkam PHC, Pondicherry",
  "Indira Gandhi Govt General Hospital (IGGGH), Pondicherry",
  "108 Emergency Dispatch Command, Pondicherry",
  "Directorate of Health Services (General Department)"
]

function ReportForm() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "Emergency SOS Not Accepted / Ignored"
  const initialFacility = searchParams.get("facility") || "Villianur Sub-Centre PHC, Pondicherry"
  const initialSosId = searchParams.get("sosId") || ""

  const [category, setCategory] = useState(initialCategory)
  const [facility, setFacility] = useState(initialFacility)
  const [patientCode, setPatientCode] = useState("PT-8891")
  const [patientName, setPatientName] = useState("Aarav Kumar")
  const [phone, setPhone] = useState("+91 98401 23456")
  const [severity, setSeverity] = useState<"Critical" | "High" | "Medium" | "General">("Critical")
  const [description, setDescription] = useState("")
  const [emergencySosId, setEmergencySosId] = useState(initialSosId)
  
  const [submittedGrievance, setSubmittedGrievance] = useState<CitizenGrievance | null>(null)
  const [grievanceHistory, setGrievanceHistory] = useState<CitizenGrievance[]>([])
  const [isVoiceRecorded, setIsVoiceRecorded] = useState(false)

  const loadData = () => {
    ensureDemoSeedData()
    const all = getCitizenGrievances()
    setGrievanceHistory(all)
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

  useEffect(() => {
    const storedCode = localStorage.getItem("medrelay.user_unique_code") || "PT-8891"
    setPatientCode(storedCode)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      alert("Please provide a brief statement of what occurred.")
      return
    }

    const created = submitCitizenGrievance({
      patientCode: patientCode.trim().toUpperCase() || "PT-8891",
      patientName: patientName.trim() || "Aarav Kumar",
      phone: phone.trim() || "+91 98401 23456",
      category,
      facility,
      severity,
      description: isVoiceRecorded ? `[Audio Note Attached]: ${description}` : description,
      emergencySosId: emergencySosId.trim() || undefined
    })

    setSubmittedGrievance(created)
    setDescription("")
    setIsVoiceRecorded(false)
    loadData()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Govt Command Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-red-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                Govt Public Grievance Hotline
              </span>
              <span className="text-slate-400 text-xs font-semibold">Puducherry Health Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Report Unresponsive PHC, Unaccepted SOS & Care Grievance
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Every complaint filed here escalates directly to the <strong>District Health Command Center & Directorate of Health Services (DHS)</strong>. Health administrators investigate non-responsive duty officers and enforce disciplinary show-cause notices.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 text-center space-y-1">
            <p className="text-xs text-slate-300 font-medium">Official Resolution SLA</p>
            <p className="text-xl font-black text-amber-300">&lt; 2 Hours</p>
            <p className="text-[11px] text-slate-400">Puducherry Public Health Act</p>
          </div>
        </div>
      </div>

      {/* Success Banner if just submitted */}
      {submittedGrievance && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 text-emerald-950 shadow-md animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-900">Official Grievance Logged with Government Command</h3>
                <span className="font-mono text-xs font-extrabold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                  Ticket ID: {submittedGrievance.id}
                </span>
              </div>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Your report regarding <strong>{submittedGrievance.facility}</strong> ({submittedGrievance.category}) has been dispatched to the District Health Officer. Action will be reviewed in the Government Command audit.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setSubmittedGrievance(null)}
                  className="text-xs font-bold text-emerald-700 underline cursor-pointer hover:text-emerald-900"
                >
                  File another report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Form Card */}
      <Card className="shadow-lg border border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-600" />
            Incident Statement & Facility Details
          </CardTitle>
          <CardDescription>
            Specify the facility, incident category, and statement. All submissions are timestamped and signed with your Patient Code.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Category Presets */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Select Violation / Grievance Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {CATEGORIES.map(cat => {
                  const selected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id)
                        if (cat.urgent) setSeverity("Critical")
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        selected 
                          ? "bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500/20 shadow-xs" 
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {selected && <CheckCircle2 size={16} className="text-red-600 shrink-0 ml-1.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Facility & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Public Health Facility Involved
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={facility}
                    onChange={e => setFacility(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    {FACILITIES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Incident Severity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Critical", "High", "Medium", "General"] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        severity === sev 
                          ? sev === "Critical" ? "bg-red-700 text-white border-red-700 shadow-sm"
                            : sev === "High" ? "bg-amber-700 text-white border-amber-700 shadow-sm"
                            : "bg-slate-900 text-white border-slate-900"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Citizen Identifier */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient Unique Code
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setPatientCode("PT-8891")}
                    className="text-[11px] font-bold text-teal-700 bg-teal-100 hover:bg-teal-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    ⚡ PT-8891
                  </button>
                </div>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={patientCode}
                    onChange={e => setPatientCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PT-8891"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Citizen Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Statement / Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Detailed Incident Statement / Grievance Narrative
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceRecorded(!isVoiceRecorded)
                    if (!description && !isVoiceRecorded) {
                      setDescription("Emergency mode was activated for severe chest distress. No staff answered or acknowledged the video dispatch for 30 minutes.")
                    }
                  }}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isVoiceRecorded ? "bg-red-100 text-red-700 border border-red-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {isVoiceRecorded ? <MicOff size={13} className="text-red-600" /> : <Mic size={13} className="text-slate-600" />}
                  {isVoiceRecorded ? "Voice Note Attached" : "Attach Voice Transcript"}
                </button>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="State what occurred in detail: e.g., 'Triggered emergency SOS at 10:45 PM. Emergency call was left unanswered by the Sub-Centre PHC duty desk. When reached by phone, no proper response was provided.'"
                rows={4}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 leading-relaxed placeholder:text-slate-400"
                required
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                <span>Protected under Puducherry Citizen Healthcare Charter &amp; Whistleblower Protection</span>
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-bold px-8 py-6 rounded-xl shadow-md text-base flex items-center gap-2 cursor-pointer"
              >
                <Send size={18} />
                Submit Official Report to District Command
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Grievances Tracker & Government Action Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-slate-700" />
              My Grievance History & Live Government Actions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track real-time administrative responses, show-cause notices, and inspection orders issued by government officers.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {grievanceHistory.length} Total Filed
          </span>
        </div>

        <div className="space-y-3">
          {grievanceHistory.length === 0 ? (
            <Card className="p-8 text-center text-slate-400 border-dashed">
              <p className="text-sm font-semibold text-slate-600">No grievances logged yet.</p>
              <p className="text-xs text-slate-400 mt-1">If a PHC fails to respond or ignores an emergency, file an escalation above.</p>
            </Card>
          ) : (
            grievanceHistory.map(grv => {
              const isResolved = grv.status === "Resolved & Penalized"
              const isShowCause = grv.status === "Show-Cause Issued"
              const isInvestigation = grv.status === "Under Investigation"
              const isPending = grv.status === "Pending Action"

              return (
                <Card 
                  key={grv.id} 
                  className={`overflow-hidden transition-all border-l-4 shadow-xs hover:shadow-md ${
                    isPending ? "border-l-red-500 bg-white" :
                    isShowCause ? "border-l-amber-500 bg-white" :
                    isInvestigation ? "border-l-indigo-500 bg-white" :
                    "border-l-emerald-500 bg-emerald-50/20"
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                          {grv.id}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {grv.facility}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-600 font-medium">
                          {grv.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isPending ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                          isShowCause ? "bg-amber-50 text-amber-800 border-amber-200" :
                          isInvestigation ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                          "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}>
                          {isPending && <AlertCircle size={12} />}
                          {isShowCause && <AlertTriangle size={12} />}
                          {isResolved && <CheckCircle2 size={12} />}
                          {grv.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(grv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Citizen Statement */}
                    <div className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      <span className="font-bold text-slate-900 block mb-0.5">Citizen Incident Report:</span>
                      "{grv.description}"
                    </div>

                    {/* Government Action Feedback */}
                    {grv.actionNotes ? (
                      <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1">
                            <ShieldAlert size={14} className="text-amber-700" />
                            Official Government Action &amp; Remediation Order:
                          </span>
                          {grv.penaltyPoints && (
                            <span className="font-mono text-[11px] font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200">
                              Facility Penalty: {grv.penaltyPoints} Pts
                            </span>
                          )}
                        </div>
                        <p className="text-amber-900 leading-relaxed pl-5 font-medium">
                          {grv.actionNotes}
                        </p>
                        <div className="pl-5 pt-1 text-[11px] text-amber-700/80 flex items-center gap-2">
                          <span>Authorized by: <strong>{grv.actionTakenBy}</strong></span>
                          {grv.actionDate && <span>• {new Date(grv.actionDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                        <Clock size={14} className="text-amber-500 animate-spin" />
                        <span>Assigned to District Nodal Officer. Inspection and show-cause notice pending review.</span>
                      </div>
                    )}

                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading grievance center...</div>}>
      <ReportForm />
    </Suspense>
  )
}

