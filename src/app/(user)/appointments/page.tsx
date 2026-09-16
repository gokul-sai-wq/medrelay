"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarClock, MapPin, Users, CheckCircle2, X, ShieldCheck, Calendar, Clock, Building2, Stethoscope, AlertCircle } from "lucide-react"
import { 
  getAppointmentRequests, 
  addAppointmentRequest, 
  AppointmentRequest 
} from "@/lib/store"

type Slot = {
  id: string
  facility: string
  distanceKm: number
  doctor: string
  time: string
  queueAhead: number
  freeOfCost: boolean
}

const SLOTS: Slot[] = [
  { id: "s1", facility: "Sub-Centre PHC, Villianur, Pondicherry", distanceKm: 2.1, doctor: "ANM Kavita Sharma", time: "Today · 3:30 PM", queueAhead: 2, freeOfCost: true },
  { id: "s2", facility: "Primary Health Centre, Bahour, Pondicherry", distanceKm: 6.4, doctor: "Dr. Michael Chen (General)", time: "Today · 5:00 PM", queueAhead: 5, freeOfCost: true },
  { id: "s3", facility: "Indira Gandhi Govt Hospital Teleconsult Hub, Pondicherry", distanceKm: 12.0, doctor: "Dr. Sarah Jenkins (Cardiology)", time: "Tomorrow · 10:00 AM", queueAhead: 1, freeOfCost: false },
  { id: "s4", facility: "Sub-Centre PHC, Villianur, Pondicherry", distanceKm: 2.1, doctor: "ANM Kavita Sharma", time: "Tomorrow · 9:00 AM", queueAhead: 0, freeOfCost: true },
]

