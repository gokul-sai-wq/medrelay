"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package } from "lucide-react"
import { setStockLevel, type StockLevel } from "@/lib/store"

const STOCK_ITEMS = ["Paracetamol", "ORS Sachets", "Iron & Folic Acid", "Amoxicillin", "Antihypertensives"]
const LEVELS: StockLevel[] = ["Available", "Limited", "Out of stock"]

export default function PHCStockPage() {
  const [stockLevels, setStockLevels] = useState<Record<string, StockLevel>>({})
  const facilityName = "Villianur Sub-Centre PHC, Pondicherry" // Mock facility name

  const updateStock = (item: string, level: StockLevel) => {
    setStockLevel(facilityName, item, level)
    setStockLevels(prev => ({ ...prev, [item]: level }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock Reporting</h1>
        <p className="text-slate-500 mt-1">Manage physical inventory levels for local availability.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package size={18} className="text-teal-600"/> Update Local Stock</CardTitle>
          <CardDescription>Changes made here appear immediately on patients' Medicine & Diagnostic Availability page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {STOCK_ITEMS.map(item => (
            <div key={item} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
              <span className="text-[15px] font-medium text-slate-700">{item}</span>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(level => {
                  const isActive = (stockLevels[item] ?? "Available") === level
                  let colorClass = "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  
                  if (isActive) {
                    if (level === "Available") colorClass = "bg-teal-600 text-white border-teal-600 shadow-sm"
                    if (level === "Limited") colorClass = "bg-amber-500 text-white border-amber-500 shadow-sm"
                    if (level === "Out of stock") colorClass = "bg-red-500 text-white border-red-500 shadow-sm"
                  }

                  return (
                    <button
                      key={level}
                      onClick={() => updateStock(item, level)}
                      className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${colorClass}`}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
