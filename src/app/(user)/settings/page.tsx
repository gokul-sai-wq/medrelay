"use client"
import { useState } from "react"
import { Settings2, Bell, Shield, Smartphone, Globe, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useLanguage, LANGUAGES } from "@/lib/i18n"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const { lang, setLang } = useLanguage()

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
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">App Settings</h1>
        <p className="text-slate-500 font-medium">Manage your notifications, privacy, and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Notifications */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Bell className="text-teal-600" /> Notifications
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">Push Notifications</h4>
                <p className="text-sm text-slate-500">Receive alerts on your device for emergency updates.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">Email Summaries</h4>
                <p className="text-sm text-slate-500">Get a weekly email of your AI health assessments.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">SMS Alerts</h4>
                <p className="text-sm text-slate-500">Receive SMS messages when a doctor accepts your consultation.</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Shield className="text-indigo-600" /> Privacy & Data Sharing
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">Share Data with AI</h4>
                <p className="text-sm text-slate-500">Allow MedRelay AI to securely analyze your medical history.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">Hospital Auto-Share</h4>
                <p className="text-sm text-slate-500">Automatically send your medical profile when Emergency Mode is triggered.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* System */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Settings2 className="text-slate-600" /> System Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Globe size={16}/> Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as typeof lang)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-2">Navigation and key screens switch immediately. Full-app translation is expanding to cover every screen.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Smartphone size={16}/> Theme</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900">
                <option>System Default</option>
                <option>Light Mode</option>
                <option>Dark Mode</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          {saved && <span className="flex items-center text-green-600 font-semibold mr-4 animate-in fade-in">Preferences saved!</span>}
          <Button type="submit" className="rounded-xl px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={loading}>
            {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
          </Button>
        </div>

      </form>
    </div>
  )
}
