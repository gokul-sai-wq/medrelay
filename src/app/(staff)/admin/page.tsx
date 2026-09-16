"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, Activity, MapPin, Pill, TrendingDown, Users, Bell, AlertOctagon, 
  Building2, CheckCircle2, Send, Download, RefreshCw, X, ShieldAlert, Truck, Info, Sparkles, Gavel, ArrowRight
} from "lucide-react"
import { getCitizenGrievances, ensureDemoSeedData, type CitizenGrievance } from "@/lib/store"

export default function AdminPortalPage() {
  // Modal states
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastSubmitted, setBroadcastSubmitted] = useState(false)
  const [broadcastTarget, setBroadcastTarget] = useState("All Pondicherry Districts")
  const [broadcastCategory, setBroadcastCategory] = useState("Epidemic Alert")
  const [broadcastMessage, setBroadcastMessage] = useState("Dengue alert issued for Ward 4 Muthialpet & Villianur. Ensure immediate fogging and report fever cases.")

  const [showAutoRouteModal, setShowAutoRouteModal] = useState(false)
  const [autoRouteSuccess, setAutoRouteSuccess] = useState(false)
  const [isRouting, setIsRouting] = useState(false)

  const [selectedCluster, setSelectedCluster] = useState<string | null>("dengue")
  const [reportDownloaded, setReportDownloaded] = useState(false)

  // Inventory data state
  const [inventoryList, setInventoryList] = useState([
    { phc: "Villianur PHC, Pondicherry", med: "Anti-Snake Venom", stock: 12, risk: "Critical" },
    { phc: "Bahour Sub-centre, Pondicherry", med: "Iron Folic Acid", stock: 18, risk: "High" },
    { phc: "Ariyankuppam PHC, Pondicherry", med: "Paracetamol", stock: 22, risk: "High" },
    { phc: "Nettapakkam PHC, Pondicherry", med: "ORS Packets", stock: 31, risk: "Moderate" },
    { phc: "Karaikal PHC, Pondicherry", med: "Antibiotics (Amoxicillin)", stock: 45, risk: "Low" },
  ])

  // Citizen Grievances state
  const [grievances, setGrievances] = useState<CitizenGrievance[]>([])

  useEffect(() => {
    ensureDemoSeedData()
    setGrievances(getCitizenGrievances())
    const handleStorage = () => setGrievances(getCitizenGrievances())
    window.addEventListener("storage", handleStorage)
    window.addEventListener("medrelay-grievance-update", handleStorage)
    const interval = setInterval(() => setGrievances(getCitizenGrievances()), 2000)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("medrelay-grievance-update", handleStorage)
      clearInterval(interval)
    }
  }, [])

  const pendingGrievances = grievances.filter(g => g.status === "Pending Action")
  const criticalGrievances = grievances.filter(g => g.severity === "Critical")

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    setBroadcastSubmitted(true)
    setTimeout(() => {
      setBroadcastSubmitted(false)
      setShowBroadcastModal(false)
    }, 1800)
  }

  const handleTriggerAutoRoute = () => {
    setIsRouting(true)
    setTimeout(() => {
      setIsRouting(false)
      setAutoRouteSuccess(true)
      // Replenish stock in state
      setInventoryList(prev => prev.map(item => ({
        ...item,
        stock: item.risk === "Critical" || item.risk === "High" ? 95 : item.stock,
        risk: item.risk === "Critical" || item.risk === "High" ? "Replenished" : item.risk
      })))
    }, 1500)
  }

  const handleDownloadReport = () => {
    setReportDownloaded(true)
    setTimeout(() => setReportDownloaded(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span> Puducherry District Health HQ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">District Health Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time Epidemic Surveillance, ASHA Monitoring & Supply Logistics</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowBroadcastModal(true)}
              variant="outline" 
              className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 shadow-sm"
            >
                <AlertTriangle size={16} className="mr-2" /> Broadcast Alert
            </Button>
            <Button 
              onClick={handleDownloadReport}
              className="bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
            >
                {reportDownloaded ? (
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> Report Downloaded</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Download size={16} /> Download District Report</span>
                )}
            </Button>
        </div>
      </div>

      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="shadow-sm border-l-4 border-l-red-500 bg-red-50/20 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-red-700">Active Outbreak Alerts</CardTitle>
            <AlertOctagon className="h-5 w-5 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-700">3</div>
            <p className="text-xs font-semibold text-red-600 mt-1">Dengue: Ward 4 Muthialpet & Villianur</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500 bg-orange-50/20 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700">Critical Stockouts</CardTitle>
            <Pill className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {inventoryList.filter(i => i.risk === 'Critical' || i.risk === 'High').length} PHCs
            </div>
            <p className="text-xs text-orange-600 font-medium mt-1">
              {autoRouteSuccess ? "Replenishment Dispatched" : "Anti-Snake Venom & IFA Low"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-teal-500 bg-teal-50/20 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700">ASHA Workers Active</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">4,280</div>
            <p className="text-xs text-teal-700 font-medium mt-1">94% active in Pondicherry blocks</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/20 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700">AI Triage Consults</CardTitle>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">14.2k</div>
            <p className="text-xs text-indigo-600 font-medium mt-1">+12% vs last week (Pondicherry region)</p>
          </CardContent>
        </Card>
      </div>

      {/* Public Escalation & Unresponsive PHC Hotline Banner */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white p-5 rounded-2xl border border-red-800/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0 text-red-400">
            <ShieldAlert size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-red-500/30">
                Live Public Escalation Alert
              </span>
              <span className="text-xs text-slate-400">Puducherry District Health Command</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              {pendingGrievances.length > 0 
                ? `${pendingGrievances.length} Citizen Grievances Pending Government Administrative Action`
                : "Citizen Grievances & Emergency Response Oversight"}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              {pendingGrievances.length > 0
                ? `Active complaints reported regarding unresponsive PHCs and unaccepted emergency SOS distresses (including ${pendingGrievances[0]?.facility}).`
                : "Continuous monitoring of PHC duty officers, emergency SOS response times, and citizen care grievances."}
            </p>
          </div>
        </div>

        <Link
          href="/admin/grievances"
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-4 py-3 rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors shrink-0"
        >
          <Gavel size={15} />
          <span>Review Grievances &amp; Issue Show-Cause ({pendingGrievances.length})</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Epidemic Interactive Map */}
        <Card className="shadow-sm lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                  <MapPin className="text-teal-600" size={20} />
                  Live Epidemic Surveillance Map — Pondicherry
              </CardTitle>
              <CardDescription>Click any hotspot cluster to inspect real-time AI symptom vector reports.</CardDescription>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setSelectedCluster("dengue")} 
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${selectedCluster === "dengue" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Dengue Cluster
              </button>
              <button 
                onClick={() => setSelectedCluster("malaria")} 
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${selectedCluster === "malaria" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Malaria Warning
              </button>
              <button 
                onClick={() => setSelectedCluster("normal")} 
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${selectedCluster === "normal" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Normal PHCs
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full h-[380px] bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
                {/* Map Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
                
                {/* Map Labels for Pondicherry */}
                <div className="absolute top-4 left-4 bg-slate-800/90 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono">
                  📍 District: Puducherry (Pondicherry)
                </div>

                {/* Hotspot 1: Dengue in Ward 4 Muthialpet & Villianur */}
                <div 
                  onClick={() => setSelectedCluster("dengue")}
                  className="absolute top-1/3 left-1/3 flex flex-col items-center cursor-pointer group"
                >
                    <div className="w-20 h-20 bg-red-500/30 rounded-full animate-ping absolute"></div>
                    <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-xl relative z-10 flex items-center justify-center text-white font-bold text-xs">
                      18
                    </div>
                    <span className="bg-slate-900/90 border border-red-500/50 px-2.5 py-1 rounded text-xs font-bold mt-2 text-red-400 z-20 shadow-md">
                      Muthialpet Ward 4 — Dengue (18)
                    </span>
                </div>

                {/* Hotspot 2: Malaria in Lawspet & Bahour */}
                <div 
                  onClick={() => setSelectedCluster("malaria")}
                  className="absolute bottom-1/3 right-1/3 flex flex-col items-center cursor-pointer group"
                >
                    <div className="w-14 h-14 bg-orange-500/30 rounded-full animate-ping absolute" style={{ animationDuration: '2.5s' }}></div>
                    <div className="w-7 h-7 bg-orange-500 rounded-full border-2 border-white shadow-xl relative z-10 flex items-center justify-center text-white font-bold text-xs">
                      6
                    </div>
                    <span className="bg-slate-900/90 border border-orange-500/50 px-2.5 py-1 rounded text-xs font-bold mt-2 text-orange-400 z-20 shadow-md">
                      Bahour Block — Malaria (6)
                    </span>
                </div>

                {/* Hotspot 3: Normal PHCs */}
                <div 
                  onClick={() => setSelectedCluster("normal")}
                  className="absolute top-1/4 right-1/4 flex flex-col items-center cursor-pointer"
                >
                    <div className="w-5 h-5 bg-teal-500 rounded-full border-2 border-white shadow-md relative z-10"></div>
                    <span className="bg-slate-900/90 text-teal-300 text-[10px] px-1.5 py-0.5 rounded mt-1">Karaikal PHC</span>
                </div>
                <div 
                  onClick={() => setSelectedCluster("normal")}
                  className="absolute bottom-1/4 left-1/4 flex flex-col items-center cursor-pointer"
                >
                    <div className="w-5 h-5 bg-teal-500 rounded-full border-2 border-white shadow-md relative z-10"></div>
                    <span className="bg-slate-900/90 text-teal-300 text-[10px] px-1.5 py-0.5 rounded mt-1">Nettapakkam PHC</span>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs font-medium text-slate-300 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> Outbreak (High Alert)</div>
                    <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-orange-400 rounded-full"></div> Early Warning Cluster</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-500 rounded-full"></div> Normal Operational</div>
                </div>
            </div>

            {/* Selected Cluster Details Drawer */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {selectedCluster === "dengue" ? "Dengue Outbreak Vector — Ward 4 Muthialpet & Villianur" :
                     selectedCluster === "malaria" ? "Malaria Early Warning — Bahour & Ariyankuppam Block" :
                     "Normal Surveillance — Karaikal & Nettapakkam Sectors"}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedCluster === "dengue" ? "bg-red-100 text-red-700" :
                    selectedCluster === "malaria" ? "bg-orange-100 text-orange-700" :
                    "bg-teal-100 text-teal-700"
                  }`}>
                    {selectedCluster === "dengue" ? "Critical" : selectedCluster === "malaria" ? "Warning" : "Stable"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedCluster === "dengue" ? "18 cases reported by Villianur PHC ASHA team in 48 hrs. Vector control team deployed." :
                   selectedCluster === "malaria" ? "6 fever triage reports with chills in Bahour PHC. Blood smear test kits requested." :
                   "Sub-centre routine surveys normal across Karaikal and Nettapakkam PHC jurisdictions."}
                </p>
              </div>
              <Button 
                onClick={() => setShowBroadcastModal(true)} 
                size="sm" 
                className="bg-slate-900 text-white shrink-0 hover:bg-slate-800"
              >
                Dispatch Advisory
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Predictive Inventory & Supply Dispatch */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
                <TrendingDown className="text-orange-500" size={20} />
                Predictive Inventory Forecast
            </CardTitle>
            <CardDescription>AI forecasts stockouts across Pondicherry PHCs (Next 72 Hrs).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {inventoryList.map((item, i) => (
                <div key={i} className="flex flex-col p-3 border rounded-xl hover:bg-slate-50 transition-colors bg-white">
                  <div className="flex justify-between items-start mb-1.5">
                      <div className="font-bold text-slate-900 text-sm">{item.med}</div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          item.risk === 'Critical' ? 'bg-red-100 text-red-700' :
                          item.risk === 'High' ? 'bg-orange-100 text-orange-700' :
                          item.risk === 'Replenished' ? 'bg-teal-100 text-teal-800' :
                          item.risk === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                          {item.risk}
                      </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1 font-medium text-slate-700"><Building2 size={12}/> {item.phc}</span>
                      <span className="font-semibold text-slate-800">Stock: {item.stock}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ${
                            item.stock <= 15 ? 'bg-red-500' :
                            item.stock <= 25 ? 'bg-orange-500' :
                            item.stock <= 40 ? 'bg-yellow-400' :
                            'bg-teal-500'
                        }`} 
                        style={{ width: `${item.stock}%` }}
                      ></div>
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={() => setShowAutoRouteModal(true)}
                className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 py-2.5"
              >
                  <Truck size={16} />
                  Auto-Route Supplies from Central Store
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Broadcast Health Advisory</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {broadcastSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Broadcast Transmitted Successfully!</h4>
                <p className="text-xs text-slate-500">Sent via WhatsApp, SMS & In-App notification to 4,280 ASHA workers and PHC staff in {broadcastTarget}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Region (Pondicherry)</label>
                  <select 
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  >
                    <option value="All Pondicherry Districts">All Pondicherry Districts</option>
                    <option value="Villianur Sub-division">Villianur Sub-division</option>
                    <option value="Bahour Block">Bahour Block</option>
                    <option value="Karaikal District">Karaikal District</option>
                    <option value="Muthialpet & Lawspet Wards">Muthialpet & Lawspet Wards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Advisory Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Epidemic Alert", "Vaccine Drive", "Weather Warning"].map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setBroadcastCategory(cat)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                          broadcastCategory === cat ? "bg-orange-500 text-white border-orange-500" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Broadcast Text Message</label>
                  <textarea 
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-start gap-2">
                  <Info size={16} className="text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-800">This broadcast will be mirrored live on the WhatsApp & SMS Simulation gateway for frontline workers.</p>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5">
                    <Send size={16} /> Send Broadcast
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Auto-Route Supply Confirmation Modal */}
      {showAutoRouteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
                  <Truck size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Auto-Route Supply Allocation</h3>
              </div>
              <button onClick={() => setShowAutoRouteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {autoRouteSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Supplies Dispatched!</h4>
                <p className="text-xs text-slate-600">
                  Indira Gandhi Central Medical Store truck dispatched with Anti-Snake Venom (150 vials) to <strong>Villianur PHC</strong> and IFA to <strong>Bahour PHC</strong>.
                </p>
                <Button onClick={() => setShowAutoRouteModal(false)} className="w-full bg-slate-900 text-white mt-2">
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  AI supply chain optimization has computed optimal routing from <strong>Indira Gandhi Central Medical Depot, Puducherry</strong> to resolve stockouts at:
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>• Villianur PHC</span>
                    <span className="text-red-600">+150 Vials Anti-Snake Venom</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>• Bahour Sub-centre</span>
                    <span className="text-orange-600">+500 Packs Iron Folic Acid</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>• Ariyankuppam PHC</span>
                    <span className="text-orange-600">+1000 Paracetamol Strips</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowAutoRouteModal(false)}>Cancel</Button>
                  <Button 
                    onClick={handleTriggerAutoRoute} 
                    disabled={isRouting}
                    className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2"
                  >
                    {isRouting ? (
                      <span className="flex items-center gap-2"><RefreshCw size={16} className="animate-spin" /> Routing...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><Truck size={16} /> Confirm Dispatch</span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