export default function AppointmentsPage() {
  const [queue, setQueue] = useState<any[]>([])
  const [myAppointments, setMyAppointments] = useState<any[]>([])
  const [customRequests, setCustomRequests] = useState<AppointmentRequest[]>([])

  // Form State for custom appointment request
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [reqFacility, setReqFacility] = useState("Indira Gandhi Govt General Hospital, Pondicherry")
  const [reqDate, setReqDate] = useState(() => {
     const tomorrow = new Date()
     tomorrow.setDate(tomorrow.getDate() + 1)
     return tomorrow.toISOString().split("T")[0]
  })
  const [reqWindow, setReqWindow] = useState("Morning (9:00 AM - 12:00 PM)")
  const [reqDept, setReqDept] = useState("General OPD")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    // Seed initial request if empty for demo
    let reqs = getAppointmentRequests()
    if (reqs.length === 0) {
       const initial: AppointmentRequest = {
          id: "REQ-101",
          patientName: "Demo User",
          facility: "Indira Gandhi Govt General Hospital, Pondicherry",
          requestedDate: new Date().toISOString().split("T")[0],
          preferredWindow: "Morning (9:00 AM - 12:00 PM)",
          department: "Cardiology OPD",
          status: "confirmed",
          confirmedTime: "10:30 AM",
          facilityNote: "Report to Cardiology Desk #2 on 1st Floor.",
          createdAt: new Date().toLocaleString()
       }
       addAppointmentRequest(initial)
       reqs = [initial]
    }

    const fetchState = () => {
      const q = JSON.parse(window.localStorage.getItem("medrelay.live_queue") || "[]")
      setQueue(q)
      
      const mine = q.filter((item: any) => item.patientName === "Demo User")
      setMyAppointments(mine)

      // Fetch custom requests for Demo User
      const allReqs = getAppointmentRequests()
      setCustomRequests(allReqs.filter(r => r.patientName === "Demo User"))
    }

    fetchState()
    const interval = setInterval(fetchState, 1500)
    return () => clearInterval(interval)
  }, [])

  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reqDate) return

    const newReq: AppointmentRequest = {
       id: "REQ-" + Math.floor(1000 + Math.random() * 9000),
       patientName: "Demo User",
       facility: reqFacility,
       requestedDate: reqDate,
       preferredWindow: reqWindow,
       department: reqDept,
       status: "pending",
       createdAt: new Date().toLocaleString()
    }

    addAppointmentRequest(newReq)
    setCustomRequests(prev => [newReq, ...prev])
    setShowRequestForm(false)
    setSuccessMessage(`Appointment request for ${reqDate} sent to ${reqFacility}!`)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const book = (slot: Slot) => {
    const q = JSON.parse(window.localStorage.getItem("medrelay.live_queue") || "[]")
    if (q.some((b: any) => b.facility === slot.facility && b.patientName === "Demo User" && b.status === "waiting")) return
    
    q.push({
      id: "Q-" + Math.floor(Math.random() * 10000),
      facility: slot.facility,
      patientName: "Demo User",
      time: "Today · " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: "waiting",
      date: new Date().toLocaleDateString()
    })
    
    window.localStorage.setItem("medrelay.live_queue", JSON.stringify(q))
    setQueue(q)
    setMyAppointments(q.filter((item: any) => item.patientName === "Demo User"))
  }

  const cancel = (id: string) => {
    const q = queue.filter(b => b.id !== id)
    window.localStorage.setItem("medrelay.live_queue", JSON.stringify(q))
    setQueue(q)
    setMyAppointments(q.filter((item: any) => item.patientName === "Demo User"))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Appointments & Queue</h1>
           <p className="text-slate-500 mt-1">Book OPD slots, request appointments for specific dates, and view live queue position.</p>
        </div>
        <Button 
           onClick={() => setShowRequestForm(prev => !prev)}
           className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-6 rounded-xl shadow-lg shadow-indigo-600/20"
        >
           <Calendar className="w-5 h-5 mr-2" /> Request Appointment for Specific Day
        </Button>
      </div>

      {/* Success Banner */}
      {successMessage && (
         <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
               <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
               <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)}><X size={16} className="text-emerald-500" /></button>
         </div>
      )}

      {/* CUSTOM DATE APPOINTMENT FORM */}
      {showRequestForm && (
         <Card className="shadow-lg border-2 border-indigo-500/20 bg-slate-50/50 animate-in slide-in-from-top-4">
            <CardHeader className="bg-white border-b border-slate-100">
               <CardTitle className="text-xl flex items-center gap-2 text-indigo-900">
                  <CalendarClock className="text-indigo-600" size={22} /> Request Appointment for a Specific Day
               </CardTitle>
               <CardDescription>
                  Select your preferred date, facility, and time window. The hospital or PHC staff will review and confirm your visit time.
               </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white">
               <form onSubmit={handleCustomRequestSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                           <Building2 size={14} className="text-indigo-600" /> Target Hospital / PHC
                        </Label>
                        <select
                           value={reqFacility}
                           onChange={e => setReqFacility(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                           <option value="Indira Gandhi Govt General Hospital, Pondicherry">Indira Gandhi Govt General Hospital, Pondicherry</option>
                           <option value="Villianur PHC, Pondicherry">Villianur Primary Health Centre (PHC), Pondicherry</option>
                           <option value="Villianur Sub-Centre PHC, Pondicherry">Villianur Sub-Centre PHC, Pondicherry</option>
                        </select>
                     </div>

                     <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                           <Stethoscope size={14} className="text-indigo-600" /> Specialty / Department
                        </Label>
                        <select
                           value={reqDept}
                           onChange={e => setReqDept(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                           <option value="General OPD">General Medicine / OPD</option>
                           <option value="Cardiology OPD">Cardiology / Heart Checkup</option>
                           <option value="Pediatrics OPD">Pediatrics (Child Health)</option>
                           <option value="Orthopedics OPD">Orthopedics / Bone & Joint</option>
                           <option value="Maternal & Antenatal">Maternal & Antenatal Care</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                           <Calendar size={14} className="text-indigo-600" /> Requested Appointment Date
                        </Label>
                        <Input 
                           type="date"
                           required
                           min={new Date().toISOString().split("T")[0]}
                           value={reqDate}
                           onChange={e => setReqDate(e.target.value)}
                           className="bg-slate-50 border-slate-200 p-3 rounded-xl font-semibold"
                        />
                     </div>

                     <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                           <Clock size={14} className="text-indigo-600" /> Preferred Time Window
                        </Label>
                        <select
                           value={reqWindow}
                           onChange={e => setReqWindow(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                           <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                           <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                           <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                        </select>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                     <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowRequestForm(false)}
                        className="px-6 py-5 rounded-xl font-bold"
                     >
                        Cancel
                     </Button>
                     <Button 
                        type="submit" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-5 rounded-xl shadow-md shadow-indigo-600/20"
                     >
                        Submit Appointment Request
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      )}

      {/* CUSTOM DATE REQUESTS STATUS LIST */}
      {customRequests.length > 0 && (
         <Card className="shadow-sm border-indigo-200 bg-indigo-50/30">
            <CardHeader className="pb-3">
               <CardTitle className="flex items-center gap-2 text-indigo-950 text-lg">
                  <CalendarClock size={20} className="text-indigo-600" /> Requested Day Appointments & Schedule Status
               </CardTitle>
               <CardDescription>
                  Track confirmation and assigned visit time slots set by Hospital/PHC staff.
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {customRequests.map(req => {
                  const isConfirmed = req.status === "confirmed" || req.status === "rescheduled"
                  return (
                     <div key={req.id} className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                           <div>
                              <div className="flex items-center gap-2">
                                 <span className="font-extrabold text-slate-900 text-base">{req.facility}</span>
                                 <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                                    {req.department}
                                 </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 font-medium">
                                 <Calendar size={14} className="text-slate-400" /> 
                                 Requested Date: <strong className="text-slate-800">{new Date(req.requestedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                 <span className="text-slate-400">•</span>
                                 <span>{req.preferredWindow}</span>
                              </p>
                           </div>

                           <div>
                              {req.status === "pending" && (
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                                    <Clock size={14} className="animate-spin text-amber-600" /> Awaiting Staff Confirmation
                                 </span>
                              )}

                              {isConfirmed && (
                                 <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                                    <CheckCircle2 size={16} className="text-emerald-600" /> Schedule Confirmed
                                 </span>
                              )}

                              {req.status === "declined" && (
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                                    <AlertCircle size={14} className="text-rose-600" /> Declined / Full
                                 </span>
                              )}
                           </div>
                        </div>

                        {/* Confirmed Slot Details Banner */}
                        {isConfirmed && (
                           <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-sm text-emerald-900 space-y-1">
                              <p className="font-bold flex items-center gap-2">
                                 <Clock size={16} className="text-emerald-600" /> 
                                 Assigned Visit Time: <span className="text-base font-black text-emerald-950 underline decoration-emerald-400 underline-offset-2">{req.confirmedTime || "10:30 AM"}</span>
                              </p>
                              {req.facilityNote && (
                                 <p className="text-xs text-emerald-800">
                                    <strong>Staff Note:</strong> {req.facilityNote}
                                 </p>
                              )}
                           </div>
                        )}
                     </div>
                  )
               })}
            </CardContent>
         </Card>
      )}

      {/* TODAY'S LIVE QUEUE APPOINTMENTS */}
      {myAppointments.length > 0 && (
        <Card className="shadow-sm border-teal-200 bg-teal-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-800"><CheckCircle2 size={20}/> Live OPD Queue Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myAppointments.map(b => {
              // Calculate queue position dynamically
              const facilityQueue = queue.filter(q => q.facility === b.facility && q.status === "waiting")
              const myIndex = facilityQueue.findIndex(q => q.id === b.id)
              const queueAhead = myIndex > 0 ? myIndex : 0

              return (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-4 border border-teal-100">
                  <div>
                    <p className="font-bold text-slate-900">{b.facility}</p>
                    <p className="text-sm text-slate-500">Scheduled: {b.time}</p>
                    
                    {b.status === "waiting" ? (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <p className="text-sm text-teal-700 font-bold">
                          {queueAhead === 0 ? "You're next in queue! Proceed to doctor." : `${queueAhead} patient${queueAhead > 1 ? "s" : ""} ahead of you`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={16}/> Consultation Completed</p>
                    )}
                  </div>
                  {b.status === "waiting" && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => cancel(b.id)}>
                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* AVAILABLE WALK-IN / TELECONSULT SLOTS */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Available Walk-in & Teleconsult Slots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SLOTS.map(slot => {
            const isBooked = myAppointments.some(b => b.facility === slot.facility && b.status === "waiting")
            const currentQueue = queue.filter(q => q.facility === slot.facility && q.status === "waiting").length

            return (
              <Card key={slot.id} className="shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                     <div>
                        <p className="font-semibold text-slate-900">{slot.doctor}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14}/> {slot.facility} · {slot.distanceKm} km</p>
                     </div>
                     {slot.freeOfCost && (
                        <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck size={12}/> Govt. scheme (free)
                        </span>
                      )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><CalendarClock size={14}/> {slot.time}</span>
                    <span className="flex items-center gap-1"><Users size={14}/> {currentQueue} currently waiting</span>
                  </div>
                  <Button
                    disabled={isBooked}
                    onClick={() => book(slot)}
                    className={isBooked ? "w-full bg-slate-200 text-slate-500" : "w-full bg-slate-900 hover:bg-slate-800"}
                  >
                    {isBooked ? "Booked" : "Book this slot"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
