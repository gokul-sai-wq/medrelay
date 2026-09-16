"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Video, Phone, Mic, MicOff, VideoOff, PhoneOff, FileText, Activity, AlertTriangle, Paperclip, FlaskConical, X } from "lucide-react"

export default function DoctorConsultationRoom() {
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isPatientVideoOff, setIsPatientVideoOff] = useState(false)
  const [patientName, setPatientName] = useState("Patient")
  const [showDiagModal, setShowDiagModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const pipVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const reqStr = localStorage.getItem("teleconsultation_request")
    if (reqStr) {
      setPatientName(JSON.parse(reqStr).patient || "Patient")
    }

    startVideo()

    const interval = setInterval(() => {
      const patVid = localStorage.getItem("user_tele_video")
      setIsPatientVideoOff(patVid === "off")

      if (!localStorage.getItem("teleconsultation_status")) {
        // Patient ended call
        endCall()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      if (pipVideoRef.current) pipVideoRef.current.srcObject = stream
      setIsMuted(false)
      setIsVideoOff(false)
      localStorage.setItem("doctor_tele_video", "on")
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
      localStorage.setItem("doctor_tele_video", newState ? "off" : "on")
    }
  }

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    localStorage.removeItem("teleconsultation_request")
    localStorage.removeItem("teleconsultation_status")
    router.push("/doctor")
  }

  const handlePrescribeDiagnostic = () => {
    if (!selectedTest) return
    const pending = JSON.parse(localStorage.getItem("medrelay.pending_diagnostics") || "[]")
    pending.push({
      id: "REQ-" + Math.floor(Math.random() * 10000),
      testName: selectedTest,
      source: "Doctor",
      date: new Date().toLocaleString(),
    })
    localStorage.setItem("medrelay.pending_diagnostics", JSON.stringify(pending))
    setShowDiagModal(false)
    setSelectedTest("")
    alert("Diagnostic request sent to patient.")
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col max-w-[1400px] mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Live Consultation: {patientName}</h1>
          <p className="text-slate-500 text-sm">Secure WebRTC Connection • Recording Disabled</p>
        </div>
      </div>

      {showDiagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900">Prescribe Diagnostics</h2>
                 <button onClick={() => setShowDiagModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Select Diagnostic Test</label>
                 <select 
                   className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   value={selectedTest}
                   onChange={e => setSelectedTest(e.target.value)}
                 >
                   <option value="">-- Choose Test --</option>
                   <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                   <option value="Chest X-Ray">Chest X-Ray</option>
                   <option value="Lipid Profile">Lipid Profile</option>
                   <option value="HbA1c (Diabetes)">HbA1c (Diabetes)</option>
                 </select>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setShowDiagModal(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                 <button onClick={handlePrescribeDiagnostic} className="px-4 py-2 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Send Request to Patient</button>
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0">
        
        {/* Left: Video Feed */}
        <div className="flex-[2] bg-slate-950 rounded-2xl relative overflow-hidden flex flex-col shadow-lg border border-slate-800">
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover absolute inset-0 z-0 ${isPatientVideoOff ? 'hidden' : ''}`}
          />
          
          {isPatientVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-0">
                 <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
                    <span className="text-4xl text-slate-500 font-bold">{patientName.charAt(0)}</span>
                 </div>
                 <p className="text-slate-400 mt-4 font-medium">{patientName}'s Video is Off</p>
              </div>
          )}

          {/* PIP Doctor Window */}
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
             <span className="text-white text-xs font-bold absolute bottom-2 left-2 z-10 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">Dr. (You)</span>
          </div>

          {/* Floating Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-full border border-slate-700 shadow-2xl z-20">
            <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/20 transition-all hover:scale-105">
              <PhoneOff size={24} />
            </button>
          </div>
        </div>

        {/* Right: Medical Profile Sidebar */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1 overflow-auto">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
               <FileText size={16} className="text-indigo-600" /> Patient Chart
            </h2>
            
            <div className="space-y-6">
               <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">CHIEF COMPLAINT</div>
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-sm text-red-900 font-medium">
                     <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                     Persistent migraine, high fever, fatigue for 3 days.
                  </div>
               </div>

               <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">VITAL SIGNS (Self-Reported)</div>
                  <div className="grid grid-cols-2 gap-2">
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 font-medium">Temperature</div>
                        <div className="text-lg font-bold text-slate-900">101.2°F</div>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 font-medium">SpO2</div>
                        <div className="text-lg font-bold text-slate-900">98%</div>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 font-medium">Heart Rate</div>
                        <div className="text-lg font-bold text-slate-900">88 bpm</div>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 font-medium">Blood Pressure</div>
                        <div className="text-lg font-bold text-slate-900">120/80</div>
                     </div>
                  </div>
               </div>

               <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">MEDICAL HISTORY</div>
                  <div className="flex flex-wrap gap-2">
                     <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">Asthma (Mild)</span>
                     <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">No known allergies</span>
                  </div>
               </div>

               <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">ATTACHMENTS</div>
                  <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                     <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Paperclip size={14} />
                     </div>
                     <div>
                        <div className="text-sm font-semibold text-slate-900">Past_Prescription.pdf</div>
                        <div className="text-xs text-slate-500">Added 2 months ago</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 bg-indigo-600 text-white p-4 rounded-xl shadow-md cursor-pointer hover:bg-indigo-700 transition-colors flex items-center justify-between">
               <div className="font-semibold text-sm">E-Prescription</div>
               <Activity size={18} />
            </div>
            <div onClick={() => setShowDiagModal(true)} className="flex-1 bg-teal-600 text-white p-4 rounded-xl shadow-md cursor-pointer hover:bg-teal-700 transition-colors flex items-center justify-between">
               <div className="font-semibold text-sm">Order Diagnostics</div>
               <FlaskConical size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
