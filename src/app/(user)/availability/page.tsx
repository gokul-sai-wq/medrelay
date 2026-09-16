"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, FlaskConical, Pill } from "lucide-react"
import { getStockOverrides, type StockLevel, type StockOverrides } from "@/lib/store"

const badge: Record<StockLevel, string> = {
  "Available": "bg-emerald-100 text-emerald-700",
  "Limited": "bg-amber-100 text-amber-700",
  "Out of stock": "bg-red-100 text-red-700",
}

export const FACILITIES = [
  {
    name: "Villianur Sub-Centre PHC, Pondicherry",
    hfrId: "HFR-IN3401000123",
    distanceKm: 2.1,
    medicines: [
      { name: "Paracetamol", level: "Available" as StockLevel },
      { name: "ORS Sachets", level: "Available" as StockLevel },
      { name: "Iron & Folic Acid", level: "Limited" as StockLevel },
    ],
    diagnostics: [
      { name: "Blood Pressure / Basic Vitals", level: "Available" as StockLevel },
      { name: "Blood Glucose (RBS)", level: "Available" as StockLevel },
      { name: "X-Ray", level: "Out of stock" as StockLevel },
    ],
  },
  {
    name: "Villianur PHC, Pondicherry",
    hfrId: "HFR-IN3401000456",
    distanceKm: 6.4,
    medicines: [
      { name: "Amoxicillin", level: "Available" as StockLevel },
      { name: "Antihypertensives", level: "Limited" as StockLevel },
      { name: "Insulin", level: "Out of stock" as StockLevel },
    ],
    diagnostics: [
      { name: "Basic Blood Panel", level: "Available" as StockLevel },
      { name: "ECG", level: "Available" as StockLevel },
      { name: "Ultrasound", level: "Limited" as StockLevel },
    ],
  },
  {
    name: "Indira Gandhi Govt Hospital, Pondicherry",
    hfrId: "HFR-IN3401000789",
    distanceKm: 12.0,
    medicines: [
      { name: "Insulin", level: "Available" as StockLevel },
      { name: "Antibiotics (broad spectrum)", level: "Available" as StockLevel },
      { name: "Chemotherapy drugs", level: "Limited" as StockLevel },
    ],
    diagnostics: [
      { name: "CT Scan", level: "Available" as StockLevel },
      { name: "MRI", level: "Limited" as StockLevel },
      { name: "Full Pathology Lab", level: "Available" as StockLevel },
    ],
  },
]

function applyOverrides(overrides: StockOverrides) {
  return FACILITIES.map(f => ({
    ...f,
    medicines: f.medicines.map(m => ({ ...m, level: overrides[f.name]?.[m.name] ?? m.level })),
    diagnostics: f.diagnostics.map(d => ({ ...d, level: overrides[f.name]?.[d.name] ?? d.level })),
  }))
}

export default function AvailabilityPage() {
  const [facilities, setFacilities] = useState(FACILITIES)

  useEffect(() => {
    setFacilities(applyOverrides(getStockOverrides()))
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medicine & Diagnostic Availability</h1>
        <p className="text-slate-500 mt-1">Check what's actually in stock before you travel — updated live by each facility's staff.</p>
      </div>

      <div className="space-y-6">
        {facilities.map((f, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin size={16} className="text-slate-400" /> {f.name}
              </CardTitle>
              <CardDescription>{f.distanceKm} km away</CardDescription>
              <p className="text-[11px] font-mono text-slate-400">ABDM Health Facility Registry ID: {f.hfrId}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3"><Pill size={16} className="text-teal-600"/> Medicines</p>
                <div className="space-y-2">
                  {f.medicines.map((m, j) => (
                    <div key={j} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-slate-700">{m.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge[m.level]}`}>{m.level}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3"><FlaskConical size={16} className="text-indigo-600"/> Diagnostics</p>
                <div className="space-y-2">
                  {f.diagnostics.map((d, j) => (
                    <div key={j} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-slate-700">{d.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge[d.level]}`}>{d.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
