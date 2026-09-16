"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Star, TrendingUp, Award, Medal, CheckCircle2, Gift, Send, X, Filter } from "lucide-react"

export default function LeaderboardPage() {
  const [selectedRegion, setSelectedRegion] = useState("All Puducherry")
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null)
  const [awardSentSuccess, setAwardSentSuccess] = useState(false)
  const [bonusAmount, setBonusAmount] = useState("₹1,000")

  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, name: "Sunita Devi", phc: "Villianur PHC, Pondicherry", points: 2450, badge: "Gold", trend: "up", triage: 142, followups: "100%", referrals: 38 },
    { rank: 2, name: "Lata M.", phc: "Bahour PHC, Pondicherry", points: 2310, badge: "Silver", trend: "up", triage: 128, followups: "98%", referrals: 32 },
    { rank: 3, name: "Pooja Sharma", phc: "Ariyankuppam Sub-Centre, Pondicherry", points: 2180, badge: "Bronze", trend: "down", triage: 115, followups: "94%", referrals: 29 },
    { rank: 4, name: "Anita K.", phc: "Nettapakkam PHC, Pondicherry", points: 1950, badge: "Elite", trend: "up", triage: 98, followups: "96%", referrals: 24 },
    { rank: 5, name: "Geeta R.", phc: "Karaikal PHC, Pondicherry", points: 1820, badge: "Elite", trend: "up", triage: 92, followups: "92%", referrals: 21 },
    { rank: 6, name: "Meena Swaminathan", phc: "Lawspet PHC, Pondicherry", points: 1740, badge: "Rising Star", trend: "up", triage: 88, followups: "95%", referrals: 19 },
    { rank: 7, name: "Kavitha Selvam", phc: "Muthialpet Sub-Centre, Pondicherry", points: 1690, badge: "Active", trend: "up", triage: 84, followups: "91%", referrals: 17 },
  ])

  const handleSendAward = (e: React.FormEvent) => {
    e.preventDefault()
    setAwardSentSuccess(true)
    setTimeout(() => {
      setAwardSentSuccess(false)
      setSelectedWorker(null)
    }, 1800)
  }

  const filteredList = leaderboardData.filter(item => {
    if (selectedRegion === "All Puducherry") return true
    return item.phc.toLowerCase().includes(selectedRegion.toLowerCase())
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} /> Swasthya Mitra Leaderboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gamified performance recognition for ASHA & Frontline Workers across Pondicherry.</p>
        </div>
        
        {/* Region Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All Puducherry">All Puducherry Blocks</option>
            <option value="Villianur">Villianur Sector</option>
            <option value="Bahour">Bahour Sector</option>
            <option value="Ariyankuppam">Ariyankuppam Sector</option>
            <option value="Karaikal">Karaikal District</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Champion Card */}
        <Card className="shadow-sm border-t-4 border-t-yellow-400 bg-gradient-to-b from-yellow-50/70 to-white md:col-span-3 lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2 shadow-inner border border-yellow-300">
                <Trophy size={32} className="text-yellow-600" />
            </div>
            <CardTitle className="text-xl text-slate-900">Champion of the Month</CardTitle>
            <CardDescription className="text-yellow-800 font-medium">District: Puducherry (Pondicherry)</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{leaderboardData[0].name}</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{leaderboardData[0].phc}</p>
            </div>
            
            <div className="bg-white rounded-xl p-3.5 border border-yellow-200 flex justify-around shadow-xs">
                <div className="text-center">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">Points</div>
                    <div className="font-extrabold text-yellow-600 text-base">{leaderboardData[0].points}</div>
                </div>
                <div className="text-center border-x border-slate-100 px-2">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">Triage</div>
                    <div className="font-bold text-slate-800 text-base">{leaderboardData[0].triage}</div>
                </div>
                <div className="text-center">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">Follow-up</div>
                    <div className="font-bold text-teal-600 text-base">{leaderboardData[0].followups}</div>
                </div>
            </div>

            <Button 
              onClick={() => setSelectedWorker(leaderboardData[0])}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Gift size={16} /> Send Recognition Bonus
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <Card className="shadow-sm md:col-span-3 lg:col-span-2 border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Top Performing Frontline Workers</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Points calculated from timely triage, maternal follow-ups, and referral conversions.</CardDescription>
                </div>
                <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                  {filteredList.length} ASHA Workers
                </span>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-2.5">
                    {filteredList.map((worker) => (
                        <div 
                          key={worker.rank} 
                          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                    worker.rank === 1 ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400' :
                                    worker.rank === 2 ? 'bg-slate-200 text-slate-700 ring-2 ring-slate-300' :
                                    worker.rank === 3 ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-300' :
                                    'bg-teal-50 text-teal-700'
                                }`}>
                                    #{worker.rank}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">{worker.name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{worker.phc}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                    {worker.rank === 1 ? <Medal size={14} className="text-yellow-500"/> : <Star size={14} className="text-slate-400"/>}
                                    {worker.badge}
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-slate-900 text-sm">{worker.points} pts</div>
                                    {worker.trend === 'up' ? (
                                        <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5"><TrendingUp size={10}/> Rising</div>
                                    ) : (
                                        <div className="text-[10px] text-slate-400 font-medium">Stable</div>
                                    )}
                                </div>
                                <Button 
                                  onClick={() => setSelectedWorker(worker)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs h-8 px-2 text-indigo-600 hover:bg-indigo-50"
                                >
                                  Award
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Send Award Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
                  <Trophy size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Award Frontline Recognition</h3>
              </div>
              <button onClick={() => setSelectedWorker(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {awardSentSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Recognition Transmitted!</h4>
                <p className="text-xs text-slate-500">
                  Bonus certificate and <strong>{bonusAmount}</strong> DBT incentive sent to <strong>{selectedWorker.name}</strong> ({selectedWorker.phc}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendAward} className="space-y-4 pt-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Recipient</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedWorker.name}</div>
                  <div className="text-xs text-slate-500">{selectedWorker.phc}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Direct Incentive Bonus</label>
                  <select 
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                  >
                    <option value="₹500">₹500 — Performance Citation</option>
                    <option value="₹1,000">₹1,000 — Monthly Excellence Award</option>
                    <option value="₹2,500">₹2,500 — Puducherry State Champion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Commendation Message</label>
                  <textarea 
                    rows={2}
                    defaultValue={`Thank you ${selectedWorker.name} for achieving ${selectedWorker.followups} maternal follow-up compliance in Puducherry district!`}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedWorker(null)}>Cancel</Button>
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold flex items-center gap-1.5">
                    <Send size={16} /> Disburse Incentive
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
