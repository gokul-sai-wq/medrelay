"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Video, Phone, MessageSquare, Clock, ShieldCheck, FileText, CheckCircle2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DoctorConsultationPage() {
  const router = useRouter()
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const doctors = [
    {
      name: "Dr. Sarah Jenkins",
      specialty: "Cardiologist",
      experience: "12 Years Exp.",
      rating: 4.9,
      fee: "Covered under govt. health scheme",
      freeOfCost: true,
      available: "Available Now",
      image: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      specialty: "General Physician",
      experience: "8 Years Exp.",
      rating: 4.8,
      fee: "Covered under govt. health scheme",
      freeOfCost: true,
      available: "In 30 mins",
      image: "MC"
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Neurologist",
      experience: "15 Years Exp.",
      rating: 5.0,
      fee: "₹150 (out-of-scheme specialist)",
      freeOfCost: false,
      available: "Tomorrow",
      image: "ER"
    }
  ]

  const mockReports = [
    { id: "r1", name: "Complete Blood Count (CBC)", date: "Sep 10, 2026" },
    { id: "r2", name: "Chest X-Ray", date: "Aug 22, 2026" },
    { id: "r3", name: "Past Prescription (Dr. Sharma)", date: "Jul 05, 2026" }
  ]

  const handleStartConsultation = (doctorName: string) => {
    setSelectedDoctor(doctorName)
    setSelectedReports([]) // Reset selection
  }

  const confirmConsultation = () => {
    if (!selectedDoctor) return
    
    localStorage.setItem("teleconsultation_request", JSON.stringify({
      doctor: selectedDoctor,
      patient: "John Doe",
      sharedReports: selectedReports,
      time: new Date().toISOString()
    }))
    router.push("/consultation/room")
  }

  const toggleReport = (id: string) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* Report Selection Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">Share Medical Records</h2>
                    <p className="text-sm text-slate-500 mt-1">Select reports to share with {selectedDoctor}</p>
                 </div>
                 <button onClick={() => setSelectedDoctor(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 space-y-3 bg-slate-50/50">
                 {mockReports.map(report => {
                    const isSelected = selectedReports.includes(report.id)
                    return (
                      <div 
                        key={report.id}
                        onClick={() => toggleReport(report.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-transparent border border-slate-300'}`}>
                            <CheckCircle2 size={16} />
                         </div>
                         <div className="flex-1">
                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                               <FileText size={14} className="text-slate-400" />
                               {report.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{report.date}</div>
                         </div>
                      </div>
                    )
                 })}
              </div>
              <div className="p-6 border-t border-slate-100 bg-white">
                 <Button onClick={confirmConsultation} className="w-full bg-teal-600 hover:bg-teal-700 py-6 text-base font-bold shadow-lg shadow-teal-600/20">
                   Start Video Call
                 </Button>
                 <p className="text-center text-xs text-slate-400 mt-4">
                   These records will be securely shared during the live session.
                 </p>
              </div>
           </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Consult a Doctor</h1>
        <p className="text-slate-500 mt-1">Connect with specialized healthcare professionals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc, idx) => (
          <Card key={idx} className="hover:border-teal-500 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold">
                  {doc.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{doc.name}</h3>
                  <p className="text-teal-600 font-medium text-sm">{doc.specialty}</p>
                  <p className="text-slate-500 text-sm mt-1">{doc.experience}</p>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{doc.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  {doc.available}
                </div>
                <div className={`text-xs font-semibold text-right max-w-[140px] ${doc.freeOfCost ? "text-emerald-700" : "text-slate-500"}`}>
                  {doc.freeOfCost && <ShieldCheck className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                  {doc.fee}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 gap-2 grid grid-cols-3">
              <Button variant="outline" className="w-full text-slate-600 hover:text-teal-600 hover:bg-teal-50" title="Text Consultation">
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full text-slate-600 hover:text-teal-600 hover:bg-teal-50" title="Audio Consultation">
                <Phone className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => handleStartConsultation(doc.name)}
                className="w-full bg-teal-600 hover:bg-teal-700" 
                title="Video Consultation"
              >
                <Video className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
