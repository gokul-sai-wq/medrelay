"use client"
import { useEffect, useState } from "react"
import { User, HeartPulse, Activity, PhoneCall, ShieldAlert, Save, IdCard, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function AbhaLinkCard() {
  const [status, setStatus] = useState<"unlinked" | "sending" | "otp" | "verifying" | "linked">("unlinked")
  const [abhaNumber, setAbhaNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [linkedId, setLinkedId] = useState("")

  useEffect(() => {
    const saved = window.localStorage.getItem("medrelay.abha")
    if (saved) { setLinkedId(saved); setStatus("linked") }
  }, [])

  const requestOtp = () => {
    if (abhaNumber.replace(/-/g, "").length !== 14) return
    setStatus("sending")
    setTimeout(() => setStatus("otp"), 900)
  }

  const verifyOtp = () => {
    if (otp.length !== 6) return
    setStatus("verifying")
    setTimeout(() => {
      setLinkedId(abhaNumber)
      window.localStorage.setItem("medrelay.abha", abhaNumber)
      setStatus("linked")
    }, 900)
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
        <IdCard className="text-indigo-600" /> ABHA (Ayushman Bharat Health Account)
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Linking your ABHA ID lets records from any ABDM-participating facility (PHC, sub-centre, district or private hospital)
        attach to one lifelong health record, with your consent required for every share.
      </p>

      {status === "linked" ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={22} />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">ABHA linked</p>
              <p className="text-xs text-emerald-700 font-mono">{linkedId}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { window.localStorage.removeItem("medrelay.abha"); setStatus("unlinked"); setAbhaNumber(""); setOtp("") }}>
            Unlink
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ABHA Number</label>
            <Input
              placeholder="XX-XXXX-XXXX-XXXX"
              value={abhaNumber}
              disabled={status !== "unlinked"}
              onChange={(e) => setAbhaNumber(e.target.value)}
              className="font-mono"
            />
          </div>
          {status === "unlinked" && (
            <Button onClick={requestOtp} className="bg-indigo-600 hover:bg-indigo-700">Send OTP to ABHA-linked mobile</Button>
          )}
          {status === "sending" && (
            <Button disabled className="bg-indigo-600"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Requesting OTP via ABDM gateway...</Button>
          )}
          {status === "otp" && (
            <div className="flex gap-3">
              <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="max-w-[160px] font-mono" />
              <Button onClick={verifyOtp} className="bg-indigo-600 hover:bg-indigo-700">Verify & Link</Button>
            </div>
          )}
          {status === "verifying" && (
            <Button disabled className="bg-indigo-600"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying with ABDM...</Button>
          )}
          <p className="text-xs text-slate-400">
            Simulated flow for demo purposes — production linking calls the live ABDM ABHA verification API once sandbox certification (M1) is complete.
          </p>
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">Patient Profile</h1>
        <p className="text-slate-500 font-medium">Manage your personal and medical information securely.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        <AbhaLinkCard />

        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="text-indigo-600" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <input type="text" defaultValue="John" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input type="text" defaultValue="Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
              <input type="date" defaultValue="1980-05-15" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HeartPulse className="text-red-500" /> Medical Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Type</label>
              <select defaultValue="O+" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-bold text-red-600">
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option>
                <option>O+</option><option>O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Care Physician</label>
              <input type="text" defaultValue="Dr. Sarah Jenkins" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Known Allergies (Comma separated)</label>
              <textarea rows={2} defaultValue="Penicillin, Peanuts" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pre-existing Conditions</label>
              <textarea rows={2} defaultValue="Hypertension, Asthma" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Medications</label>
              <textarea rows={2} defaultValue="Lisinopril 10mg daily, Albuterol inhaler as needed" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10"></div>
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ShieldAlert className="text-orange-500" /> Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Name</label>
              <input type="text" defaultValue="Jane Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship</label>
              <input type="text" defaultValue="Wife" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <input type="tel" defaultValue="555-0192-334" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {saved && <span className="flex items-center text-green-600 font-semibold mr-4 animate-in fade-in">Saved successfully!</span>}
          <Button variant="outline" type="button" className="rounded-xl px-6 py-6 border-slate-300 font-bold">Cancel</Button>
          <Button type="submit" className="rounded-xl px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={loading}>
            {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
          </Button>
        </div>

      </form>
    </div>
  )
}
