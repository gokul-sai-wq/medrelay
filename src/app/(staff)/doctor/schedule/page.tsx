import { Calendar as CalendarIcon, Clock, Video, Phone, CheckCircle2, ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DoctorSchedule() {
  const schedule = [
    { time: "09:00 AM", type: "Video Consult", patient: "Emma Watson", duration: "30 min", status: "Completed", isCurrent: false },
    { time: "10:30 AM", type: "Audio Call", patient: "John Doe", duration: "15 min", status: "Upcoming", isCurrent: true },
    { time: "11:00 AM", type: "Video Consult", patient: "Liam Neeson", duration: "45 min", status: "Upcoming", isCurrent: false },
    { time: "01:00 PM", type: "Follow-up", patient: "Alice Freeman", duration: "15 min", status: "Upcoming", isCurrent: false },
    { time: "03:30 PM", type: "Video Consult", patient: "David Chen", duration: "30 min", status: "Upcoming", isCurrent: false },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Schedule</h2>
          <p className="text-slate-500">Manage your daily appointments and working hours.</p>
        </div>
        <Button variant="outline" className="text-slate-600 border-slate-300">
          <Settings className="w-4 h-4 mr-2" /> Working Hours
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Calendar UI (Mock) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-slate-50 border-b rounded-t-xl py-4 flex flex-row items-center justify-between space-y-0">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><CalendarIcon size={18} className="text-indigo-600"/> September 2026</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><ChevronLeft size={16} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><ChevronRight size={16} /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
               {/* Mini Calendar Mock */}
               <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-2">
                 <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
               </div>
               <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
                 {/* Empty days */}
                 <div className="p-2 text-slate-300">30</div>
                 <div className="p-2 text-slate-300">31</div>
                 
                 {/* Active days */}
                 {[1,2,3,4,5,6].map(d => (
                   <div key={d} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-700">{d}</div>
                 ))}
                 
                 {/* Today */}
                 <div className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer shadow-md shadow-indigo-200">7</div>
                 
                 {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(d => (
                   <div key={d} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-700">{d}</div>
                 ))}
               </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Availability Status</h3>
              <p className="text-indigo-100 text-sm mb-6">You are currently visible to patients and accepting live consultation requests.</p>
              <div className="flex gap-3">
                <Button className="flex-1 bg-white text-indigo-700 hover:bg-slate-100 hover:text-indigo-800 font-bold">Online</Button>
                <Button variant="outline" className="flex-1 border-indigo-400 text-indigo-100 hover:bg-indigo-700 hover:text-white">Busy</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm min-h-full">
            <CardHeader className="bg-slate-50 border-b rounded-t-xl">
              <CardTitle className="text-slate-900 text-lg flex items-center justify-between">
                <span>Today's Appointments</span>
                <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border">5 Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                
                {schedule.map((slot, i) => (
                  <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                    
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                      slot.status === 'Completed' ? 'bg-green-500 text-white' :
                      slot.isCurrent ? 'bg-indigo-600 text-white animate-pulse' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {slot.status === 'Completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>

                    {/* Card */}
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${
                      slot.isCurrent ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${slot.isCurrent ? 'text-indigo-700' : 'text-slate-900'}`}>{slot.time}</span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{slot.duration}</span>
                      </div>
                      <div className="font-bold text-lg text-slate-800 mb-2">{slot.patient}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        {slot.type.includes('Video') ? <Video size={14} className="text-indigo-500"/> : <Phone size={14} className="text-teal-500"/>}
                        {slot.type}
                      </div>
                      
                      {slot.isCurrent && (
                        <div className="mt-4">
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 shadow-md">Join Call</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
