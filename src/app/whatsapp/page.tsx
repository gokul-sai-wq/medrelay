"use client"

import { useState, useRef, useEffect } from "react"
import { Phone, Video, MoreVertical, Paperclip, Mic, Send, Smile, ArrowLeft, Globe, AlertTriangle, Calendar, Activity, CheckCircle2, ShieldCheck, Play, Pause, Signal, SignalLow } from "lucide-react"
import Link from "next/link"
import { getStaffReferrals, getAppointmentRequests, addAppointmentRequest, AppointmentRequest } from "@/lib/store"

type WhatsAppMsg = {
  id: string
  isBot: boolean
  text: string
  time: string
  isVoice?: boolean
  audioUrl?: string
  transcript?: string
}

export default function WhatsAppSimulator() {
  const [mode, setMode] = useState<'whatsapp' | 'sms'>('whatsapp')
  const [networkMode, setNetworkMode] = useState<'4g' | '2g_low'>('4g')
  
  const [messages, setMessages] = useState<WhatsAppMsg[]>([
    {
      id: "1",
      isBot: true,
      text: "Namaste! Welcome to MedRelay Pondicherry AI Health Bot 🏥.\n\nPlease reply with a number (1-6) or record a Voice Note:\n\n1️⃣ Voice Triage & Symptom Checker\n2️⃣ Request Appointment for a Specific Day\n3️⃣ Track Active Referral Progress\n4️⃣ Check Pending OPD Diagnostics & Tests\n5️⃣ 🚨 Emergency SOS (Broadcast to PHC & Hospital)\n6️⃣ Change Bot Language (23 Languages)\n\n🎙️ *Tip:* Tap and hold the Mic button below to record an emergency voice note!",
      time: "10:00 AM"
    }
  ])

  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  const endRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<any>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const triggerBotResponse = (userText: string, voicePayload?: { audioUrl: string; transcript: string }) => {
    const text = userText.trim().toLowerCase()
    let responseText = ""

    if (voicePayload || text === "5" || text.includes("emergency") || text.includes("sos") || text.includes("ambulance") || text.includes("108")) {
      // Trigger emergency dispatch to BOTH PHC & Hospital in Pondicherry
      const emergencyPayload = {
         status: "has_voice",
         location: "Villianur Village, Pondicherry District",
         patientName: "John Doe (WhatsApp Patient)",
         destinations: ["Villianur Sub-Centre PHC", "Indira Gandhi Govt Hospital, Pondicherry"],
         audioUrl: voicePayload?.audioUrl || "demo",
         voiceNote: voicePayload?.audioUrl || "demo",
         transcript: voicePayload?.transcript || "Patient reporting acute chest pain and difficulty breathing via WhatsApp at Villianur Village, Pondicherry.",
         networkStatus: networkMode === '4g' ? "4G Broadband" : "2G Low Bandwidth Offline Cache",
         timestamp: Date.now()
      }
      localStorage.setItem("emergency_dispatch", JSON.stringify(emergencyPayload))
      localStorage.setItem("emergency_status", "pending")

      responseText = `🚨 *EMERGENCY SOS & VOICE NOTE BROADCASTED!*\n\nDistress alert and voice note dispatched simultaneously to:\n• 🏥 *Villianur Sub-Centre PHC*\n• 🚑 *Indira Gandhi Govt Hospital Emergency Ward, Pondicherry*\n\n*Location:* Villianur Village, Pondicherry\n*Network Sync:* ${networkMode === '4g' ? '🟢 4G Active' : '🟠 2G Low Bandwidth (Offline Cached Sync)'}\n*Voice Note Status:* ${voicePayload ? '🎙️ Recorded & Received by PHC/Hospital Staff' : '⚠️ Broadcasted (Waiting for Voice Note)'}\n\nStaff on duty at both facilities have been alerted.`
    }
    else if (text === "1" || text.includes("triage") || text.includes("symptom")) {
      responseText = "🩺 *Voice Triage & Symptom Checker*\n\nPlease describe your current symptoms or tap the mic button to record a voice note (e.g. 'High fever for 3 days and severe headache')."
    } 
    else if (text === "2" || text.includes("appointment") || text.includes("book")) {
      responseText = "📅 *Request Appointment for a Particular Day*\n\nPlease reply with your preferred facility and date in this format:\n\n`Indira Gandhi Govt Hospital Pondicherry, 2026-09-16, Morning`\nor\n`Villianur PHC, 2026-09-17, Afternoon`"
    } 
    else if (text === "3" || text.includes("referral")) {
      const refs = getStaffReferrals()
      if (refs.length === 0) {
        responseText = "📋 *Active Referral Status*\n\nNo active referrals found for your patient record. Referrals created by PHC or Hospital doctors will appear here automatically."
      } else {
        const topRef = refs[0]
        const stageList = topRef.stages.map(s => {
           const icon = s.status === 'done' ? '✅' : s.status === 'current' ? '⏳' : '🔜'
           return `${icon} *${s.label}* (${s.facility})`
        }).join('\n')

        responseText = `📋 *Active Referral Progress*\n*Referral ID:* ${topRef.id}\n*Reason:* ${topRef.reason}\n\n*Stages:\n${stageList}\n\n_Real-time update synced via MedRelay Store._`
      }
    } 
    else if (text === "4" || text.includes("diagnostic") || text.includes("test")) {
      const diagnostics = JSON.parse(localStorage.getItem("medrelay.pending_diagnostics") || "[]")
      if (diagnostics.length === 0) {
        responseText = "🧪 *OPD Diagnostics & Prescriptions*\n\nNo pending diagnostic test orders found. Ordered tests from PHC or Hospital will appear here for review."
      } else {
        const testList = diagnostics.map((d: any, i: number) => `${i + 1}. *${d.testName}* (${d.source})`).join('\n')
        responseText = `🧪 *Pending Diagnostic Tests (${diagnostics.length})*\n\n${testList}\n\nReply 'APPROVE' or visit Diagnostics tab to approve.`
      }
    } 
    else if (text === "6" || text.includes("language") || text.includes("lang")) {
      responseText = "🌐 *Select Preferred Language*\n\nReply with language code or name:\n• *hi* - हिन्दी (Hindi)\n• *mr* - मराठी (Marathi)\n• *ta* - தமிழ் (Tamil)\n• *bn* - বাংলা (Bengali)\n• *en* - English"
    } 
    else if (text.includes(",") || text.includes("hospital") || text.includes("phc")) {
       const parts = userText.split(",").map(s => s.trim())
       const facilityName = parts[0].toLowerCase().includes("phc") ? "Villianur PHC" : "Indira Gandhi Govt Hospital Pondicherry"
       const requestedDate = parts[1] || new Date(Date.now() + 86400000).toISOString().split("T")[0]
       const preferredWindow = parts[2] || "Morning (9:00 AM - 12:00 PM)"

       const newReq: AppointmentRequest = {
          id: "REQ-" + Math.floor(1000 + Math.random() * 9000),
          patientName: "John Doe",
          facility: facilityName,
          requestedDate: requestedDate,
          preferredWindow: preferredWindow,
          department: "General OPD",
          status: "pending",
          createdAt: new Date().toLocaleString()
       }
       addAppointmentRequest(newReq)

       responseText = `🗓️ *Appointment Request Sent!*\n\n*Facility:* ${facilityName}\n*Requested Date:* ${requestedDate}\n*Time Window:* ${preferredWindow}\n\n*Status:* ⏳ *Awaiting Staff Confirmation*\n\nStaff at ${facilityName} will review your request and assign your visit time slot.`
    }
    else {
      responseText = "Thank you for reaching out to MedRelay Bot. Reply with *1-6* or record a *Voice Note* to get started."
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      isBot: true,
      text: responseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
    setIsTyping(false)
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    const userMsg: WhatsAppMsg = {
      id: Date.now().toString(),
      isBot: false,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMsg])
    const currentInput = input.trim()
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      triggerBotResponse(currentInput)
    }, 1000)
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event: any) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          sendVoiceMessage(base64Audio, "Patient voice note recorded at Villianur Village, Pondicherry.")
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.warn("Mic permission restricted or fallback demo mic used", err)
      // Fallback voice message
      sendVoiceMessage("demo", "Emergency voice note: Patient reporting chest tightness and high fever.")
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      sendVoiceMessage("demo", "Emergency voice note: Patient reporting chest tightness and high fever.")
    }
  }

  const sendVoiceMessage = (audioUrl: string, transcript: string) => {
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)

    const voiceMsg: WhatsAppMsg = {
      id: Date.now().toString(),
      isBot: false,
      text: "🎙️ Voice Note Sent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true,
      audioUrl: audioUrl,
      transcript: transcript
    }

    setMessages(prev => [...prev, voiceMsg])
    setIsTyping(true)

    setTimeout(() => {
      triggerBotResponse("emergency voice note", { audioUrl, transcript })
    }, 1000)
  }

  const playVoiceNote = (id: string, audioUrl?: string, transcript?: string) => {
    if (playingAudioId === id) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      setPlayingAudioId(null)
      return
    }

    setPlayingAudioId(id)

    if (audioUrl && audioUrl !== "demo" && audioUrl.startsWith("data:audio")) {
      try {
        const audio = new Audio(audioUrl)
        audio.play()
        audio.onended = () => setPlayingAudioId(null)
        audio.onerror = () => speakText(id, transcript)
      } catch (e) {
        speakText(id, transcript)
      }
    } else {
      speakText(id, transcript)
    }
  }

  const speakText = (id: string, transcript?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const text = transcript || "Emergency voice note recording from Villianur Village, Pondicherry."
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setPlayingAudioId(null)
      utterance.onerror = () => setPlayingAudioId(null)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setPlayingAudioId(null), 3000)
    }
  }

  const sendShortcut = (cmd: string) => {
     setInput(cmd)
     const userMsg: WhatsAppMsg = {
      id: Date.now().toString(),
      isBot: false,
      text: cmd,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    setTimeout(() => {
      triggerBotResponse(cmd)
    }, 800)
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-0 md:p-4 font-sans relative transition-colors duration-500 ${mode === 'whatsapp' ? 'bg-[#e5ddd5]' : 'bg-slate-100'}`}
         style={mode === 'whatsapp' ? { backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' } : {}}
    >
      
      {/* Controls Header */}
      <div className="w-full max-w-[420px] flex items-center justify-between mb-3 px-2 flex-wrap gap-2">
        <Link href="/" className="text-xs font-bold text-slate-700 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
           <ArrowLeft size={14} /> Main Portal
        </Link>

        {/* Network Mode Simulator Switch */}
        <button
          onClick={() => setNetworkMode(prev => prev === '4g' ? '2g_low' : '4g')}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 transition-colors ${
            networkMode === '4g' 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}
        >
          {networkMode === '4g' ? <Signal size={14} className="text-emerald-600" /> : <SignalLow size={14} className="text-amber-600" />}
          <span>{networkMode === '4g' ? '4G Network' : '2G Low Network (Offline Sync)'}</span>
        </button>

        <div className="flex bg-white/90 backdrop-blur rounded-full p-1 shadow-sm border border-slate-200">
          <button 
            onClick={() => setMode('whatsapp')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === 'whatsapp' ? 'bg-[#25D366] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            WhatsApp Bot
          </button>
          <button 
            onClick={() => setMode('sms')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === 'sms' ? 'bg-blue-500 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            SMS Mode (2G)
          </button>
        </div>
      </div>

      {/* Phone Mockup Container */}
      <div className={`w-full h-[100dvh] md:h-[780px] md:max-w-[420px] md:rounded-[40px] md:border-[12px] border-slate-900 relative flex flex-col overflow-hidden shadow-2xl transition-colors duration-500 ${mode === 'whatsapp' ? 'bg-[#e5ddd5]' : 'bg-white'}`}>
        
        {/* Dynamic Island / Top Notch */}
        <div className="hidden md:block absolute top-0 inset-x-0 h-6 flex justify-center z-50">
          <div className="w-32 h-6 bg-slate-900 rounded-b-2xl"></div>
        </div>

        {/* Top Header */}
        <div className={`${mode === 'whatsapp' ? 'bg-[#075e54] text-white' : 'bg-slate-100 text-slate-900 border-b border-slate-200'} flex items-center justify-between px-3 py-3 md:pt-8 z-10 shadow-sm transition-colors duration-500`}>
          <div className="flex items-center gap-2">
            <Link href="/" className={`p-1 rounded-full transition-colors -ml-1 ${mode === 'whatsapp' ? 'hover:bg-white/20' : 'hover:bg-slate-200'}`}>
              <ArrowLeft size={20} />
            </Link>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${mode === 'whatsapp' ? 'bg-white/20 border border-white/30' : 'bg-slate-300'}`}>
              <span className="text-xl">🏥</span>
            </div>
            <div className="leading-tight">
              <h1 className="font-semibold text-[16px]">{mode === 'whatsapp' ? 'MedRelay AI Bot' : '555-MEDRELAY'}</h1>
              <p className={`text-[11px] ${mode === 'whatsapp' ? 'text-white/80' : 'text-slate-500'}`}>
                {isTyping ? "typing..." : (mode === 'whatsapp' ? `online • ${networkMode === '4g' ? '4G' : '2G Sync'}` : 'Text Message')}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-4 ${mode === 'whatsapp' ? 'text-white' : 'text-blue-500'}`}>
            <Video size={20} className="hidden sm:block opacity-80" />
            <Phone size={20} className="hidden sm:block opacity-80" />
            <MoreVertical size={20} />
          </div>
        </div>

        {/* Quick Demo Shortcut Chips */}
        <div className="bg-slate-900/10 backdrop-blur-sm p-2 flex items-center gap-1.5 overflow-x-auto z-10 border-b border-slate-200/50">
           <button onClick={() => sendShortcut("1")} className="px-2.5 py-1 bg-white text-slate-800 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap hover:bg-slate-100">
              1️⃣ Triage
           </button>
           <button onClick={() => sendShortcut("2")} className="px-2.5 py-1 bg-white text-slate-800 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap hover:bg-slate-100">
              2️⃣ Day Appointment
           </button>
           <button onClick={() => sendShortcut("3")} className="px-2.5 py-1 bg-white text-slate-800 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap hover:bg-slate-100">
              3️⃣ Referral
           </button>
           <button onClick={() => sendShortcut("5")} className="px-2.5 py-1 bg-red-600 text-white rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap hover:bg-red-700">
              🚨 Emergency SOS
           </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10" style={{ scrollbarWidth: 'none' }}>
          
          <div className="flex justify-center mb-2">
            <div className="bg-[#e1f3fb] text-[#1f2937] text-[11px] px-3 py-1 rounded-xl shadow-sm text-center font-medium">
              🔒 End-to-end encrypted • Synchronized to PHC & Hospital Hubs
            </div>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
              <div 
                className={`relative max-w-[88%] px-3.5 py-2.5 rounded-2xl shadow-sm text-[14px] transition-colors duration-500 ${
                  msg.isBot 
                    ? (mode === 'whatsapp' ? "bg-white rounded-tl-none text-[#111b21]" : "bg-[#e5e5ea] rounded-bl-sm text-black")
                    : (mode === 'whatsapp' ? "bg-[#dcf8c6] rounded-tr-none text-[#111b21]" : "bg-blue-500 rounded-br-sm text-white")
                }`}
                style={{ wordBreak: 'break-word' }}
              >
                {msg.isVoice ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-black/5 p-2 rounded-xl border border-black/10">
                      <button 
                        onClick={() => playVoiceNote(msg.id, msg.audioUrl, msg.transcript)} 
                        className="w-9 h-9 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow hover:bg-[#1faa53] transition-colors"
                      >
                         {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                      </button>
                      <div className="flex-1">
                         <div className="h-1.5 bg-slate-300 rounded-full overflow-hidden">
                            <div className={`h-full bg-[#25D366] ${playingAudioId === msg.id ? 'w-full animate-pulse' : 'w-2/3'}`}></div>
                         </div>
                         <span className="text-[10px] font-bold text-slate-600 block mt-1">🎙️ Emergency Voice Note</span>
                      </div>
                    </div>
                    {msg.transcript && (
                      <p className="text-[11px] text-slate-600 italic bg-white/50 p-1.5 rounded border border-black/5">
                        "{msg.transcript}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                )}

                <div className={`text-[10px] text-right mt-1 opacity-80 flex items-center justify-end gap-1 ${
                    mode === 'whatsapp' ? 'text-slate-500' : (msg.isBot ? 'text-slate-500' : 'text-blue-100')
                }`}>
                  {msg.time}
                  {!msg.isBot && mode === 'whatsapp' && <span className="text-[#53bdeb]">✓✓</span>}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex justify-start">
               <div className={`rounded-2xl px-4 py-3 shadow-sm flex gap-1 items-center ${mode === 'whatsapp' ? 'bg-white rounded-tl-none' : 'bg-[#e5e5ea] rounded-bl-sm'}`}>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Recording Overlay banner if recording */}
        {isRecording && (
           <div className="bg-red-600 text-white p-3 flex justify-between items-center z-20 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold">
                 <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                 Recording Emergency Voice Note: 00:{recordingTime.toString().padStart(2, '0')}
              </div>
              <button 
                onClick={stopVoiceRecording}
                className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-black hover:bg-red-50"
              >
                Send Voice Note
              </button>
           </div>
        )}

        {/* Input Controls */}
        <div className={`${mode === 'whatsapp' ? 'bg-[#f0f0f0]' : 'bg-white border-t border-slate-200'} p-2 flex items-center gap-2 z-10 relative md:pb-6 transition-colors duration-500`}>
          <div className={`flex-1 rounded-full flex items-center px-2 py-1 relative ${mode === 'whatsapp' ? 'bg-white' : 'bg-slate-100 border border-slate-200'}`}>
            <button className={`p-2 rounded-full ${mode === 'whatsapp' ? 'text-[#54656f] hover:bg-slate-100' : 'text-slate-400'}`}>
              <Smile size={22} />
            </button>
            <form onSubmit={handleSend} className="flex-1 flex">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'whatsapp' ? "Reply 1-6 or type message..." : "Text Message..."}
                className={`w-full outline-none px-2 text-[14px] py-2 bg-transparent ${mode === 'whatsapp' ? 'text-[#111b21]' : 'text-slate-900'}`}
              />
            </form>
            <button className={`p-2 rounded-full transform -rotate-45 ${mode === 'whatsapp' ? 'text-[#54656f] hover:bg-slate-100' : 'text-slate-400'}`}>
              <Paperclip size={20} />
            </button>
          </div>
          
          {!input.trim() ? (
             <button 
               onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
               className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white transition-all shadow-sm shrink-0 ${
                 isRecording ? "bg-red-600 hover:bg-red-700 animate-bounce" : (mode === 'whatsapp' ? "bg-[#00a884] hover:bg-[#008f6f]" : "bg-blue-500 hover:bg-blue-600")
               }`}
               title="Record Voice Note"
             >
               <Mic size={20} />
             </button>
          ) : (
             <button 
               onClick={handleSend}
               className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white transition-colors shadow-sm shrink-0 ${
                 mode === 'whatsapp' ? "bg-[#00a884] hover:bg-[#008f6f]" : "bg-blue-500 hover:bg-blue-600"
               }`}
             >
               <Send size={18} className="ml-1" />
             </button>
          )}
        </div>

      </div>

    </div>
  )
}

