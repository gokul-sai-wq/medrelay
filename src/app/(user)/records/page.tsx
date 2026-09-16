"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, FilePlus, Eye, FolderHeart, FlaskConical, Pill, ShieldCheck, Clock } from "lucide-react"

const CONSENT_LOG = [
  { requester: "Indira Gandhi Govt General Hospital, Pondicherry (HIU)", purpose: "Cardiology referral review", status: "Granted", date: "Oct 3, 2025" },
  { requester: "Villianur PHC, Pondicherry (HIU)", purpose: "Referral continuity check", status: "Granted", date: "Oct 3, 2025" },
  { requester: "Third-party insurance partner", purpose: "Claim verification", status: "Denied", date: "Sep 18, 2025" },
]

function downloadFhirBundle() {
  const bundle = {
    resourceType: "Bundle",
    type: "collection",
    meta: { profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DischargeSummaryRecord"] },
    entry: [
      {
        resource: {
          resourceType: "Patient",
          identifier: [{ system: "https://healthid.ndhm.gov.in", value: window.localStorage.getItem("medrelay.abha") || "UNLINKED" }],
          name: [{ text: "John Doe" }],
        },
      },
      {
        resource: {
          resourceType: "DiagnosticReport",
          code: { text: "Annual Blood Work" },
          issued: "2025-10-12",
          performer: [{ display: "Dr. Sarah Jenkins" }],
        },
      },
    ],
  }
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "medrelay-fhir-bundle.json"
  a.click()
  URL.revokeObjectURL(url)
}

export default function MedicalRecordsPage() {
  const categories = [
    { name: "Clinical Reports", icon: FolderHeart, count: 12 },
    { name: "Lab Results", icon: FlaskConical, count: 5 },
    { name: "Prescriptions", icon: Pill, count: 8 },
  ]

  const recentFiles = [
    { name: "Annual Blood Work.pdf", date: "Oct 12, 2025", doctor: "Dr. Sarah Jenkins", type: "Lab Result" },
    { name: "Chest X-Ray Summary.pdf", date: "Sep 28, 2025", doctor: "Dr. Michael Chen", type: "Clinical Report" },
    { name: "Amoxicillin Prescription.pdf", date: "Sep 15, 2025", doctor: "Dr. Emily Rodriguez", type: "Prescription" },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medical Records</h1>
          <p className="text-slate-500 mt-1">Securely view and manage your health documents.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <ShieldCheck className="w-4 h-4 mr-2" /> Link ABHA ID
          </Button>
          <Button variant="outline" onClick={downloadFhirBundle} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <Download className="w-4 h-4 mr-2" /> Export ABDM FHIR Bundle
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 shadow-sm">
            <FilePlus className="w-4 h-4 mr-2" /> Upload Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => {
          const Icon = cat.icon
          return (
            <Card key={i} className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                    <p className="text-sm text-slate-500">{cat.count} files</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="shadow-sm mt-8 border-slate-200">
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Your latest medical files across all categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-none mb-1">{file.name}</p>
                    <p className="text-sm text-slate-500">{file.type} • Added {file.date}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="h-8 shadow-sm">
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 shadow-sm text-teal-600 border-teal-200 hover:bg-teal-50">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" /> Consent Log</CardTitle>
          <CardDescription>Every facility that has requested access to your linked ABHA record, and whether you granted it — this is the ABDM Consent Manager model.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CONSENT_LOG.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-xl">
              <div>
                <p className="font-semibold text-sm text-slate-900">{c.requester}</p>
                <p className="text-xs text-slate-500">{c.purpose}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.status === "Granted" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {c.status}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 justify-end"><Clock size={11}/> {c.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
