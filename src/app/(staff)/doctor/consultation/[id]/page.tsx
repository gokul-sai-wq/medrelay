"use client"
import { useState } from "react"
import { ArrowLeft, Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Send, FileText, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DoctorConsultationRoom() {
  const [videoOn, setVideoOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [chatMessage, setChatMessage] = useState("")

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/doctor" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Patient Consultation Room</h2>
            <p className="text-sm text-slate-500">Session ID: #1024-5</p>
          </div>
          <div className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            ● Live
          </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-end p-6 border-4 border-slate-800 shadow-xl">
          {/* Mock Video Feed Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-center text-slate-500 space-y-4">
               <UserPlaceholder size={80} className="mx-auto opacity-50" />
               <p className="font-medium text-lg">Patient Video Feed Connected</p>
             </div>
          </div>
          
          {/* Doctor pip */}
          <div className="absolute top-6 right-6 w-48 h-32 bg-slate-800 rounded-xl border-2 border-slate-600 overflow-hidden">
             <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-400">
               <span className="text-sm font-medium">You</span>
             </div>
          </div>

          {/* Controls */}
          <div className="relative z-10 flex items-center justify-center gap-4 mx-auto bg-slate-900/80 backdrop-blur px-8 py-4 rounded-full border border-slate-700">
             <button 
                onClick={() => setMicOn(!micOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
             >
               {micOn ? <Mic size={20} /> : <MicOff size={20} />}
             </button>
             <button 
                onClick={() => setVideoOn(!videoOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${videoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
             >
               {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
             </button>
             <button className="w-16 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors">
               <PhoneOff size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* Sidebar: Chat & Patient Info */}
      <div className="w-96 flex flex-col gap-4">
        
        {/* Patient Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-indigo-600" /> Patient Medical Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-900">John Doe</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Age / Gender</span>
              <span className="font-medium text-slate-900">45 / Male</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Blood Type</span>
              <span className="font-medium text-slate-900 text-red-600">O+</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Reported Symptoms</span>
              <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium mr-1">Headache</span>
              <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium mr-1">Fever</span>
              <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">Fatigue</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Pre-existing Conditions</span>
              <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium mr-1">Asthma</span>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
             <MessageSquare size={18} className="text-slate-500" />
             <h3 className="font-bold text-slate-900">Live Text Chat</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-4">
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">JD</div>
               <div className="bg-white border rounded-xl p-3 text-sm text-slate-700 shadow-sm">
                 Hello doctor, I've been feeling these symptoms for the past 2 days.
               </div>
             </div>
             <div className="flex gap-3 flex-row-reverse">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-indigo-700">Dr</div>
               <div className="bg-indigo-600 text-white rounded-xl p-3 text-sm shadow-sm">
                 I see. Can you tell me if your asthma is flaring up?
               </div>
             </div>
          </div>

          <div className="p-4 border-t bg-white">
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setChatMessage(""); }}>
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

function UserPlaceholder(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
