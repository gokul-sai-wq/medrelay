"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertOctagon, MapPin, Play, Pause, FileText, CheckCircle, Loader2, Volume2, X, Video, VideoOff, Mic, MicOff, Phone, History } from "lucide-react"

export default function HospitalPortalPage() {
  const [incomingSOS, setIncomingSOS] = useState<any>(null)
  const [callStatus, setCallStatus] = useState<"idle" | "incoming" | "connected">("idle")
  const videoRef = useRef<HTMLVideoElement>(null)
  const pipVideoRef = useRef<HTMLVideoElement>(null)
  
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false)
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchHistory = () => {
      const history = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
      history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      // Filter for this facility and limit to 5
      setMedicalHistory(history.filter((h: any) => h.facility.includes("Hospital") || h.facility.includes("District")).slice(0, 5))
    }
    
    fetchHistory()
    const int2 = setInterval(fetchHistory, 2000)

    // Polling for demo purposes to catch localStorage updates from other tabs instantly
    const interval = setInterval(() => {
      const payloadStr = localStorage.getItem("emergency_dispatch")
      if (payloadStr) {
        const payload = JSON.parse(payloadStr)
        if (payload.status === "location_only" || payload.status === "pending_voice") {
           if (callStatus === "idle") {
               setIncomingSOS(payload)
               setCallStatus("incoming")
           } else if (callStatus === "incoming") {
               setIncomingSOS(payload)
           }
        }
      } else if (callStatus !== "idle" && callStatus !== "connected") {
          setIncomingSOS(null)
          setCallStatus("idle")
      }

      if (callStatus === "connected") {
          const remoteVideo = localStorage.getItem("user_video")
          setIsRemoteVideoOff(remoteVideo === "off")
      }
    }, 500)
    
    return () => { clearInterval(interval); clearInterval(int2); }
  }, [callStatus])

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null)

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
      if (pipVideoRef.current) {
        pipVideoRef.current.srcObject = stream
      }
      setIsMuted(false)
      setIsVideoOff(false)
      localStorage.setItem("hospital_video", "on")
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
      localStorage.setItem("hospital_video", next ? "off" : "on")
      return next
    })
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
    localStorage.removeItem("hospital_video")
    setCallStatus("idle")
    setIncomingSOS(null)
    if (videoRef.current?.srcObject) {
       const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
       tracks.forEach(track => track.stop())
    }
  }

  // Connected Video Call UI
  if (callStatus === "connected") {
    return (
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button 
               onClick={endCall}
               className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Patient Consultation Room</h1>
              <p className="text-sm text-slate-500">Session ID: #1024-5</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Live
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left: Video Feed */}
          <div className="flex-1 bg-[#111827] rounded-2xl relative overflow-hidden flex flex-col shadow-sm border border-slate-200">
            {/* The actual video feed */}
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
                      <span className="text-4xl text-slate-500 font-bold">JD</span>
                   </div>
                   <p className="text-slate-400 mt-4 font-medium">Patient Video is Off</p>
                </div>
            )}
            
            {/* PIP "You" Window */}
            <div className="absolute top-6 right-6 w-48 h-32 bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex items-center justify-center overflow-hidden z-10">
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

            {/* If video fails to load, show placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none opacity-0">
               <div className="w-32 h-32 border-4 border-slate-700 rounded-full flex flex-col items-center justify-end overflow-hidden mb-4 relative">
                  <div className="w-12 h-12 bg-slate-700 rounded-full absolute top-4"></div>
                  <div className="w-24 h-16 bg-slate-700 rounded-t-full mt-4"></div>
               </div>
               <p className="text-slate-400 font-medium">Patient Video Feed Connected</p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
               <div className="bg-[#1F2937]/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 border border-slate-700 shadow-xl">
                 <button 
                   onClick={toggleMute}
                   className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                 >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                 </button>
                 <button 
                   onClick={toggleVideo}
                   className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                 >
                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                 </button>
                 <button 
                   onClick={endCall}
                   className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors shadow-lg"
                 >
                    <Phone className="rotate-[135deg]" size={20} />
                 </button>
               </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto">
            
            {/* Medical Profile Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                  <FileText size={18} className="text-blue-600" />
                  Patient Medical Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Name</span>
                  <span className="text-sm font-medium text-slate-900">John Doe</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Age / Gender</span>
                  <span className="text-sm font-medium text-slate-900">45 / Male</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Blood Type</span>
                  <span className="text-sm font-medium text-slate-900">O+</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500 block mb-2">Reported Symptoms</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Headache</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Fever</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Fatigue</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-500 block mb-2">Pre-existing Conditions</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200">Asthma</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Card */}
            <Card className="shadow-sm border-slate-200 flex-1 flex flex-col min-h-[300px]">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Live Text Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {/* Patient Msg */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">JD</div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 shadow-sm">
                    Hello doctor, I've been feeling these symptoms for the past 2 days.
                  </div>
                </div>
                {/* Doctor Msg */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-[#5841D8] text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm">
                    I see. Can you tell me if your asthma is flaring up?
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">Dr</div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#5841D8]/50"
                  />
                  <button className="absolute right-1 top-1 w-8 h-8 bg-[#5841D8] rounded-full flex items-center justify-center text-white hover:bg-[#4935B8] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hospital Emergency Hub</h1>
          <p className="text-slate-500 mt-1">Monitor and respond to incoming active emergencies.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-red-50 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <AlertOctagon size={16} /> Active Emergencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-900">
                {callStatus === "incoming" ? "1" : "0"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Accepted Cases (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">14</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">42<span className="text-lg text-slate-500 ml-1">sec</span></div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Incoming Emergency Requests</h2>
      
      {/* If No Active SOS */}
      {callStatus === "idle" && (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <AlertOctagon size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No Active Emergencies</h3>
          <p className="text-slate-500">Awaiting rural SOS distress signals.</p>
        </div>
      )}

      {/* If Incoming SOS */}
      {callStatus === "incoming" && incomingSOS && (
        <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-red-500 animate-in slide-in-from-bottom-8 duration-300">
           
           {/* Header */}
           <div className="bg-red-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-ping">
                    <AlertOctagon size={24} className="text-white" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-black tracking-wider">CRITICAL INCOMING SOS</h1>
                    <p className="text-red-100 font-medium">Auto-Routed to Nearest Facility</p>
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

      {/* Recently Attended Patients (Hospital Side) */}
      <div className="mt-12">
        <Card className="shadow-sm border-t-4 border-t-blue-500">
           <CardHeader>
             <CardTitle className="flex items-center gap-2"><History className="text-blue-500" /> Recently Attended Patients</CardTitle>
             <CardDescription>Log of patients recently treated or admitted at Indira Gandhi Govt General Hospital, Pondicherry.</CardDescription>
           </CardHeader>
           <CardContent className="p-0">
             {medicalHistory.length === 0 ? (
               <div className="p-8 text-center text-slate-500 text-sm">No recent patients attended today.</div>
             ) : (
               <div className="divide-y divide-slate-100">
                  {medicalHistory.map((rec, i) => (
                     <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                        <div>
                           <p className="font-bold text-slate-900">{rec.chiefComplaint || "Consultation"}</p>
                           <p className="text-xs text-slate-500 mt-1">{new Date(rec.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {rec.actionTaken}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${rec.status === 'Admitted' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>
                           {rec.status}
                        </span>
                     </div>
                  ))}
               </div>
             )}
           </CardContent>
        </Card>
      </div>

    </div>
  )
}
