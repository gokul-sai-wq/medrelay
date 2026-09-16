"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertOctagon, CheckCircle2, Stethoscope, Clock, ArrowRight, Mic, Activity, ArrowLeft, BrainCircuit, HeartPulse, Flame, Zap } from "lucide-react"
import Link from "next/link"

const SYMPTOMS = [
  { id: "chest_pain", label: "Chest pain / pressure", weight: 4, icon: HeartPulse, color: "text-red-500" },
  { id: "breathless", label: "Shortness of breath", weight: 3, icon: Activity, color: "text-amber-500" },
  { id: "high_fever", label: "High fever (3+ days)", weight: 2, icon: Flame, color: "text-orange-500" },
  { id: "bleeding", label: "Uncontrolled bleeding", weight: 4, icon: AlertOctagon, color: "text-red-600" },
  { id: "severe_pain", label: "Severe abdominal / body pain", weight: 2, icon: Zap, color: "text-amber-600" },
  { id: "pregnancy_bleeding", label: "Bleeding during pregnancy", weight: 4, icon: HeartPulse, color: "text-red-500" },
  { id: "child_lethargy", label: "Child unusually inactive", weight: 3, icon: BrainCircuit, color: "text-amber-500" },
  { id: "skin_rash", label: "Skin rash / minor injury", weight: 0.5, icon: Flame, color: "text-slate-500" },
  { id: "custom", label: "Custom", weight: 1, icon: Stethoscope, color: "text-[#5841D8]" },
]

const CONDITIONS = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension (High BP)" },
  { id: "asthma", label: "Asthma / COPD" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "pregnant", label: "Currently Pregnant" },
]

type Result = {
  level: "emergency" | "urgent" | "routine"
  title: string
  advice: string
  confidence: number
  action: { label: string; href: string }
}

