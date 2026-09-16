"use client"

import { useState, useEffect } from "react"
import { 
  AlertOctagon, Volume2, MapPin, Phone, CheckCircle2, HeartHandshake, 
  Activity, Trophy, Bell, Clock, RefreshCw, Send, Check, ShieldAlert, Sparkles, AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ASHAWorkerPortalPage() {
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([])
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([])
  const [points, setPoints] = useState(2450)

  // Listen to live emergency alerts from localStorage
  useEffect(() => {
    const fetchEmergencies = () => {
      let liveEmergencies: any[] = []
      try {
        const raw = JSON.parse(localStorage.getItem("emergency_dispatch") || "null")
        if (Array.isArray(raw)) {
          liveEmergencies = raw
        } else if (raw && typeof raw === "object") {
          liveEmergencies = [raw]
        }
      } catch (e) {
        liveEmergencies = []
      }
      
      // Default Pondicherry SOS emergency alerts if empty
      const demoAlerts = [
        {
          id: "EMG-PY-901",
          patientName: "Meenakshi Ammal",
          phone: "+91 98421 11204",
          location: "Villianur Main Road, Ward 3, Pondicherry",
          reason: "Severe shortness of breath & chest tightness (High-risk emergency)",
          time: "4 mins ago",
          network: "4G",
          status: "Dual Dispatch Active (108 Ambulance + Villianur PHC)",
          voiceNote: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
          audioTranscript: "Ayyo doctor... I am having severe chest tightness near Villianur bus stand. Please help fast."
        },
        {
          id: "EMG-PY-882",
          patientName: "Karthik R.",
          phone: "+91 94432 88910",
          location: "Bahour East Sector, Pondicherry",
          reason: "High fever (103°F) with severe shivering & dehydration",
          time: "18 mins ago",
          network: "2G",
          status: "PHC First Responder En Route",
          voiceNote: null,
          audioTranscript: "High fever for 3 days with intense chills. Unable to walk."
        },
        {
          id: "EMG-PY-764",
          patientName: "Sita Swaminathan",
          phone: "+91 97890 33412",
          location: "Muthialpet Ward 4, Pondicherry",
          reason: "Acute Dengue fever symptoms — rapid pulse & severe joint pain",
          time: "32 mins ago",
          network: "4G",
          status: "108 Ambulance Dispatched",
          voiceNote: null,
          audioTranscript: "High dengue fever with severe weakness in Ward 4."
        }
      ]

      const combined = [...liveEmergencies, ...demoAlerts]
      setEmergencyAlerts(combined)
    }

    fetchEmergencies()
    const interval = setInterval(fetchEmergencies, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleAcknowledgeAlert = (id: string) => {
    setAcknowledgedIds(prev => [...prev, id])
    setPoints(prev => prev + 50)
  }

  const handlePlayVoiceNote = (alertId: string) => {
    setPlayingAudio(alertId)
    setTimeout(() => setPlayingAudio(null), 4000)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertOctagon size={14} className="text-red-600 animate-pulse" /> Live Emergency SOS Hub — Puducherry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">ASHA Worker Emergency SOS Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Village Emergency Distress Requests & First Responder Dispatch (SOS Requests Only)</p>
        </div>

        {/* Swasthya Leaderboard Standing */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-[10px] text-yellow-800 font-bold uppercase">ASHA Standing</div>
            <div className="text-sm font-black text-slate-900">#1 Sunita Devi ({points} pts)</div>
          </div>
        </div>
      </div>

      {/* EMERGENCY SOS DISPATCH INBOX — EXCLUSIVELY EMERGENCY REQUESTS */}
      <Card className="shadow-lg border-2 border-red-300 bg-white overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-5 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              <AlertOctagon className="animate-ping" size={24} />
              Active Village SOS Emergency Requests Inbox
            </CardTitle>
            <CardDescription className="text-red-100 text-xs mt-1">
              Real-time emergency distress requests from citizens in your assigned Puducherry sector.
            </CardDescription>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-white flex items-center gap-2 border border-white/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {emergencyAlerts.length} Active Distress Calls
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {emergencyAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 size={40} className="text-teal-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Active SOS Emergency Alerts</h3>
              <p className="text-xs text-slate-500">Your assigned Puducherry sector is currently stable. Listening for incoming distress signals...</p>
            </div>
          ) : (
            emergencyAlerts.map((alert, index) => {
              const isAck = acknowledgedIds.includes(alert.id)
              return (
                <div 
                  key={`alert-${alert.id || 'emg'}-${index}`}
                  className={`p-5 rounded-2xl border transition-all ${
                    isAck 
                      ? "bg-slate-50/80 border-slate-200" 
                      : "bg-white border-red-300 shadow-md ring-1 ring-red-100 hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-lg border border-red-200">
                          {alert.id}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-lg">{alert.patientName}</h3>
                        <span className="text-xs text-slate-500 font-semibold">• {alert.time}</span>
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          Network: {alert.network || "4G"}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <AlertOctagon size={18} className="text-red-600 shrink-0" /> {alert.reason}
                      </p>

                      <div className="flex items-center gap-5 text-xs text-slate-600 flex-wrap pt-1">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <MapPin size={14} className="text-teal-600" /> {alert.location}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                          <Phone size={14} /> {alert.phone}
                        </span>
                      </div>

                      {/* Citizen Audio Voice Note Player */}
                      {alert.audioTranscript && (
                        <div className="mt-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Button 
                              onClick={() => handlePlayVoiceNote(alert.id)}
                              size="sm" 
                              className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 shadow-xs"
                            >
                              {playingAudio === alert.id ? (
                                <span className="flex items-center gap-1.5"><RefreshCw size={14} className="animate-spin" /> Playing Audio...</span>
                              ) : (
                                <span className="flex items-center gap-1.5"><Volume2 size={16} /> Play Voice Note</span>
                              )}
                            </Button>
                            <span className="text-xs text-amber-950 font-medium italic">"{alert.audioTranscript}"</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                      {isAck ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                          <CheckCircle2 size={16} /> First Response Acknowledged
                        </span>
                      ) : (
                        <Button 
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md flex items-center justify-center gap-2"
                        >
                          <Check size={16} /> Acknowledge First Response
                        </Button>
                      )}

                      <a href={`tel:${alert.phone}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-300 hover:bg-slate-50 py-2.5">
                          <Phone size={14} className="mr-1.5 text-indigo-600" /> Call Patient
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

    </div>
  )
}
