import { ArrowLeft, MapPin, Play, FileText, PhoneCall, AlertOctagon, Activity, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HospitalEmergencyRoom() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/hospital" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="text-red-600" />
            CRITICAL EMERGENCY #E-9902
          </h2>
          <p className="text-sm text-slate-500 font-medium">Dispatched 3 mins ago</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" className="border-slate-300 text-slate-700 font-bold">
            <Share2 className="w-4 h-4 mr-2" /> Share Case
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 font-bold text-white shadow-md shadow-red-200">
            <PhoneCall className="w-4 h-4 mr-2" /> Call Dispatch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Intel & Map */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* AI Intel Panel */}
          <div className="bg-white rounded-3xl p-8 border-2 border-red-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10"></div>
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Activity className="text-red-500" /> AI Emergency Assessment
             </h3>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-lg leading-relaxed text-slate-800 font-medium">
               "Patient exhibits clear signs of a potential myocardial infarction (heart attack). Reported symptoms include severe crushing chest pain radiating to the left arm, acute shortness of breath, and nausea. Given the patient's pre-existing condition of hypertension, immediate medical intervention is required."
             </div>

             <div className="mt-6 flex items-center gap-4 bg-white border p-4 rounded-xl shadow-sm w-fit">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors">
                  <Play size={20} className="ml-1" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900">Original Voice Note</span>
                  <span className="text-sm text-slate-500 font-medium">Recorded by patient • 0:12s</span>
                </div>
             </div>
          </div>

          {/* Map Location Placeholder */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1 min-h-[400px] flex flex-col">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
               <MapPin className="text-indigo-500" /> Patient Location
             </h3>
             <div className="flex-1 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse mb-2">
                     <MapPin size={32} className="text-red-600" />
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-lg font-bold text-slate-800">
                    452 W 8th St, Downtown
                  </div>
                  <div className="mt-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    ETA: 4 Mins
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Timeline & Patient Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
             <h3 className="font-bold mb-6 flex items-center gap-2 text-xl"><FileText className="text-teal-400" /> Patient File</h3>
             
             <div className="space-y-6">
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">Identity</div>
                  <div className="text-2xl font-bold">John Doe</div>
                  <div className="font-medium text-slate-300">45 yrs • Male</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-2xl">
                     <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Blood Type</div>
                     <div className="text-red-400 font-black text-xl">O+</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-2xl">
                     <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Allergies</div>
                     <div className="text-white font-bold">Penicillin</div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pre-existing</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">Hypertension</span>
                    <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">Type 2 Diabetes</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Emergency Contact</div>
                  <div className="bg-slate-800 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="font-bold">Jane Doe (Wife)</div>
                      <div className="text-slate-400 text-sm">555-0192</div>
                    </div>
                    <Button size="icon" className="bg-slate-700 hover:bg-slate-600 rounded-full h-10 w-10">
                      <PhoneCall size={16} />
                    </Button>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Emergency Timeline</h3>
             
             <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                
                <div className="relative">
                  <div className="absolute -left-[25px] w-12 h-12 bg-white rounded-full flex items-center justify-center top-0">
                    <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                  </div>
                  <div className="ml-10 pt-1">
                     <div className="font-bold text-slate-900">Patient Triggered Alert</div>
                     <div className="text-sm font-medium text-slate-500">10:42 AM</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[25px] w-12 h-12 bg-white rounded-full flex items-center justify-center top-0">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_0_4px_#e0e7ff]"></div>
                  </div>
                  <div className="ml-10 pt-1">
                     <div className="font-bold text-slate-900">AI Assessment Complete</div>
                     <div className="text-sm font-medium text-slate-500">10:42 AM (12s later)</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[25px] w-12 h-12 bg-white rounded-full flex items-center justify-center top-0">
                    <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_0_4px_#fee2e2] animate-pulse"></div>
                  </div>
                  <div className="ml-10 pt-1">
                     <div className="font-bold text-red-600">Hospital Accepted</div>
                     <div className="text-sm font-medium text-slate-500">10:43 AM • Paramedics dispatched</div>
                  </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
