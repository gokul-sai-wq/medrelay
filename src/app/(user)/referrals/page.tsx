"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import { getStaffReferrals, type Referral, type ReferralStage } from "@/lib/store"

const SEED_REFERRALS: Referral[] = [
  {
    id: "REF-8821",
    patientName: "Moni Kumar",
    reason: "Severe shortness of breath — suspected asthma flare-up",
    priority: "urgent",
    createdAt: "Oct 3, 2025 · 10:00 AM",
    stages: [
      { label: "Sub-Centre", facility: "Villianur Sub-Centre PHC, Pondicherry", status: "done", date: "Oct 3, 10:12 AM", note: "Initial assessment by ANM, vitals recorded" },
      { label: "Primary Health Centre", facility: "Villianur PHC, Pondicherry", status: "done", date: "Oct 3, 2:40 PM", note: "Referral accepted, basic diagnostics done" },
      { label: "District Hospital", facility: "Indira Gandhi Govt Hospital, Pondicherry", status: "current", date: "Oct 3, 3:00 PM", note: "Awaiting pulmonology review" },
      { label: "Specialist Review", facility: "Indira Gandhi Govt Hospital, Pondicherry", status: "pending" },
    ],
  },
  {
    id: "REF-7410",
    patientName: "Sita Kumar",
    reason: "High-risk pregnancy follow-up",
    priority: "routine",
    createdAt: "Sep 21, 2025",
    stages: [
      { label: "Sub-Centre", facility: "Villianur Sub-Centre PHC, Pondicherry", status: "done", date: "Sep 21, 9:00 AM" },
      { label: "Primary Health Centre", facility: "Villianur PHC, Pondicherry", status: "done", date: "Sep 22, 11:15 AM" },
      { label: "Rural Hospital", facility: "Indira Gandhi Govt Hospital, Pondicherry", status: "done", date: "Sep 24, 4:00 PM", note: "Completed — mother and child stable" },
    ],
  },
]

const statusIcon = (status: ReferralStage["status"]) => {
  if (status === "done") return <CheckCircle2 className="text-teal-600" size={20} />
  if (status === "current") return <Clock className="text-amber-500" size={20} />
  return <Circle className="text-slate-300" size={20} />
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>(SEED_REFERRALS)

  useEffect(() => {
    setReferrals([...getStaffReferrals(), ...SEED_REFERRALS])
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Referral Tracking</h1>
        <p className="text-slate-500 mt-1">Follow your case as it moves between facilities — nothing gets lost in the handoff.</p>
      </div>

      <div className="space-y-6">
        {referrals.map(ref => {
          const completed = ref.stages.every(s => s.status === "done")
          return (
            <Card key={ref.id} className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{ref.id} · {ref.reason}</CardTitle>
                    <CardDescription>Opened {ref.createdAt}</CardDescription>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {completed ? "Completed" : "In progress"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {ref.stages.map((stage, i) => (
                    <div key={i} className="flex md:flex-col items-start md:items-center gap-3 md:gap-2 flex-1">
                      <div className="flex md:flex-col items-center gap-2">
                        {statusIcon(stage.status)}
                        {i < ref.stages.length - 1 && (
                          <ArrowRight className="hidden md:block text-slate-300 rotate-90 md:rotate-0" size={14} />
                        )}
                      </div>
                      <div className="md:text-center">
                        <p className="font-semibold text-sm text-slate-900">{stage.label}</p>
                        <p className="text-xs text-slate-500">{stage.facility}</p>
                        {stage.date && <p className="text-xs text-slate-400 mt-0.5">{stage.date}</p>}
                        {stage.note && <p className="text-xs text-slate-600 mt-1 italic">{stage.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
