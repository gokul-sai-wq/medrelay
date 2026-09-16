"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ShieldAlert, MapPin, Mic, MicOff, Send, PhoneCall, AlertTriangle, ArrowRight, CheckCircle2, Loader2, Video, VideoOff, Phone, MessageSquare } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export default function EmergencyPage() {
  const { t } = useLanguage()
  const [step, setStep] = useState<"confirm" | "locating" | "recording" | "waiting" | "connected">("confirm")
  const [sliderPosition, setSliderPosition] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false)

  const sliderRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<any>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pipVideoRef = useRef<HTMLVideoElement>(null)

  // Polling to see if PHC accepted the call and remote video state (for demo purposes via localStorage)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (step === "waiting" || step === "connected") {
      interval = setInterval(() => {
        if (step === "waiting") {
          const status = localStorage.getItem("emergency_status")
          if (status === "accepted") {
            setStep("connected")
            startVideo()
          }
        }
        if (step === "connected") {
          const remoteVideo = localStorage.getItem("hospital_video")
          setIsRemoteVideoOff(remoteVideo === "off")
        }
      }, 500)
    }
    return () => clearInterval(interval)
  }, [step])

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      if (pipVideoRef.current) {
        pipVideoRef.current.srcObject = stream
      }
      setIsMuted(false)
      setIsVideoOff(false)
      localStorage.setItem("user_video", "on")
    } catch (e) {
      console.error("Camera access denied", e)
    }
  }

  const toggleMute = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  }

  const toggleVideo = () => {
    setIsVideoOff(prev => {
      const next = !prev
      localStorage.setItem("user_video", next ? "off" : "on")
      return next
    })
  }

  const handleSliderDrag = (e: React.MouseEvent | React.TouchEvent | any) => {
    if (step !== "confirm") return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    let newPos = clientX - rect.left - 30 // 30 is half button width
    
    const maxPos = rect.width - 60
    if (newPos < 0) newPos = 0
    if (newPos > maxPos) newPos = maxPos
    
    setSliderPosition(newPos)

    if (newPos === maxPos) {
      handleConfirmSOS()
    }
  }

  const handleSliderEnd = () => {
    if (step === "confirm" && sliderRef.current) {
      const maxPos = sliderRef.current.getBoundingClientRect().width - 60
      if (sliderPosition < maxPos * 0.9) {
        setSliderPosition(0)
      } else {
        handleConfirmSOS()
      }
    }
  }

  const handleConfirmSOS = () => {
    setStep("locating")
    
    // Broadcast emergency dispatch simultaneously to hospital & PHC staff hubs in Pondicherry
    const payload = {
      status: "pending_voice",
      location: "Villianur Village, Pondicherry District",
      patientName: "John Doe (Patient #1024)",
      destinations: ["Villianur Sub-Centre PHC", "Indira Gandhi Govt Hospital, Pondicherry"],
      timestamp: Date.now()
    }
    localStorage.setItem("emergency_dispatch", JSON.stringify(payload))
    localStorage.setItem("emergency_status", "pending")
    localStorage.setItem("user_video", "on")

    setTimeout(() => {
      setStep("recording")
    }, 2000)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event: any) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Convert to base64 for local storage sync across tabs
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          const payload = JSON.parse(localStorage.getItem("emergency_dispatch") || "{}")
          payload.status = "has_voice"
          payload.audioUrl = base64Audio || url
          payload.voiceNote = base64Audio || url
          payload.transcript = "Patient reporting severe breathlessness and acute chest pain at Villianur Village, Pondicherry."
          localStorage.setItem("emergency_dispatch", JSON.stringify(payload))
        }
        
        setStep("waiting")
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error("Microphone access denied or network restricted", err)
      // Fallback if mic permission is restricted in demo environment
      const payload = JSON.parse(localStorage.getItem("emergency_dispatch") || "{}")
      payload.status = "has_voice"
      payload.audioUrl = "demo"
      payload.voiceNote = "demo"
      payload.transcript = "Patient reporting severe breathlessness and acute chest pain at Villianur Village, Pondicherry."
      localStorage.setItem("emergency_dispatch", JSON.stringify(payload))
      setStep("waiting")
    }
  }

  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop() // This triggers onstop above
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
       const payload = JSON.parse(localStorage.getItem("emergency_dispatch") || "{}")
       payload.status = "has_voice"
       payload.audioUrl = "demo"
       payload.voiceNote = "demo"
       payload.transcript = "Patient reporting severe breathlessness and acute chest pain at Villianur Village, Pondicherry."
       localStorage.setItem("emergency_dispatch", JSON.stringify(payload))
       setStep("waiting")
    }
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col items-center justify-center p-4">
      
      {/* 1. Confirmation Step */}
      {step === "confirm" && (
        <div className="w-full max-w-md bg-red-50 rounded-3xl p-8 border-2 border-red-200 text-center shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ShieldAlert size={48} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-black text-red-700 mb-2">{t("emergency.sosTitle")}</h1>
          <p className="text-red-600/80 font-medium mb-12">{t("emergency.sosSubtitle")}</p>
          
          <div 
            ref={sliderRef}
            className="w-full h-16 bg-red-100 rounded-full relative overflow-hidden flex items-center shadow-inner touch-none"
            onMouseMove={(e) => e.buttons === 1 && handleSliderDrag(e)}
            onMouseUp={handleSliderEnd}
            onMouseLeave={handleSliderEnd}
            onTouchMove={handleSliderDrag}
            onTouchEnd={handleSliderEnd}
          >
            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold tracking-widest pl-12 opacity-50 select-none text-sm sm:text-base">
              {t("emergency.slideToConfirm")}
            </div>
            <div 
              className="absolute h-14 w-14 bg-red-600 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-10 transition-transform duration-75"
              style={{ transform: `translateX(${sliderPosition + 4}px)` }}
            >
              <ArrowRight className="text-white" size={24} />
            </div>
            <div 
               className="absolute left-0 h-full bg-red-500/20"
               style={{ width: sliderPosition + 30 }}
            ></div>
          </div>
        </div>
      )}

      {/* 2. Locating Step */}
      {step === "locating" && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center mx-auto relative mb-6">
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>
            <MapPin size={48} className="text-blue-600 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acquiring Location...</h2>
          <p className="text-slate-500">Transmitting exact GPS coordinates to nearest PHC.</p>
        </div>
      )}

      {/* 3. Voice Recording Step */}
      {step === "recording" && (
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Location Sent to PHC
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Record Voice Note</h2>
          <p className="text-slate-500 mb-8">Describe the emergency so doctors can prepare.</p>
          
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto hover:bg-slate-200 transition-colors shadow-sm group"
            >
              <Mic size={48} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-32 h-32 bg-red-100 rounded-full animate-ping opacity-75"></div>
              </div>
              <button 
                onClick={stopRecordingAndSend}
                className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto relative shadow-lg hover:bg-red-600 transition-colors"
              >
                <div className="text-white text-center">
                  <div className="font-mono text-2xl font-bold mb-1">
                    00:{recordingTime.toString().padStart(2, '0')}
                  </div>
                  <Send size={24} className="mx-auto" />
                </div>
              </button>
            </div>
          )}
          
          <p className="text-sm font-bold text-slate-400 mt-8 uppercase tracking-widest">
            {isRecording ? "Tap to send to Hospital" : "Tap microphone to speak"}
          </p>
        </div>
      )}

      {/* 4. Waiting for Acceptance */}
      {step === "waiting" && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
            <Loader2 size={48} className="text-orange-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Alerting Hospitals</h2>
          <p className="text-slate-500 mb-4">Voice note and location broadcasted.<br/>Waiting for a doctor to accept the video call.</p>
          <div className="flex gap-2 justify-center">
             <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
             <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{animationDelay: '0.2s'}}></span>
             <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{animationDelay: '0.4s'}}></span>
          </div>

          {/* Unresponsive PHC Escalation Callout */}
          <div className="mt-8 max-w-md mx-auto p-4 bg-red-50/90 border border-red-200 rounded-2xl text-left space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <span>PHC Not Responding or Emergency Not Accepted?</span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              If your emergency SOS is not accepted or medical staff fail to answer, file an official escalation directly with the <strong>District Health Command Center (Govt of Puducherry)</strong>.
            </p>
            <div className="pt-1">
              <Link
                href="/report?category=Emergency%20SOS%20Not%20Accepted%20%2F%20Ignored&facility=Villianur%20Sub-Centre%20PHC%2C%20Pondicherry"
                className="w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert size={14} />
                Report to Government Admin Command
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Video Connected */}
      {step === "connected" && (
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[600px] animate-in zoom-in-95 duration-500">
          
          {/* Left: Video */}
          <div className="flex-[2] bg-black rounded-3xl overflow-hidden shadow-2xl relative flex flex-col border border-slate-800">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center text-white">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-bold tracking-widest">LIVE EMERGENCY TELE-CONSULT</span>
               </div>
               <div className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                   <AlertTriangle size={14} /> Recording
               </div>
            </div>
            
            {/* Video Feed (Using actual webcam) */}
            <div className="flex-1 bg-zinc-900 relative">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 className={`w-full h-full object-cover absolute inset-0 z-0 ${isRemoteVideoOff ? 'hidden' : ''}`}
               />
               
               {isRemoteVideoOff && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-0">
                     <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center">
                        <span className="text-4xl text-slate-500 font-bold">DR</span>
                     </div>
                     <p className="text-slate-400 mt-4 font-medium">Doctor's Video is Off</p>
                  </div>
               )}

               {/* PIP "You" Window */}
               <div className="absolute top-6 right-6 w-32 md:w-48 h-24 md:h-32 bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex items-center justify-center overflow-hidden z-10">
                  <video 
                    ref={pipVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover absolute inset-0 ${isVideoOff ? 'hidden' : ''}`}
                  />
                  
                  {isVideoOff && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                           <span className="text-sm text-slate-400 font-bold">YOU</span>
                        </div>
                     </div>
                  )}
                  
                  <span className="text-slate-200 text-xs font-bold absolute bottom-2 left-2 z-10 bg-black/50 px-2 py-1 rounded">You</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
               </div>

               {/* Controls (Floating over video) */}
               <div className="absolute bottom-8 inset-x-0 flex justify-center z-20">
                  <div className="bg-[#1F2937]/90 backdrop-blur-md px-6 py-4 rounded-full flex items-center gap-6 border border-slate-700 shadow-2xl">
                    <button 
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                    >
                       {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button 
                      onClick={toggleVideo}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                    >
                       {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                    <button 
                      onClick={() => {
                        setStep("confirm")
                        localStorage.removeItem("emergency_status")
                        localStorage.removeItem("emergency_dispatch")
                        localStorage.removeItem("user_video")
                      }}
                      className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors shadow-lg shadow-red-600/20"
                    >
                       <Phone className="rotate-[135deg]" size={24} />
                    </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Chat Card */}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-800">Live Text Chat</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {/* User Msg */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-[#5841D8] text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm">
                    Hello doctor, I've been feeling these symptoms for the past 2 days.
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">You</div>
                </div>
                {/* Doctor Msg */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">Dr</div>
                  <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 shadow-sm">
                    I see. Can you tell me if your asthma is flaring up?
                  </div>
                </div>
             </div>
             <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="w-full bg-white border border-slate-300 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#5841D8]/50 shadow-sm"
                  />
                  <button className="absolute right-1.5 top-1.5 w-9 h-9 bg-[#5841D8] rounded-full flex items-center justify-center text-white hover:bg-[#4935B8] transition-colors">
                    <Send size={16} className="-ml-0.5" />
                  </button>
                </div>
             </div>
          </div>

        </div>
      )}

    </div>
  )
}
