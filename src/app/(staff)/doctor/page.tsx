"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Phone, MessageSquare, Check, X, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function DoctorPortalPage() {
  const [incomingRequest, setIncomingRequest] = useState<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const payloadStr = localStorage.getItem("teleconsultation_request")
      if (payloadStr) {
        setIncomingRequest(JSON.parse(payloadStr))
      } else {
        setIncomingRequest(null)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your availability and consultations.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-medium text-slate-700">Online & Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-indigo-50 border-none shadow-sm md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-900">3</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm md:col-span-1 border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Today's Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">12</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm md:col-span-2 border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Availability Management</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700 bg-indigo-50"><Video className="w-4 h-4 mr-2"/> Video On</Button>
            <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700 bg-indigo-50"><Phone className="w-4 h-4 mr-2"/> Audio On</Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Pending Consultations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incomingRequest && (
          <Card className="shadow-sm border-2 border-indigo-500 animate-pulse">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-indigo-700">{incomingRequest.patient}</CardTitle>
                  <CardDescription>Requested Just Now</CardDescription>
                </div>
                <div className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Incoming
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-900">Requested Doctor:</span> {incomingRequest.doctor}</p>
                <div className="bg-slate-50 p-2 rounded border mt-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-500" />
                  <span>Requested: <span className="font-medium">Video Call</span></span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Link href={`/doctor/consultation/room`} className="flex-1" onClick={() => localStorage.setItem("teleconsultation_status", "accepted")}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700"><Check className="w-4 h-4 mr-1"/> Accept</Button>
              </Link>
              <Button onClick={() => localStorage.removeItem("teleconsultation_request")} variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"><X className="w-4 h-4 mr-1"/> Decline</Button>
            </CardFooter>
          </Card>
        )}

        {[1, 2].map((i) => (
          <Card key={i} className="shadow-sm opacity-60">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Patient #{1024 + i}</CardTitle>
                  <CardDescription>Scheduled for later</CardDescription>
                </div>
                <div className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                  Routine
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-900">Symptoms:</span> Follow-up consultation.</p>
                <div className="bg-slate-50 p-2 rounded border mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Requested: <span className="font-medium">Video Call</span></span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button disabled className="w-full bg-slate-300"><Check className="w-4 h-4 mr-1"/> Accept</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
