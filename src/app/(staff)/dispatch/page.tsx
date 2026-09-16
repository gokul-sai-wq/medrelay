"use client"
import { useState, useEffect, useRef } from "react"
import { AlertOctagon, MapPin, Play, Pause, Phone, Video, X, Check, Loader2, SignalHigh, Volume2, Mic } from "lucide-react"

export default function DispatchPage() {
  const [incomingSOS, setIncomingSOS] = useState<any>(null)
  const [callStatus, setCallStatus] = useState<"idle" | "incoming" | "connected">("idle")
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Polling for demo purposes to catch localStorage updates from other tabs instantly
    const interval = setInterval(() => {
      const payloadStr = localStorage.getItem("emergency_dispatch")
      if (payloadStr) {
        const payload = JSON.parse(payloadStr)
        if (payload.status === "location_only" || payload.status === "pending_voice" || payload.status === "has_voice") {
           if (callStatus === "idle") {
               setIncomingSOS(payload)
               setCallStatus("incoming")
           } else if (callStatus === "incoming") {
               // Update payload if voice note arrived
               setIncomingSOS(payload)
           }
        }
      } else if (callStatus !== "idle" && callStatus !== "connected") {
          // If cleared, reset
          setIncomingSOS(null)
          setCallStatus("idle")
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [callStatus])

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

  const handleAccept = async () => {
    localStorage.setItem("emergency_status", "accepted")
    setCallStatus("connected")
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (e) {
      console.error("Camera access denied", e)
    }
  }

  const handleReject = () => {
    localStorage.removeItem("emergency_dispatch")
    localStorage.setItem("emergency_status", "rejected")
    setCallStatus("idle")
    setIncomingSOS(null)
  }
  
  const endCall = () => {
    localStorage.removeItem("emergency_dispatch")
    localStorage.removeItem("emergency_status")
    setCallStatus("idle")
    setIncomingSOS(null)
    if (videoRef.current?.srcObject) {
       const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
       tracks.forEach(track => track.stop())
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 relative">
      
      {/* 1. Idle State */}
      {callStatus === "idle" && (
        <div className="text-center opacity-50">
          <SignalHigh size={64} className="mx-auto text-slate-400 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-600">Dispatch Center Online</h2>
          <p className="text-slate-500">Monitoring for incoming rural SOS signals...</p>
        </div>
      )}

      {/* 2. Incoming SOS State */}
      {callStatus === "incoming" && incomingSOS && (
        <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-red-500 animate-in zoom-in-95 duration-300">
           
           {/* Header */}
           <div className="bg-red-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-ping">
                    <AlertOctagon size={24} className="text-white" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-black tracking-wider">CRITICAL INCOMING SOS</h1>
                    <p className="text-red-100 font-medium">Auto-Routed to Nearest Facility: Villianur Sub-Centre PHC (Pondicherry)</p>
                 </div>
              </div>
              <div className="text-right">
                  <div className="text-3xl font-mono font-bold">00:00</div>
                  <div className="text-xs font-bold text-red-200">TIME ELAPSED</div>
              </div>
           </div>

           {/* Payload Details */}
           <div className="p-8 space-y-6">
              
              {/* Location */}
              <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="text-blue-600" />
                  </div>
                  <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase">Live GPS Coordinates</h3>
                      <p className="text-lg font-bold text-slate-900">{incomingSOS.location}</p>
                      <p className="text-sm text-blue-600 font-semibold cursor-pointer mt-1">Open in Map Tracker ↗</p>
                  </div>
              </div>

              <hr className="border-slate-100" />

              {/* Voice Note */}
              <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      {incomingSOS.status === "location_only" ? (
                         <Loader2 className="text-green-600 animate-spin" />
                      ) : (
                         <Volume2 className="text-green-600" />
                      )}
                  </div>
                  <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Patient Voice Note</h3>
                      
                      {incomingSOS.status === "location_only" ? (
                          <div className="h-12 bg-slate-50 rounded-lg flex items-center px-4 border border-slate-100 border-dashed">
                             <span className="text-slate-400 font-medium animate-pulse">Waiting for audio payload...</span>
                          </div>
                      ) : (
                          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                              <button 
                                onClick={playVoiceNote}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-colors ${
                                  isPlayingAudio ? "bg-amber-500 hover:bg-amber-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
                                }`}
                              >
                                  {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ml-1" />}
                              </button>
                              <div className="flex-1">
                                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div className={`h-full bg-green-500 transition-all duration-300 ${isPlayingAudio ? 'w-full animate-pulse' : 'w-1/3'}`}></div>
                                  </div>
                              </div>
                              <span className="text-xs font-bold text-slate-500">{isPlayingAudio ? "PLAYING" : "PLAY"}</span>
                          </div>
                      )}
                      
                      {incomingSOS.transcript && (
                        <p className="text-xs text-slate-500 font-mono mt-2 bg-slate-100 p-2 rounded border border-slate-200">
                          <strong>Transcript:</strong> "{incomingSOS.transcript}"
                        </p>
                      )}
                  </div>
              </div>

           </div>

           {/* Action Buttons */}
           <div className="bg-slate-50 p-6 flex gap-4 border-t border-slate-200">
              <button 
                onClick={handleReject}
                className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                  <X size={20} /> ROUTE TO OTHER PHC
              </button>
              <button 
                onClick={handleAccept}
                disabled={incomingSOS.status === "location_only"}
                className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg ${
                    incomingSOS.status === "location_only" ? "bg-green-300 cursor-not-allowed text-white" : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                  <Video size={20} /> ACCEPT & CONNECT VIDEO
              </button>
           </div>
        </div>
      )}

      {/* 3. Connected Video Call State */}
      {callStatus === "connected" && (
        <div className="w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 h-[700px] flex flex-col">
          {/* Header */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center text-white">
             <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold tracking-widest text-lg">PATIENT TELE-CONSULT: ACTIVE</span>
             </div>
             <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-slate-600">
                 LAT: 11.9416 | LNG: 79.8083 (Pondicherry)
             </div>
          </div>
          
          {/* Video Feed (Using actual webcam) */}
          <div className="flex-1 bg-zinc-900 relative">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="w-full h-full object-cover"
             />
          </div>
          
          {/* Controls */}
          <div className="h-24 bg-zinc-950 flex items-center justify-center gap-6">
             <button className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white transition-colors">
                <Mic size={24} />
             </button>
             <button 
               onClick={endCall}
               className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
             >
                <Phone className="rotate-[135deg]" size={28} />
             </button>
          </div>
        </div>
      )}

    </div>
  )
}
