"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle2, Clock, Play, X, ShieldAlert, Loader2, ArrowRight, FlaskConical, AlertTriangle, CalendarClock, Calendar, Check, Stethoscope } from "lucide-react"
import { addReferral, getAppointmentRequests, updateAppointmentRequestStatus, AppointmentRequest } from "@/lib/store"

export default function PHCQueuePage() {
  const [queue, setQueue] = useState<any[]>([])
  const [activePatient, setActivePatient] = useState<any | null>(null)
  
  // Appointment Requests State
  const [appointmentReqs, setAppointmentReqs] = useState<AppointmentRequest[]>([])
  const [assignTimeMap, setAssignTimeMap] = useState<Record<string, string>>({})
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})

  // Consent State
  const [consentCode, setConsentCode] = useState("")
  const [consentStatus, setConsentStatus] = useState<"idle" | "requesting" | "approved" | "declined">("idle")
  
  // Full Consultation State
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [otherFlags, setOtherFlags] = useState("")
  const [selectedDiag, setSelectedDiag] = useState("")
  const [notes, setNotes] = useState("")
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])

  useEffect(() => {
    // Seed initial queue if empty
    let q = JSON.parse(localStorage.getItem("medrelay.live_queue") || "[]")
    if (q.length === 0) {
      q = [
        { id: "Q-101", facility: "Villianur Sub-Centre PHC, Pondicherry", patientName: "Rahul Sharma", time: "09:00 AM", status: "waiting", date: new Date().toLocaleDateString() },
        { id: "Q-102", facility: "Villianur Sub-Centre PHC, Pondicherry", patientName: "Priya Patel", time: "09:15 AM", status: "waiting", date: new Date().toLocaleDateString() },
        { id: "Q-103", facility: "Villianur Sub-Centre PHC, Pondicherry", patientName: "Amit Singh", time: "09:30 AM", status: "waiting", date: new Date().toLocaleDateString() },
      ]
      localStorage.setItem("medrelay.live_queue", JSON.stringify(q))
    }

    const fetchQueue = () => {
      setQueue(JSON.parse(localStorage.getItem("medrelay.live_queue") || "[]"))

      // Fetch appointment requests for PHC / Sub-Centre
      const reqs = getAppointmentRequests().filter(r => 
        r.facility === "Shirur PHC" || r.facility.includes("Villianur") || r.facility.includes("Sub-Centre") || r.facility.includes("PHC")
      )
      setAppointmentReqs(reqs)

      // Poll consent status if we are waiting for it
      const currentConsent = JSON.parse(localStorage.getItem("medrelay.pending_consent") || "null")
      if (currentConsent && consentStatus === "requesting") {
         if (currentConsent.status === "approved") {
            setConsentStatus("approved")
            localStorage.removeItem("medrelay.pending_consent")

            // Fetch Medical History once approved
            const hist = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
            hist.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            setMedicalHistory(hist)
         } else if (currentConsent.status === "declined") {
            setConsentStatus("declined")
            localStorage.removeItem("medrelay.pending_consent")
         }
      }
    }
    
    fetchQueue()
    const handleStorage = () => fetchQueue()
    window.addEventListener("storage", handleStorage)
    window.addEventListener("medrelay-consent-update", handleStorage)
    const interval = setInterval(fetchQueue, 500)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("medrelay-consent-update", handleStorage)
      clearInterval(interval)
    }
  }, [consentStatus])

  const phcQueue = queue.filter(q => (q.facility.includes("Sub-Centre") || q.facility.includes("PHC")) && q.status === "waiting")
  const nextPatient = phcQueue.length > 0 ? phcQueue[0] : null

  const handleConfirmAppointment = (req: AppointmentRequest) => {
    const assignedTime = assignTimeMap[req.id] || "09:30 AM"
    const staffNote = noteMap[req.id] || "Schedule confirmed by PHC staff. Please bring your ABHA ID."

    updateAppointmentRequestStatus(req.id, {
      status: "confirmed",
      confirmedTime: assignedTime,
      facilityNote: staffNote
    })

    // Also add to live queue if for today
    const q = JSON.parse(localStorage.getItem("medrelay.live_queue") || "[]")
    if (!q.some((item: any) => item.patientName === req.patientName && item.facility === req.facility)) {
       q.push({
          id: "Q-" + Math.floor(Math.random() * 10000),
          facility: req.facility,
          patientName: req.patientName,
          time: assignedTime,
          status: "waiting",
          date: req.requestedDate
       })
       localStorage.setItem("medrelay.live_queue", JSON.stringify(q))
       setQueue(q)
    }

    setAppointmentReqs(getAppointmentRequests().filter(r => 
      r.facility.includes("Villianur") || r.facility.includes("Sub-Centre") || r.facility.includes("PHC")
    ))
  }

  const handleDeclineAppointment = (id: string) => {
     updateAppointmentRequestStatus(id, { status: "declined" })
     setAppointmentReqs(getAppointmentRequests().filter(r => 
       r.facility.includes("Villianur") || r.facility.includes("Sub-Centre") || r.facility.includes("PHC")
     ))
  }

  const handleRequestConsent = (overrideCode?: string) => {
    const code = (overrideCode || consentCode).trim().toUpperCase()
    if (!code) return
    setConsentCode(code)
    setConsentStatus("requesting")
    localStorage.setItem("medrelay.pending_consent", JSON.stringify({
      facility: "Villianur Sub-Centre PHC, Pondicherry",
      patientCode: code,
      status: "pending",
      timestamp: Date.now()
    }))
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new CustomEvent("medrelay-consent-update"))
  }

  const handleComplete = (actionType: "treated" | "referred") => {
    if (!activePatient) return

    // If diagnostics requested, push them
    if (selectedDiag) {
      const pending = JSON.parse(localStorage.getItem("medrelay.pending_diagnostics") || "[]")
      pending.push({
        id: "REQ-" + Math.floor(Math.random() * 10000),
        testName: selectedDiag,
        source: "Villianur PHC, Pondicherry",
        date: new Date().toLocaleString(),
      })
      localStorage.setItem("medrelay.pending_diagnostics", JSON.stringify(pending))
    }

    // Save to global Medical History
    const history = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
    history.push({
      date: new Date().toISOString(),
      facility: "Villianur PHC, Pondicherry",
      chiefComplaint,
      flags: [...selectedFlags, otherFlags].filter(Boolean),
      diagnostics: selectedDiag,
      actionTaken: actionType === "treated" ? "Treated in OPD: " + notes : "Referred to Indira Gandhi Govt Hospital, Pondicherry",
      status: actionType === "treated" ? "Treated" : "Referred"
    })
    localStorage.setItem("medrelay.medical_history", JSON.stringify(history))

    if (actionType === "referred") {
      addReferral({
        id: "REF-" + Math.floor(1000 + Math.random() * 9000),
        reason: chiefComplaint || "Further treatment and diagnostics required",
        createdAt: new Date().toLocaleString(),
        stages: [
          { label: "PHC Assessment", facility: "Villianur PHC, Pondicherry", status: "done", note: notes || "Initial assessment completed." },
          { label: "Hospital Triage", facility: "Indira Gandhi Govt Hospital, Pondicherry", status: "current" },
          { label: "Specialist Consult", facility: "Indira Gandhi Govt Hospital, Pondicherry", status: "pending" }
        ]
      })
    }

    const updatedQueue = queue.map(q => {
      if (q.id === activePatient.id) {
        return { ...q, status: "completed", notes, chiefComplaint, selectedFlags, actionType }
      }
      return q
    })

    localStorage.setItem("medrelay.live_queue", JSON.stringify(updatedQueue))
    setQueue(updatedQueue)
    resetModal()
  }

  const resetModal = () => {
    setActivePatient(null)
    setConsentStatus("idle")
    setConsentCode("")
    setChiefComplaint("")
    setSelectedFlags([])
    setOtherFlags("")
    setSelectedDiag("")
    setNotes("")
  }

  const toggleFlag = (id: string) => setSelectedFlags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Dynamic Modal that shows Consent Gate OR Full Consultation */}
      {activePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${consentStatus === 'approved' ? 'max-w-4xl' : 'max-w-lg'}`}>
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-teal-50">
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">PHC Patient Processing</h2>
                    <p className="text-sm text-slate-500 mt-1">Patient: {activePatient.patientName}</p>
                 </div>
                 <button onClick={resetModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>

              {/* STAGE 1: CONSENT GATE */}
              {consentStatus !== "approved" && (
                <div className="p-8 text-center space-y-6">
                   <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldAlert size={32} />
                   </div>
                   
                   {consentStatus === "idle" && (
                      <>
                        <h3 className="text-2xl font-black text-slate-900">Data Access Required</h3>
                        <p className="text-slate-500 text-sm">To comply with ABDM privacy standards, you must request access to the patient's medical records.</p>
                        
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="Enter Patient Unique Code (e.g. PT-8891)"
                            value={consentCode}
                            onChange={e => setConsentCode(e.target.value.toUpperCase())}
                            className="w-full text-center text-lg p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono font-bold uppercase tracking-widest bg-slate-50"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Testing demo?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setConsentCode("PT-8891")
                                handleRequestConsent("PT-8891")
                              }}
                              className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-full transition-all cursor-pointer shadow-xs"
                            >
                              ⚡ Auto-Fill & Request: PT-8891
                            </button>
                          </div>
                        </div>

                        <Button disabled={!consentCode} onClick={() => handleRequestConsent()} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg rounded-xl font-bold">
                           Send Request to Patient
                        </Button>
                       <button 
                         onClick={() => { 
                            setConsentStatus("approved");
                            const hist = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]");
                            hist.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                            setMedicalHistory(hist);
                         }} 
                         className="text-slate-500 hover:text-teal-700 font-semibold text-sm mt-4 underline decoration-slate-300 underline-offset-4"
                       >
                          Patient does not have a smartphone? (Manual Override)
                       </button>
                     </>
                   )}

                   {consentStatus === "requesting" && (
                     <div className="py-8 space-y-4">
                        <Loader2 size={48} className="animate-spin text-teal-600 mx-auto" />
                        <h3 className="text-xl font-bold text-slate-700">Waiting for patient approval...</h3>
                        <p className="text-slate-500 text-sm">A request has been sent to the patient's device.</p>
                     </div>
                   )}

                   {consentStatus === "declined" && (
                     <div className="py-4 space-y-4">
                        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center justify-center gap-2">
                           <AlertTriangle size={20} /> Access Denied by Patient.
                        </div>
                        <Button onClick={() => setConsentStatus("idle")} variant="outline" className="w-full py-6">Try Again</Button>
                     </div>
                   )}
                </div>
              )}

              {/* STAGE 2: FULL CONSULTATION / INTAKE */}
              {consentStatus === "approved" && (
                <>
                  <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Chief Complaint / Reason for Visit</label>
                        <textarea 
                           className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                           placeholder="Describe the patient's symptoms in detail..."
                           value={chiefComplaint}
                           onChange={e => setChiefComplaint(e.target.value)}
                        ></textarea>
                     </div>

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Clinical Flags (Select all that apply)</label>
                        <div className="flex flex-wrap gap-2">
                           {[
                              {id: 'fever', label: 'High Fever'}, {id: 'cough', label: 'Persistent Cough'},
                              {id: 'pain', label: 'Severe Pain'}, {id: 'bleeding', label: 'Active Bleeding'},
                              {id: 'breathing', label: 'Breathing Difficulty'}, {id: 'pregnancy', label: 'Pregnancy Complication'},
                              {id: 'cardiac', label: 'Cardiac Arrest'}, {id: 'stroke', label: 'Stroke Symptoms'}
                           ].map(flag => (
                              <button 
                                 key={flag.id}
                                 onClick={() => toggleFlag(flag.id)}
                                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                    selectedFlags.includes(flag.id) 
                                    ? 'bg-rose-100 border-rose-200 text-rose-800' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                 }`}
                              >
                                 {flag.label}
                              </button>
                           ))}
                        </div>
                        <div className="mt-4">
                           <input 
                              type="text"
                              placeholder="Other clinical flags or observations (type here...)" 
                              value={otherFlags}
                              onChange={e => setOtherFlags(e.target.value)}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-slate-50"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><FlaskConical size={16} className="text-teal-600"/> Request Diagnostics</label>
                           <input 
                              list="phc-queue-diag-options"
                              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                              placeholder="Type a test name or select from list..."
                              value={selectedDiag}
                              onChange={e => setSelectedDiag(e.target.value)}
                           />
                           <datalist id="phc-queue-diag-options">
                              <option value="Complete Blood Count (CBC)" />
                              <option value="Malaria Rapid Diagnostic Test (RDT)" />
                              <option value="Dengue NS1 Antigen Test" />
                              <option value="Blood Glucose (Random)" />
                              <option value="Sputum Test for TB" />
                           </datalist>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-2">Prescription / Action Taken</label>
                           <textarea 
                              className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                              placeholder="e.g. Paracetamol 500mg..."
                              value={notes}
                              onChange={e => setNotes(e.target.value)}
                           ></textarea>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50">
                     <Button onClick={() => handleComplete('treated')} className="bg-teal-600 hover:bg-teal-700 text-white px-8"><CheckCircle2 className="w-4 h-4 mr-2" /> Treat & Complete</Button>
                     <Button onClick={() => handleComplete('referred')} className="bg-blue-600 hover:bg-blue-700 text-white px-8">Refer to Indira Gandhi Govt General Hospital, Pondicherry <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">PHC Queue & Scheduling Management</h1>
        <p className="text-slate-500 mt-1">Review incoming patient day appointment requests, confirm visit schedules, and manage OPD queue.</p>
      </div>

      {/* PATIENT APPOINTMENT REQUESTS & SCHEDULING CARD */}
      {appointmentReqs.length > 0 && (
         <Card className="shadow-lg border-2 border-teal-500/30 bg-teal-50/20">
            <CardHeader className="bg-white border-b border-teal-100 py-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                        <CalendarClock size={20} />
                     </div>
                     <div>
                        <CardTitle className="text-xl text-teal-950">Patient Day Appointment Requests</CardTitle>
                        <CardDescription>Review requested dates and assign specific visit times for patients</CardDescription>
                     </div>
                  </div>
                  <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full border border-teal-200">
                     {appointmentReqs.length} Request(s)
                  </span>
               </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
               {appointmentReqs.map(req => {
                  const isConfirmed = req.status === "confirmed" || req.status === "rescheduled"
                  return (
                     <div key={req.id} className="p-5 border-2 border-teal-100 rounded-2xl bg-teal-50/10 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className="text-lg font-black text-slate-900">{req.patientName}</h4>
                                 <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                                    {req.department}
                                 </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
                                 <Calendar size={14} className="text-teal-600" />
                                 Requested Date: <strong className="text-slate-800">{new Date(req.requestedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                 <span className="text-slate-300">•</span>
                                 <span>{req.preferredWindow}</span>
                              </p>
                           </div>

                           <div className="flex items-center gap-2">
                              {req.status === "pending" ? (
                                 <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                                    <Clock size={12} /> Pending Action
                                 </span>
                              ) : (
                                 <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Schedule Confirmed ({req.confirmedTime})
                                 </span>
                              )}
                           </div>
                        </div>

                        {/* Scheduling Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                           <div>
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                                 Assign Visit Time Slot *
                              </label>
                              <input 
                                 type="text" 
                                 placeholder="e.g. 09:30 AM or 11:00 AM"
                                 value={assignTimeMap[req.id] !== undefined ? assignTimeMap[req.id] : (req.confirmedTime || "09:30 AM")}
                                 onChange={e => setAssignTimeMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                                 className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                                 Instructions / Staff Note
                              </label>
                              <input 
                                 type="text" 
                                 placeholder="e.g. Please bring ABHA ID card"
                                 value={noteMap[req.id] !== undefined ? noteMap[req.id] : (req.facilityNote || "Schedule confirmed by PHC staff.")}
                                 onChange={e => setNoteMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                                 className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                           </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                           {req.status === "pending" && (
                              <Button 
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleDeclineAppointment(req.id)}
                                 className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                              >
                                 <X size={14} className="mr-1" /> Decline
                              </Button>
                           )}
                           <Button 
                              size="sm"
                              onClick={() => handleConfirmAppointment(req)}
                              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 shadow-sm"
                           >
                              <Check size={16} className="mr-1" /> 
                              {isConfirmed ? "Update Schedule Time" : "Accept & Confirm Schedule"}
                           </Button>
                        </div>
                     </div>
                  )
               })}
            </CardContent>
         </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Live Action Board */}
         <div className="md:col-span-2 space-y-6">
            <Card className="shadow-md border border-teal-200 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Users size={120} />
               </div>
               <CardContent className="p-8 relative z-10">
                  <div className="flex items-start justify-between">
                     <div>
                        <div className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                           Now Serving
                        </div>
                        {nextPatient ? (
                           <>
                              <h2 className="text-4xl font-extrabold text-slate-900">{nextPatient.patientName}</h2>
                              <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                                 <Clock size={16} /> Scheduled for {nextPatient.time}
                              </p>
                           </>
                        ) : (
                           <h2 className="text-2xl font-bold text-slate-400">Queue is Empty</h2>
                        )}
                     </div>
                  </div>
                  
                  {nextPatient && (
                     <div className="mt-8">
                        <Button onClick={() => setActivePatient(nextPatient)} className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-6 text-lg rounded-xl shadow-sm group">
                           <Play className="w-5 h-5 mr-2" /> Process Patient
                        </Button>
                     </div>
                  )}
               </CardContent>
            </Card>

            <Card className="shadow-sm">
               <CardHeader className="bg-slate-50 border-b pb-4">
                  <CardTitle className="text-lg">Waiting Line</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                     {phcQueue.slice(1).map((p, i) => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                 {i + 2}
                              </div>
                              <div>
                                 <div className="font-bold text-slate-900">{p.patientName}</div>
                                 <div className="text-xs text-slate-500">{p.time}</div>
                              </div>
                           </div>
                           <div className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                              Waiting
                           </div>
                        </div>
                     ))}
                     {phcQueue.length <= 1 && (
                        <div className="p-8 text-center text-slate-500 text-sm">
                           No other patients in line.
                        </div>
                     )}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Stats */}
         <div className="space-y-6">
            <Card className="shadow-sm">
               <CardContent className="p-6">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Queue Status</div>
                  <div className="text-5xl font-extrabold text-slate-900">{phcQueue.length}</div>
                  <div className="text-sm text-slate-500 mt-2">Total patients waiting</div>
               </CardContent>
            </Card>
         </div>
      </div>

    </div>
  )
}