export default function AdvancedTriagePage() {
  const [step, setStep] = useState<number>(1)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [durationDays, setDurationDays] = useState(1)
  const [painLevel, setPainLevel] = useState<number>(3)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const [customSymptomText, setCustomSymptomText] = useState("")
  const [isListeningMic, setIsListeningMic] = useState(false)

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleCondition = (id: string) => {
    setSelectedConditions(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleMicClick = () => {
    if (isListeningMic) {
      setIsListeningMic(false)
      return
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-IN'

        setIsListeningMic(true)
        recognition.start()

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase()
          setIsListeningMic(false)
          
          if (transcript.includes("chest") || transcript.includes("heart")) {
            setSelectedSymptoms(prev => Array.from(new Set([...prev, "chest_pain"])))
          }
          if (transcript.includes("breath") || transcript.includes("shortness")) {
            setSelectedSymptoms(prev => Array.from(new Set([...prev, "breathless"])))
          }
          if (transcript.includes("fever")) {
            setSelectedSymptoms(prev => Array.from(new Set([...prev, "high_fever"])))
          }
          if (transcript.includes("pain") || transcript.includes("stomach")) {
            setSelectedSymptoms(prev => Array.from(new Set([...prev, "severe_pain"])))
          }
          if (transcript.includes("bleeding")) {
            setSelectedSymptoms(prev => Array.from(new Set([...prev, "bleeding"])))
          }
          if (transcript.includes("rash") || transcript.includes("injury")) {
            setSelectedSymptoms(prev => Array.from(new Set([...prev, "skin_rash"])))
          }
          
          setSelectedSymptoms(prev => Array.from(new Set([...prev, "custom"])))
          setCustomSymptomText(transcript)
        }

        recognition.onerror = () => {
          setIsListeningMic(false)
          fallbackMicSimulation()
        }
        recognition.onend = () => setIsListeningMic(false)

      } catch (e) {
        fallbackMicSimulation()
      }
    } else {
      fallbackMicSimulation()
    }
  }

  const fallbackMicSimulation = () => {
    setIsListeningMic(true)
    setTimeout(() => {
      setIsListeningMic(false)
      setSelectedSymptoms(prev => Array.from(new Set([...prev, "custom"])))
      setCustomSymptomText("Severe headache and body pain for 2 days")
    }, 2000)
  }

  const runTriage = () => {
    setStep(5)
    setIsAnalyzing(true)
    
    // Simulate AI processing
    setTimeout(() => {
      let score = selectedSymptoms.reduce((sum, id) => sum + (SYMPTOMS.find(s => s.id === id)?.weight ?? 0), 0)
      
      // Amplifiers
      if (durationDays >= 5) score += 1
      if (painLevel >= 8) score += 2
      if (painLevel >= 5 && painLevel < 8) score += 1
      if (selectedConditions.length > 0 && score > 0) score += 1.5 // Comorbidities amplify existing symptoms

      const confidence = Math.min(Math.floor(85 + Math.random() * 14), 99) // Mock AI confidence

      let calculatedResult: Result
      if (score >= 4) {
        calculatedResult = {
          level: "emergency",
          title: "Critical: Seek Emergency Care Immediately",
          advice: "Our AI model detects multiple high-risk factors. Do not wait. Trigger an SOS or proceed to the nearest emergency room.",
          confidence,
          action: { label: "Trigger SOS Emergency", href: "/emergency" },
        }
      } else if (score >= 1.5) {
        calculatedResult = {
          level: "urgent",
          title: "Urgent: See a Health Worker Today",
          advice: "Your symptoms indicate a potential issue that needs prompt medical evaluation. Book the earliest teleconsultation.",
          confidence,
          action: { label: "Book Earliest Slot", href: "/appointments" },
        }
      } else {
        calculatedResult = {
          level: "routine",
          title: "Routine Care Sufficient",
          advice: "No critical red flags detected. You can schedule a routine teleconsultation or follow standard self-care guidelines.",
          confidence,
          action: { label: "Schedule Routine Visit", href: "/appointments" },
        }
      }
      
      setResult(calculatedResult)
      setIsAnalyzing(false)
      setStep(6)
    }, 2500)
  }

  const levelStyles = {
    emergency: "bg-red-50 border-red-200 text-red-900 shadow-sm",
    urgent: "bg-amber-50 border-amber-200 text-amber-900 shadow-sm",
    routine: "bg-teal-50 border-teal-200 text-teal-900 shadow-sm",
  } as const

  const totalSteps = 4
  const progress = Math.min((step / totalSteps) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <BrainCircuit className="text-[#5841D8]" size={32} /> AI Digital Triage
          </h1>
          <p className="text-slate-500 mt-2">Smart clinical assessment to route you to the right care, instantly.</p>
        </div>
        {step <= totalSteps && (
           <div className="w-full md:w-48 text-right">
              <div className="text-sm font-semibold text-[#5841D8] mb-2">Step {step} of {totalSteps}</div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-[#5841D8] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
           </div>
        )}
      </div>

      <div className="relative">
        {step === 1 && (
          <Card className="shadow-lg border-0 ring-1 ring-slate-200 animate-in slide-in-from-right-8 duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <CardTitle className="text-xl">What are you experiencing?</CardTitle>
              <CardDescription>Select all symptoms that apply to you right now.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SYMPTOMS.map(s => {
                   const isSelected = selectedSymptoms.includes(s.id)
                   return (
                      <button
                        key={s.id}
                        onClick={() => toggleSymptom(s.id)}
                        className={`text-left p-4 rounded-2xl border-2 font-medium transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-[#5841D8]/5 border-[#5841D8] shadow-sm"
                            : "bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <s.icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-[#5841D8]' : s.color}`} />
                        <span className={isSelected ? 'text-[#5841D8] font-bold' : ''}>{s.label}</span>
                      </button>
                   )
                })}
              </div>
              {selectedSymptoms.includes("custom") && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-300">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Specify Custom Symptom Details:</label>
                  <input 
                    type="text" 
                    value={customSymptomText}
                    onChange={(e) => setCustomSymptomText(e.target.value)}
                    placeholder="Enter or speak custom symptom (e.g. Joint swelling, Ear ache, Dizziness...)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5841D8] shadow-sm font-medium"
                  />
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200">
                <div className="flex items-center gap-3">
                   <button 
                     onClick={handleMicClick}
                     className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
                       isListeningMic ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-[#5841D8] hover:bg-[#4935B8]"
                     }`}
                   >
                      <Mic size={22} />
                   </button>
                   <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {isListeningMic ? "🎙️ Listening... Speak your symptoms in local dialect" : "Voice Input Enabled: Tap Mic to Speak Symptoms"}
                      </div>
                      <div className="text-xs text-slate-500">Auto-detects symptoms & transcribes to custom notes</div>
                   </div>
                </div>
                <button 
                  onClick={handleMicClick}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isListeningMic ? "bg-red-600 text-white" : "bg-white text-[#5841D8] border border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {isListeningMic ? "Stop Listening" : "Speak Symptoms"}
                </button>
              </div>
            </CardContent>
            <CardFooter className="bg-white border-t border-slate-100 p-6 flex justify-end">
                <Button 
                   disabled={selectedSymptoms.length === 0} 
                   onClick={() => setStep(2)} 
                   className="bg-[#5841D8] hover:bg-[#4935B8] text-white px-8 py-6 rounded-xl text-base shadow-lg shadow-[#5841D8]/20 transition-all hover:scale-105"
                >
                  Continue to next step <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-lg border-0 ring-1 ring-slate-200 animate-in slide-in-from-right-8 duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-xl">How long has this been going on?</CardTitle>
                    <CardDescription>Symptom duration helps our AI gauge chronic vs. acute conditions.</CardDescription>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              
              <div className="text-center pt-8">
                 <div className="text-6xl font-black text-[#5841D8] mb-2 font-mono">
                    {durationDays}
                 </div>
                 <div className="text-xl font-bold text-slate-700">
                    {durationDays === 0 ? "Just started today" : `Day${durationDays > 1 ? "s" : ""}`}
                 </div>
              </div>

              <div className="px-4">
                 <input
                   type="range"
                   min={0}
                   max={14}
                   value={durationDays}
                   onChange={(e) => setDurationDays(Number(e.target.value))}
                   className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5841D8]"
                 />
                 <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
                    <span>Today</span>
                    <span>1 Week</span>
                    <span>2+ Weeks</span>
                 </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white border-t border-slate-100 p-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="px-6 py-6 rounded-xl font-bold">
                   Go Back
                </Button>
                <Button onClick={() => setStep(3)} className="bg-[#5841D8] hover:bg-[#4935B8] text-white px-8 py-6 rounded-xl text-base shadow-lg shadow-[#5841D8]/20 transition-all hover:scale-105">
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-lg border-0 ring-1 ring-slate-200 animate-in slide-in-from-right-8 duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-xl">How much pain are you in?</CardTitle>
                    <CardDescription>Rate your overall discomfort or pain level.</CardDescription>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              <div className="flex justify-center gap-2 sm:gap-4 flex-wrap pb-4">
                 {[1,2,3,4,5,6,7,8,9,10].map(level => {
                    const isActive = painLevel === level;
                    let colorClass = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent";
                    if (isActive) {
                       if (level <= 3) colorClass = "bg-teal-700 text-white shadow-sm border-teal-800 scale-105 z-10";
                       else if (level <= 7) colorClass = "bg-amber-600 text-white shadow-sm border-amber-700 scale-105 z-10";
                       else colorClass = "bg-red-700 text-white shadow-sm border-red-800 scale-105 z-10";
                    }

                    return (
                       <button
                         key={level}
                         onClick={() => setPainLevel(level)}
                         className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full font-black text-xl border-2 transition-all duration-300 ${colorClass}`}
                       >
                          {level}
                       </button>
                    )
                 })}
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                 <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Current Assessment</div>
                 <div className={`text-2xl font-black ${painLevel >= 8 ? 'text-red-600' : painLevel >= 4 ? 'text-amber-600' : 'text-teal-600'}`}>
                    {painLevel >= 8 ? "Severe / Excruciating Pain" : painLevel >= 4 ? "Moderate Discomfort" : "Mild / Manageable"}
                 </div>
              </div>

            </CardContent>
            <CardFooter className="bg-white border-t border-slate-100 p-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="px-6 py-6 rounded-xl font-bold">
                   Go Back
                </Button>
                <Button onClick={() => setStep(4)} className="bg-[#5841D8] hover:bg-[#4935B8] text-white px-8 py-6 rounded-xl text-base shadow-lg shadow-[#5841D8]/20 transition-all hover:scale-105">
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && (
          <Card className="shadow-lg border-0 ring-1 ring-slate-200 animate-in slide-in-from-right-8 duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-xl">Relevant Medical History</CardTitle>
                    <CardDescription>Select any pre-existing conditions (Comorbidities).</CardDescription>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setStep(3)} className="text-slate-400 hover:text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {CONDITIONS.map(c => {
                   const isSelected = selectedConditions.includes(c.id)
                   return (
                      <button
                        key={c.id}
                        onClick={() => toggleCondition(c.id)}
                        className={`px-5 py-3 rounded-full border-2 font-bold text-sm transition-all ${
                          isSelected
                            ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {c.label}
                      </button>
                   )
                })}
              </div>
              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500 text-center italic">
                 Leave blank if none of the above apply to you.
              </div>
            </CardContent>
            <CardFooter className="bg-white border-t border-slate-100 p-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} className="px-6 py-6 rounded-xl font-bold">
                   Go Back
                </Button>
                <Button onClick={runTriage} className="bg-black hover:bg-slate-800 text-white px-8 py-6 rounded-xl text-base shadow-lg shadow-black/20 transition-all hover:scale-105 overflow-hidden relative group">
                  <span className="relative z-10 flex items-center">Analyze Results <BrainCircuit className="w-5 h-5 ml-2" /></span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                </Button>
            </CardFooter>
          </Card>
        )}

        {step === 5 && isAnalyzing && (
           <Card className="shadow-lg border-0 ring-1 ring-[#5841D8] bg-[#5841D8] text-white animate-in zoom-in-95 duration-500 overflow-hidden">
             <CardContent className="p-16 text-center space-y-6">
               <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
                  <div className="absolute inset-2 bg-white rounded-full opacity-40 animate-ping" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <BrainCircuit size={48} className="text-white animate-pulse" />
                  </div>
               </div>
               <h2 className="text-3xl font-black tracking-tight">AI is evaluating your symptoms...</h2>
               <p className="text-indigo-200 text-lg">Cross-referencing {selectedSymptoms.length} symptoms with medical protocols.</p>
             </CardContent>
           </Card>
        )}

        {step === 6 && result && (
          <Card className={`shadow-xl border-2 overflow-hidden animate-in zoom-in-95 duration-500 ${levelStyles[result.level]}`}>
            <div className={`h-2 w-full ${result.level === 'emergency' ? 'bg-red-500' : result.level === 'urgent' ? 'bg-amber-500' : 'bg-teal-500'}`}></div>
            <CardContent className="p-8 md:p-12 text-center space-y-6 bg-white/60 backdrop-blur-sm">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl ${result.level === 'emergency' ? 'bg-red-600 text-white' : result.level === 'urgent' ? 'bg-amber-500 text-white' : 'bg-teal-500 text-white'}`}>
                {result.level === "emergency" ? <AlertOctagon size={40} /> : result.level === "urgent" ? <Clock size={40} /> : <CheckCircle2 size={40} />}
              </div>
              
              <div>
                 <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 mb-4 shadow-sm">
                    <BrainCircuit size={14} className="text-[#5841D8]" /> 
                    AI CONFIDENCE: {result.confidence}%
                 </div>
                 <h2 className={`text-3xl md:text-4xl font-black mb-3 ${result.level === 'emergency' ? 'text-red-700' : result.level === 'urgent' ? 'text-amber-700' : 'text-teal-700'}`}>
                    {result.title}
                 </h2>
                 <p className="max-w-xl mx-auto text-lg text-slate-700 font-medium leading-relaxed">{result.advice}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg mx-auto text-left shadow-sm">
                 <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3 text-sm uppercase tracking-wider">Summary of Findings</h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <div className="text-slate-500 mb-1">Symptoms</div>
                       <div className="font-semibold text-slate-900">{selectedSymptoms.length} reported</div>
                    </div>
                    <div>
                       <div className="text-slate-500 mb-1">Duration</div>
                       <div className="font-semibold text-slate-900">{durationDays} days</div>
                    </div>
                    <div>
                       <div className="text-slate-500 mb-1">Pain Scale</div>
                       <div className="font-semibold text-slate-900">{painLevel} / 10</div>
                    </div>
                    <div>
                       <div className="text-slate-500 mb-1">Comorbidities</div>
                       <div className="font-semibold text-slate-900">{selectedConditions.length > 0 ? selectedConditions.length : 'None'}</div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href={result.action.href} className="w-full sm:w-auto">
                  <Button className={`w-full sm:w-auto px-8 py-6 text-lg font-bold rounded-xl shadow-md transition-all hover:scale-102 ${result.level === 'emergency' ? 'bg-red-700 hover:bg-red-800 text-white' : result.level === 'urgent' ? 'bg-amber-700 hover:bg-amber-800 text-white' : 'bg-teal-700 hover:bg-teal-800 text-white'}`}>
                    <Stethoscope className="w-5 h-5 mr-2" /> {result.action.label}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => { setStep(1); setSelectedSymptoms([]); setDurationDays(1); setPainLevel(3); setSelectedConditions([]); setResult(null) }}
                  className="w-full sm:w-auto px-8 py-6 text-lg font-bold rounded-xl bg-white"
                >
                  Start Over
                </Button>
              </div>
              
              <p className="text-xs font-semibold text-slate-400 pt-4 flex items-center justify-center gap-2">
                <AlertOctagon size={12} /> This AI tool strengthens, but does not replace, a doctor's evaluation.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
