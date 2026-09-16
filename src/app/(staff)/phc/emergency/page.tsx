"use client"

import { useEffect, useState } from "react"
import { AlertOctagon, MapPin, Play, Pause, Loader2, Volume2, Building2, PhoneCall, CheckCircle2 } from "lucide-react"

export default function PHCEmergencyPage() {
  const [incomingSOS, setIncomingSOS] = useState<any>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const payloadStr = localStorage.getItem("emergency_dispatch")
      if (payloadStr) {
        setIncomingSOS(JSON.parse(payloadStr))
      } else {
        setIncomingSOS(null)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const playVoiceNote = () => {
    if (isPlayingAudio) {
      if (activeAudioObj) {
        activeAudioObj.pause()
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsPlayingAudio(false)
      return
    }

    const audioSrc = incomingSOS?.audioUrl || incomingSOS?.voiceNote
    setIsPlayingAudio(true)

    if (audioSrc && audioSrc !== "demo" && audioSrc.startsWith("data:audio")) {
      try {
        const audio = new Audio(audioSrc)
        setActiveAudioObj(audio)
        audio.play()
        audio.onended = () => setIsPlayingAudio(false)
        audio.onerror = () => fallbackSpeech()
      } catch (e) {
        fallbackSpeech()
      }
    } else {
      fallbackSpeech()
    }
  }

  const fallbackSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const text = incomingSOS?.transcript || "Emergency distress call from Villianur Village, Pondicherry. Patient John Doe reporting severe breathlessness and acute discomfort."
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setIsPlayingAudio(false), 4000)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Villianur PHC Emergency Monitoring</h1>
        <p className="text-slate-500 mt-1">Live monitoring for SOS distress signals in Sub-Centre & PHC area (Pondicherry Region).</p>
      </div>

      {incomingSOS ? (
        <div className="bg-red-600 rounded-2xl shadow-xl overflow-hidden border-2 border-red-500 animate-in slide-in-from-top-4 duration-300">
           <div className="p-4 sm:p-6 text-white flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-red-500/50 pb-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-ping shrink-0">
                       <AlertOctagon size={24} className="text-white" />
                    </div>
                    <div>
                       <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase">SOS Alert Triggered</h2>
                       <p className="text-red-100 font-semibold text-sm flex items-center gap-2 mt-0.5">
                         <Building2 size={15} /> Routed to: Villianur Sub-Centre PHC & Indira Gandhi Govt Hospital, Pondicherry
                       </p>
                    </div>
                 </div>

                 <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-white/20 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-300" /> Multi-Hub Network Sync
                 </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between border border-white/20 items-stretch sm:items-center">
                 <div>
                    <div className="text-xs font-bold text-red-200 uppercase mb-1 flex items-center gap-1">
                       <MapPin size={14} /> Patient Name & Location
                    </div>
                    <div className="font-bold text-lg">{incomingSOS.patientName || "John Doe"}</div>
                    <div className="font-mono text-sm text-red-100 mt-0.5">{incomingSOS.location}</div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {incomingSOS.status === "location_only" ? (
                       <div className="flex items-center gap-2 text-red-200 text-sm font-medium bg-red-700/50 px-4 py-2 rounded-lg">
                          <Loader2 size={16} className="animate-spin" /> Recording voice note...
                       </div>
                    ) : (
                       <button 
                         onClick={playVoiceNote}
                         className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all ${
                           isPlayingAudio 
                             ? "bg-amber-400 text-slate-900 hover:bg-amber-300 animate-pulse" 
                             : "bg-white text-red-600 hover:bg-red-50"
                         }`}
                       >
                         {isPlayingAudio ? (
                           <>
                             <Pause size={18} /> STOP AUDIO NOTE
                           </>
                         ) : (
                           <>
                             <Volume2 size={18} /> LISTEN TO VOICE NOTE
                           </>
                         )}
                       </button>
                    )}
                 </div>
              </div>

              {incomingSOS.transcript && (
                <div className="bg-black/20 rounded-lg p-3 text-xs text-red-100 font-mono flex items-center gap-2">
                  <span className="font-bold text-white uppercase shrink-0">Voice Note Audio Transcript:</span>
                  <span>"{incomingSOS.transcript}"</span>
                </div>
              )}

           </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <AlertOctagon size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No Active Emergencies</h3>
          <p className="text-slate-500">Awaiting rural SOS distress signals from PHC network.</p>
        </div>
      )}
    </div>
  )
}

