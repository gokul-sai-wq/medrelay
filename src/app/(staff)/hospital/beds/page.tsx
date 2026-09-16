import { Bed, Info, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HospitalBeds() {
  const wards = [
    { name: "Intensive Care Unit (ICU)", capacity: 20, occupied: 18, critical: true, beds: Array(20).fill(0).map((_, i) => (i < 18 ? 'occupied' : 'available')) },
    { name: "Emergency Ward", capacity: 30, occupied: 15, critical: false, beds: Array(30).fill(0).map((_, i) => (i < 15 ? 'occupied' : 'available')) },
    { name: "General Medicine A", capacity: 40, occupied: 38, critical: true, beds: Array(40).fill(0).map((_, i) => (i < 38 ? 'occupied' : 'available')) },
    { name: "Pediatrics", capacity: 25, occupied: 10, critical: false, beds: Array(25).fill(0).map((_, i) => (i < 10 ? 'occupied' : 'available')) },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bed Availability</h2>
          <p className="text-slate-500">Live capacity monitoring for MedRelay dispatch routing.</p>
        </div>
        <Button variant="outline" className="text-slate-600 border-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" /> Sync Capacity
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-indigo-600 text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg"><Bed size={24} /></div>
            <div>
              <div className="text-3xl font-bold">115</div>
              <div className="text-indigo-100 text-sm font-medium">Total Beds</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-lg"><AlertCircle size={24} /></div>
            <div>
              <div className="text-3xl font-bold text-slate-900">81</div>
              <div className="text-slate-500 text-sm font-medium">Occupied</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg"><CheckCircle2 size={24} /></div>
            <div>
              <div className="text-3xl font-bold text-slate-900">34</div>
              <div className="text-slate-500 text-sm font-medium">Available</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg"><AlertTriangle size={24} /></div>
            <div>
              <div className="text-3xl font-bold text-slate-900">2</div>
              <div className="text-slate-500 text-sm font-medium">Wards Near Capacity</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {wards.map((ward, idx) => (
          <Card key={idx} className={`border-0 shadow-sm ${ward.critical ? 'ring-2 ring-orange-400' : ''}`}>
            <CardHeader className="bg-slate-50 border-b py-3 flex flex-row items-center justify-between space-y-0 rounded-t-xl">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-slate-800">{ward.name}</CardTitle>
                {ward.critical && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={12}/> Near Capacity</span>}
              </div>
              <div className="text-sm font-bold text-slate-600">
                {ward.occupied} / {ward.capacity} Occupied
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {ward.beds.map((status, bIdx) => (
                  <div 
                    key={bIdx}
                    title={status === 'occupied' ? 'Bed Occupied' : 'Bed Available'}
                    className={`w-10 h-12 rounded-md border-2 flex items-center justify-center transition-all ${
                      status === 'occupied' ? 'bg-slate-100 border-slate-200 text-slate-300' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 cursor-pointer shadow-sm'
                    }`}
                  >
                    <Bed size={20} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
