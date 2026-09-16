"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Mic, Sparkles, User, AlertCircle, Globe, Link2, MicOff, Stethoscope, ShieldCheck, XCircle, Copy, Check, KeyRound } from "lucide-react"
import Link from "next/link"
import { AbhaModal } from "../../components/AbhaModal"
import { PhoneSimulator, SimulationMessage } from "../../components/PhoneSimulator"
import { useLanguage, LANGUAGES, LangCode } from "@/lib/i18n"

type Message = {
  id: string
  role: "user" | "ai"
  content: string
  riskLevel?: "low" | "moderate" | "high" | "critical"
}

export default function MedRelayAIPage() {
  const { lang, setLang, t } = useLanguage()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [abhaLinked, setAbhaLinked] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [simMessages, setSimMessages] = useState<SimulationMessage[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [pendingDiagnostics, setPendingDiagnostics] = useState<any[]>([])
  const [patientCode, setPatientCode] = useState("PT-8891")
  const [copiedCode, setCopiedCode] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize or update initial greeting on language change if message array is empty or only has greeting
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 0 || (prev.length === 1 && prev[0].role === "ai")) {
        return [
          {
            id: "1",
            role: "ai",
            content: t("home.greeting")
          }
        ]
      }
      return prev
    })
  }, [lang, t])

  const addSimMessage = (app: 'whatsapp' | 'sms', title: string, content: string) => {
      setSimMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), app, title, content }])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    // Initialize unique code for demo
    if (!localStorage.getItem("medrelay.user_unique_code")) {
      localStorage.setItem("medrelay.user_unique_code", "PT-8891")
    }
    setPatientCode(localStorage.getItem("medrelay.user_unique_code") || "PT-8891")

    const fetchState = () => {
      const p = JSON.parse(localStorage.getItem("medrelay.pending_diagnostics") || "[]")
      setPendingDiagnostics(p)
    }
    fetchState()
    const interval = setInterval(fetchState, 1500)
    return () => clearInterval(interval)
  }, [])

  // Voice Recognition using Web Speech API
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser for the demo.")
      return
    }

    if (isRecording) {
        setIsRecording(false)
        return
    }

    setIsRecording(true)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Set language based on active i18n lang
    recognition.lang = lang === "en" ? "en-US" : `${lang}-IN`
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript
      setInput(speechResult)
      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content, language: lang }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.replyText,
        riskLevel: data.riskLevel,
      }
      setMessages(prev => [...prev, aiMessage])

      // Text-to-Speech (TTS)
      if ('speechSynthesis' in window) {
        setIsSpeaking(true)
        const utterance = new SpeechSynthesisUtterance(data.replyText)
        utterance.lang = lang === "en" ? "en-US" : `${lang}-IN`
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }

      // Trigger Omnichannel Simulator
      if (data.riskLevel === 'critical') {
          setTimeout(() => {
              addSimMessage('whatsapp', 'MedRelay Emergency', '🚑 Ambulance MH-12-AB-1234 has been dispatched to your location. ETA: 8 mins.')
          }, 3000)
      } else if (data.riskLevel === 'moderate') {
          setTimeout(() => {
              addSimMessage('sms', 'PHC Appointment', 'Your visit to Villianur PHC, Pondicherry is booked for today at 4:30 PM. Show ABHA ID upon arrival.')
          }, 3000)
      }

    } catch (error) {
      console.error("Error calling chat API:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I apologize, but I am having trouble connecting to the server right now. Please try again or contact support if the issue persists.",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto px-4 py-4">
      <AbhaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => setAbhaLinked(true)} 
      />
      <PhoneSimulator 
        messages={simMessages} 
        onDismiss={(id) => setSimMessages(prev => prev.filter(m => m.id !== id))} 
      />

      {pendingDiagnostics.length > 0 && (
        <div className="bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-xl mb-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0">
                 <AlertCircle size={20} />
              </div>
              <div>
                 <h4 className="font-bold">Action Required: Pending Prescriptions</h4>
                 <p className="text-sm">You have {pendingDiagnostics.length} diagnostic test(s) waiting for your approval.</p>
              </div>
           </div>
           <Link href="/diagnostics" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg whitespace-nowrap shadow-sm">
              Review & Approve
           </Link>
        </div>
      )}

      {/* Top Header Controls (ABHA & Language) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isSpeaking ? 'bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.6)] animate-pulse text-white' : 'bg-slate-100 text-teal-600 border border-teal-200 shadow-sm'}`}>
              <Sparkles size={isSpeaking ? 22 : 18} className={isSpeaking ? 'animate-spin-slow' : ''} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border border-teal-100">
                  <Stethoscope size={14} className="inline mr-1 mb-0.5" /> {t("home.voiceTriage")}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(patientCode).catch(() => {})
                  setCopiedCode(true)
                  setTimeout(() => setCopiedCode(false), 2000)
                }}
                title="Click to copy your unique code for PHC/Hospital visits"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer group"
              >
                 <KeyRound size={12} className="text-slate-500 group-hover:rotate-12 transition-transform" />
                 <span className="text-slate-500 text-[11px]">{t("home.uniqueCode")}</span>
                 <span className="font-mono font-bold text-slate-900">{patientCode}</span>
                 {copiedCode ? (
                   <Check size={12} className="text-emerald-600 shrink-0 ml-0.5" />
                 ) : (
                   <Copy size={12} className="text-slate-400 opacity-60 group-hover:opacity-100 shrink-0 ml-0.5" />
                 )}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
              <button 
                onClick={() => {
                  if (!abhaLinked) setIsModalOpen(true)
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    abhaLinked ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                  <Link2 size={15} /> 
                  {abhaLinked ? t("home.abhaLinked") + " (14-xxxx)" : t("home.linkAbha")}
              </button>
              
              <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 px-3 py-1.5 shadow-sm">
                <Globe size={14} className="text-slate-400 shrink-0" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as LangCode)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
          </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-auto rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-orange-100 text-orange-600" : "bg-teal-100 text-teal-600"
            }`}>
              {msg.role === "user" ? <User size={18} /> : <Sparkles size={18} />}
            </div>
            <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 ${
              msg.role === "user" 
                ? "bg-slate-900 text-white rounded-tr-sm" 
                : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm"
            }`}>
              <p className="leading-relaxed text-sm sm:text-base">{msg.content}</p>
              
              {msg.riskLevel && (
                <div className="mt-4 bg-white border rounded-xl p-3 sm:p-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Triage Assessment</span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit ${
                      msg.riskLevel === "low" ? "bg-green-100 text-green-700" :
                      msg.riskLevel === "moderate" ? "bg-orange-100 text-orange-700" :
                      msg.riskLevel === "high" ? "bg-red-100 text-red-700" :
                      "bg-red-600 text-white animate-pulse"
                    }`}>
                      <AlertCircle size={14} /> {msg.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {msg.riskLevel === "critical" ? (
                         <button className="flex-1 text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2">
                            <AlertCircle size={16} /> Dispatch Ambulance
                         </button>
                    ) : (
                        <>
                            <button className="flex-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg transition-colors">
                                Book PHC Visit
                            </button>
                            <button className="flex-1 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 py-2.5 rounded-lg transition-colors">
                                Teleconsultation
                            </button>
                        </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-3 shadow-sm flex items-end gap-2 relative">
        <button 
          type="button"
          onClick={handleVoiceInput}
          className={`p-3 rounded-xl transition-all ${
              isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-600'
          }`}
          title={isRecording ? "Stop Recording" : `Speak in ${LANGUAGES.find(l => l.code === lang)?.label || lang}`}
        >
          {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <form onSubmit={handleSend} className="flex-1 flex items-end relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? "Listening..." : t("home.inputPlaceholder")} 
            className="w-full bg-transparent border-none resize-none max-h-32 min-h-[44px] py-3 focus:outline-none focus:ring-0 text-slate-800 text-sm sm:text-base"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="mb-1 mr-1 p-2.5 sm:p-3 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
      <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-3 font-medium flex justify-center items-center gap-2">
          <span>{t("home.disclaimer")}</span>
      </p>
    </div>
  )
}
