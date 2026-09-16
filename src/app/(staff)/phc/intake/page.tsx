"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, CheckCircle2, ShieldAlert, Loader2, AlertTriangle, ArrowRight, FlaskConical, UserCheck, ArrowLeft } from "lucide-react"
import { addReferral } from "@/lib/store"

export default function PHCIntakePage() {
  const [consentCode, setConsentCode] = useState("")
  const [consentStatus, setConsentStatus] = useState<"idle" | "requesting" | "approved" | "declined">("idle")
  
  // Manual Override states
  const [showManualForm, setShowManualForm] = useState(false)
  const [isManualOverride, setIsManualOverride] = useState(false)
  const [manualFullName, setManualFullName] = useState("")
  const [manualAge, setManualAge] = useState("")
  const [manualGender, setManualGender] = useState("Male")
  const [manualPhone, setManualPhone] = useState("")
  const [manualGovtId, setManualGovtId] = useState("")

  const [patientName, setPatientName] = useState("")
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [otherFlags, setOtherFlags] = useState("")
  const [selectedDiag, setSelectedDiag] = useState("")
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])
  const [activeReferrals, setActiveReferrals] = useState<any[]>([])
  const [selectedReferralsToClose, setSelectedReferralsToClose] = useState<string[]>([])
  
  const [lastAction, setLastAction] = useState<{ type: "treated" | "referred" | "error"; name: string } | null>(null)

  useEffect(() => {
    // Poll consent status if we are waiting for it
    const fetchState = () => {
       const currentConsent = JSON.parse(localStorage.getItem("medrelay.pending_consent") || "null")
       if (currentConsent && consentStatus === "requesting") {
          if (currentConsent.status === "approved") {
             setConsentStatus("approved")
             setIsManualOverride(false)
             // Mock fetching patient name from ABHA
             setPatientName("Aarav Kumar (Fetched via ABHA)")
             localStorage.removeItem("medrelay.pending_consent")
          } else if (currentConsent.status === "declined") {
             setConsentStatus("declined")
             localStorage.removeItem("medrelay.pending_consent")
          }
       }
    }

    fetchState()
    const handleStorage = () => fetchState()
    window.addEventListener("storage", handleStorage)
    window.addEventListener("medrelay-consent-update", handleStorage)
    const interval = setInterval(fetchState, 500)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("medrelay-consent-update", handleStorage)
      clearInterval(interval)
    }
  }, [consentStatus])

  useEffect(() => {
     if (consentStatus === "approved") {
        if (isManualOverride) {
           // Manual override: do NOT load active referrals
           setActiveReferrals([])
           setSelectedReferralsToClose([])
           setMedicalHistory([])
        } else {
           // Fetch Medical History once approved digitally via ABDM
           const hist = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
           hist.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
           setMedicalHistory(hist)

           // Check for active referrals to this PHC
           const refs = JSON.parse(localStorage.getItem("medrelay.staffReferrals") || "[]")
           const inboundRefs = refs.filter((r: any) => 
             r.stages.some((s: any) => (s.status === "current" || s.status === "pending") && (s.facility.includes("Villianur") || s.facility.includes("PHC")))
           )
           if (inboundRefs.length > 0) {
              setActiveReferrals(inboundRefs)
              setSelectedReferralsToClose(inboundRefs.map((r: any) => r.id))
           }
        }
     }
  }, [consentStatus, isManualOverride])

  const toggleFlag = (id: string) =>
    setSelectedFlags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleRequestConsent = (overrideCode?: string) => {
    const code = (overrideCode || consentCode).trim().toUpperCase()
    if (!code) return
    setConsentCode(code)
    setIsManualOverride(false)
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

  const handleManualOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualFullName.trim()) return

    const details = [
      manualAge ? `${manualAge} yrs` : null,
      manualGender,
      manualPhone ? `Ph: ${manualPhone}` : null
    ].filter(Boolean).join(", ")

    const formattedName = `${manualFullName.trim()} (${details})`
    setPatientName(formattedName)
    setIsManualOverride(true)
    setActiveReferrals([])
    setSelectedReferralsToClose([])
    setShowManualForm(false)
    setConsentStatus("approved")
  }

  const handleComplete = (type: "treated" | "referred") => {
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
      actionTaken: type === "treated" ? "Treated in OPD" : "Referred to Indira Gandhi Govt Hospital, Pondicherry",
      status: type === "treated" ? "Treated" : "Referred"
    })
    localStorage.setItem("medrelay.medical_history", JSON.stringify(history))

    if (type === "referred") {
      addReferral({
        id: "REF-" + Math.floor(1000 + Math.random() * 9000),
        reason: chiefComplaint || "Further treatment and diagnostics required",
        createdAt: new Date().toLocaleString(),
        stages: [
          { label: "PHC Assessment", facility: "Villianur PHC, Pondicherry", status: "done", note: "Initial assessment completed." },
          { label: "Hospital Triage", facility: "Indira Gandhi Govt Hospital, Pondicherry", status: "current" },
          { label: "Specialist Consult", facility: "Indira Gandhi Govt Hospital, Pondicherry", status: "pending" }
        ]
      })
    }

    // Auto-close selected referrals only if digital consent intake with referrals
    if (!isManualOverride && selectedReferralsToClose.length > 0) {
       const refs = JSON.parse(localStorage.getItem("medrelay.staffReferrals") || "[]")
       const updated = refs.map((r: any) => {
          if (selectedReferralsToClose.includes(r.id)) {
             const newStages = r.stages.map((s: any) => {
                if (s.status === "current" || s.status === "pending") {
                   return { ...s, status: "done", note: type === "treated" ? "Treated at PHC" : "Referred further", date: new Date().toLocaleString() }
                }
                return s
             })
             return { ...r, stages: newStages }
          }
          return r
       })
       localStorage.setItem("medrelay.staffReferrals", JSON.stringify(updated))
       setActiveReferrals([])
       setSelectedReferralsToClose([])
    }

    setLastAction({ type, name: patientName })
    
    // Reset Form
    setConsentStatus("idle")
    setShowManualForm(false)
    setIsManualOverride(false)
    setManualFullName("")
    setManualAge("")
    setManualGender("Male")
    setManualPhone("")
    setManualGovtId("")
    setConsentCode("")
    setPatientName("")
    setChiefComplaint("")
    setSelectedFlags([])
    setOtherFlags("")
    setSelectedDiag("")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Walk-in Patient Intake</h1>
        <p className="text-slate-500 mt-1">Register new walk-in patients. Digital ABDM consent or manual registration required.</p>
      </div>

      <Card className="shadow-lg border-2 border-teal-500/20">
        
        {/* STAGE 1: CONSENT GATE / MANUAL OVERRIDE ENTRY */}
        {consentStatus !== "approved" && (
           <CardContent className="p-8 sm:p-12 text-center space-y-6">
              
              {showManualForm ? (
                 <div className="max-w-lg mx-auto text-left space-y-6 animate-in fade-in zoom-in-95">
                    <button 
                       type="button" 
                       onClick={() => setShowManualForm(false)}
                       className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
                    >
                       <ArrowLeft size={14} /> Back to Code Access
                    </button>

                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                       <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center shrink-0 font-bold">
                          <UserCheck size={20} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-900">Manual Patient Registration</h3>
                          <p className="text-xs text-slate-500">For patients without smartphones or digital consent access</p>
                       </div>
                    </div>

                    <form onSubmit={handleManualOverrideSubmit} className="space-y-4">
                       <div>
                          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Full Name *</Label>
                          <Input 
                             required
                             type="text" 
                             placeholder="e.g. Aarav Kumar"
                             value={manualFullName}
                             onChange={e => setManualFullName(e.target.value)}
                             className="mt-1.5 font-medium"
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Age</Label>
                             <Input 
                                type="number" 
                                placeholder="e.g. 35"
                                value={manualAge}
                                onChange={e => setManualAge(e.target.value)}
                                className="mt-1.5 font-medium"
                             />
                          </div>
                          <div>
                             <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</Label>
                             <select 
                                value={manualGender}
                                onChange={e => setManualGender(e.target.value)}
                                className="w-full mt-1.5 h-10 px-3 border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                             >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                             </select>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone / Caretaker Contact</Label>
                             <Input 
                                type="tel" 
                                placeholder="e.g. 9876543210"
                                value={manualPhone}
                                onChange={e => setManualPhone(e.target.value)}
                                className="mt-1.5 font-medium"
                             />
                          </div>
                          <div>
                             <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Govt ID / Aadhaar (Optional)</Label>
                             <Input 
                                type="text" 
                                placeholder="e.g. XXXX-XXXX-1234"
                                value={manualGovtId}
                                onChange={e => setManualGovtId(e.target.value)}
                                className="mt-1.5 font-medium"
                             />
                          </div>
                       </div>

                       <div className="pt-2 flex gap-3">
                          <Button 
                             type="button"
                             variant="outline"
                             onClick={() => setShowManualForm(false)}
                             className="flex-1 py-5 text-sm font-bold"
                          >
                             Cancel
                          </Button>
                          <Button 
                             type="submit" 
                             className="flex-1 py-5 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                          >
                             Proceed to Intake
                          </Button>
                       </div>
                    </form>
                 </div>
              ) : (
                 <>
                   <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldAlert size={40} />
                   </div>
                   
                   {consentStatus === "idle" && (
                      <div className="max-w-md mx-auto space-y-5">
                        <h3 className="text-2xl font-black text-slate-900">Data Access Required</h3>
                        <p className="text-slate-500 text-sm">To comply with ABDM privacy standards, fetch the patient's digital record using their Unique Code.</p>
                        
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="Enter Patient Unique Code (e.g. PT-8891)"
                            value={consentCode}
                            onChange={e => setConsentCode(e.target.value.toUpperCase())}
                            className="w-full text-center text-xl p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono font-bold bg-slate-50 uppercase tracking-widest"
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

                        <Button disabled={!consentCode} onClick={() => handleRequestConsent()} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg rounded-xl shadow-lg shadow-teal-600/20 font-bold">
                           Request Access
                        </Button>
                        <div>
                           <button 
                             type="button" 
                             onClick={() => setShowManualForm(true)} 
                             className="text-slate-500 hover:text-teal-700 font-semibold text-sm mt-3 underline decoration-slate-300 underline-offset-4"
                           >
                              Patient does not have a smartphone? (Manual Override)
                           </button>
                        </div>
                      </div>
                   )}

                   {consentStatus === "requesting" && (
                     <div className="py-8 space-y-4">
                        <Loader2 size={48} className="animate-spin text-teal-600 mx-auto" />
                        <h3 className="text-xl font-bold text-slate-700">Waiting for patient approval...</h3>
                        <p className="text-slate-500">A secure request has been sent to the patient's device.</p>
                     </div>
                   )}

                   {consentStatus === "declined" && (
                     <div className="py-8 space-y-6 max-w-sm mx-auto">
                        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center justify-center gap-2 font-bold">
                           <AlertTriangle size={20} /> Access Denied by Patient
                        </div>
                        <Button onClick={() => setConsentStatus("idle")} variant="outline" className="w-full py-6 text-lg">Try Again</Button>
                     </div>
                   )}
                 </>
              )}
           </CardContent>
        )}

        {/* STAGE 2: INTAKE FORM */}
        {consentStatus === "approved" && (
           <>
            <CardHeader className="bg-teal-50 border-b border-teal-100 flex flex-row items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-inner">
                 <UserPlus size={24} />
              </div>
              <div>
                 <CardTitle className="text-2xl text-teal-900">Patient File: {patientName}</CardTitle>
                 <CardDescription className="text-teal-700 font-medium">
                    {isManualOverride ? "Manual Walk-in Registration (No Smartphone / Offline)" : "Access Granted via ABDM Consent Manager"}
                 </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 bg-white">
              
              {/* Display Active Referrals (Only for ABDM Digital Consent) */}
              {!isManualOverride && activeReferrals.length > 0 && (
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm animate-in zoom-in-95">
                   <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                     <AlertTriangle size={18} /> Active Referrals Found for this Patient
                   </h3>
                   <p className="text-sm text-amber-800 mb-4">
                      Please select the referrals you are addressing in this visit. They will be automatically completed.
                   </p>
                   <div className="space-y-2">
                      {activeReferrals.map((ref: any) => (
                         <div key={ref.id} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-amber-100">
                            <Checkbox 
                               id={`ref-${ref.id}`}
                               checked={selectedReferralsToClose.includes(ref.id)}
                               onCheckedChange={(checked) => {
                                  if (checked) {
                                     setSelectedReferralsToClose(prev => [...prev, ref.id])
                                  } else {
                                     setSelectedReferralsToClose(prev => prev.filter(id => id !== ref.id))
                                  }
                               }}
                            />
                            <div className="flex-1 -mt-1">
                               <label htmlFor={`ref-${ref.id}`} className="text-sm font-bold text-amber-900 cursor-pointer">{ref.id}</label>
                               <p className="text-xs text-amber-800 mt-0.5">{ref.reason}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Display Past Medical History (Only for ABDM Digital Consent) */}
              {!isManualOverride && medicalHistory.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Past Medical History</h3>
                   <div className="space-y-3">
                      {medicalHistory.map((rec, i) => (
                         <div key={i} className="bg-white p-3.5 rounded-lg border border-slate-200 text-sm space-y-1">
                            <div className="flex justify-between font-bold text-slate-900">
                               <span>{rec.chiefComplaint || "General Consult"}</span>
                               <span className="text-xs text-slate-400 font-normal">{new Date(rec.date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-slate-600 flex justify-between">
                               <span>Facility: {rec.facility}</span>
                               <span className="font-semibold text-teal-600">{rec.actionTaken}</span>
                            </div>
                            {rec.flags && rec.flags.length > 0 && (
                               <div className="flex gap-1 flex-wrap mt-1">
                                  {rec.flags.map((f: string, idx: number) => (
                                     <span key={idx} className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {f}
                                     </span>
                                  ))}
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Form Controls */}
              <div className="space-y-4">
                 <Label className="text-base font-bold text-slate-800">Chief Clinical Complaint / Symptoms</Label>
                 <Input 
                   placeholder="e.g. High fever for 3 days, acute abdominal pain, hypertension"
                   value={chiefComplaint}
                   onChange={e => setChiefComplaint(e.target.value)}
                   className="p-4 text-base bg-slate-50 border-slate-200 rounded-xl"
                 />
              </div>

              {/* Clinical Risk Flags */}
              <div className="space-y-4">
                 <Label className="text-base font-bold text-slate-800">Clinical Triage Risk Flags</Label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: "Maternal Risk", label: "Maternal Risk / High Risk Pregnancy" },
                      { id: "Pediatric Emergency", label: "Pediatric Emergency" },
                      { id: "Cardiac Distress", label: "Chest Pain / Cardiac" },
                      { id: "Severe Trauma", label: "Severe Trauma / Accident" },
                      { id: "Communicable Outbreak", label: "Fever Outbreak / Infectious" },
                      { id: "Chronic Complications", label: "Diabetes / BP Crisis" },
                    ].map((flag) => {
                       const isSelected = selectedFlags.includes(flag.id)
                       return (
                          <div 
                            key={flag.id}
                            onClick={() => toggleFlag(flag.id)}
                            className={`p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all flex items-center gap-2 ${
                               isSelected ? "bg-red-50 border-red-300 text-red-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                             <Checkbox checked={isSelected} onCheckedChange={() => toggleFlag(flag.id)} />
                             <span>{flag.label}</span>
                          </div>
                       )
                    })}
                 </div>
                 <Input 
                   placeholder="Other clinical observations or flags..."
                   value={otherFlags}
                   onChange={e => setOtherFlags(e.target.value)}
                   className="bg-slate-50 border-slate-200"
                 />
              </div>

              {/* Diagnostic Orders */}
              <div className="space-y-4">
                 <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FlaskConical className="text-teal-600" size={18} /> Order OPD Diagnostics / Tests
                 </Label>
                 <select 
                   value={selectedDiag} 
                   onChange={e => setSelectedDiag(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                 >
                    <option value="">No Diagnostic Test Required</option>
                    <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                    <option value="Malaria Rapid Diagnostic Test (RDT)">Malaria Rapid Diagnostic Test (RDT)</option>
                    <option value="Dengue NS1 Antigen Test">Dengue NS1 Antigen Test</option>
                    <option value="Chest X-Ray Digital">Chest X-Ray Digital</option>
                    <option value="ECG (12-Lead)">ECG (12-Lead)</option>
                    <option value="Blood Glucose (Random)">Blood Glucose (Random)</option>
                 </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                 <Button 
                   disabled={!chiefComplaint}
                   onClick={() => handleComplete("treated")}
                   className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-green-600/20"
                 >
                    <CheckCircle2 size={20} className="mr-2" /> Mark as Treated (OPD Complete)
                 </Button>

                 <Button 
                   disabled={!chiefComplaint}
                   onClick={() => handleComplete("referred")}
                   className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-teal-600/20"
                 >
                    <ArrowRight size={20} className="mr-2" /> Refer to Indira Gandhi Govt General Hospital, Pondicherry
                 </Button>
              </div>

            </CardContent>
           </>
        )}

      </Card>

      {/* Confirmation Toast */}
      {lastAction && (
         <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
               <CheckCircle2 className="text-green-400" size={24} />
               <div>
                  <p className="font-bold">Record Created for {lastAction.name}</p>
                  <p className="text-xs text-slate-400">
                     Status: {lastAction.type === "treated" ? "Treated in OPD" : "Referred to Indira Gandhi Govt General Hospital, Pondicherry"}
                  </p>
               </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setLastAction(null)} className="text-slate-400 hover:text-white">
               Dismiss
            </Button>
         </div>
      )}
    </div>
  )
}
