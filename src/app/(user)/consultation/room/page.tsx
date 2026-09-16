"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Video, Phone, Mic, MicOff, VideoOff, PhoneOff, Loader2, MessageSquare, Send } from "lucide-react"

export default function UserConsultationRoom() {
  const router = useRouter()
  const [status, setStatus] = useState<"connecting" | "connected">("connecting")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isDoctorVideoOff, setIsDoctorVideoOff] = useState(false)
  const [doctorName, setDoctorName] = useState("Doctor")

  const videoRef = useRef<HTMLVideoElement>(null)
  const pipVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const reqStr = localStorage.getItem("teleconsultation_request")
    if (reqStr) {
      setDoctorName(JSON.parse(reqStr).doctor || "Doctor")
    }

    const interval = setInterval(() => {
      if (status === "connecting") {
        const currentStatus = localStorage.getItem("teleconsultation_status")
        if (currentStatus === "accepted") {
          setStatus("connected")
          startVideo()
        }
      } else if (status === "connected") {
        const docVid = localStorage.getItem("doctor_tele_video")
        setIsDoctorVideoOff(docVid === "off")
        
        if (!localStorage.getItem("teleconsultation_status")) {
          // Doctor ended call
          endCall()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [status])

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      if (pipVideoRef.current) pipVideoRef.current.srcObject = stream
      setIsMuted(false)
      setIsVideoOff(false)
      localStorage.setItem("user_tele_video", "on")
    } catch (e) {
      console.error("Camera access denied", e)
    }
  }

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted)
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = isVideoOff)
      const newState = !isVideoOff
      setIsVideoOff(newState)
      localStorage.setItem("user_tele_video", newState ? "off" : "on")
    }
  }

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    localStorage.removeItem("teleconsultation_request")
    localStorage.removeItem("teleconsultation_status")
    router.push("/consultation")
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-950 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800">
      
      {status === "connecting" ? (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-indigo-950/20 z-0"></div>
          <div className="z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-900/50 rounded-full flex items-center justify-center animate-pulse mb-6 border-4 border-indigo-500/30">
              <Loader2 size={40} className="text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Contacting {doctorName}...</h2>
            <p className="text-indigo-200/70">Please wait while the doctor joins the secure room.</p>
            <button onClick={endCall} className="mt-8 px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors font-medium text-sm">
              Cancel Request
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 h-full bg-slate-50">
          {/* Left: Video */}
          <div className="flex-[2] relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Main Video (Doctor) */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover absolute inset-0 z-0 ${isDoctorVideoOff ? 'hidden' : ''}`}
            />
            
            {isDoctorVideoOff && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-0">
                  <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
                     <span className="text-4xl text-slate-500 font-bold">{doctorName.charAt(4)}</span>
                  </div>
                  <p className="text-slate-400 mt-4 font-medium">{doctorName}'s Video is Off</p>
               </div>
            )}

            {/* PIP Video (User) */}
            <div className="absolute top-6 right-6 w-32 md:w-48 h-24 md:h-32 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden z-10">
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
               <span className="text-white text-xs font-bold absolute bottom-2 left-2 z-10 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">You</span>
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-full border border-slate-700 shadow-2xl z-20">
              <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
              <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-700 hover:bg-red-800 text-white flex items-center justify-center shadow-md transition-all">
                <PhoneOff size={24} />
              </button>
            </div>
            
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 z-10">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-white text-sm font-medium tracking-wide">Secure Teleconsultation</span>
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
