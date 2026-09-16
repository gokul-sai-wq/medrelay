"use client"

import { useState, useEffect, useCallback } from "react"
import { ShieldCheck, XCircle, Building2, AlertTriangle, KeyRound, BellRing } from "lucide-react"

// Gentle dual-tone chime using Web Audio API
function playConsentChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime
    // Tone 1
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Tone 2
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(880, now + 0.12) // A5
    gain2.gain.setValueAtTime(0.15, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.55)
  } catch {
    // AudioContext blocked or not supported; gracefully ignore
  }
}

export function ConsentBanner() {
  const [consentRequest, setConsentRequest] = useState<{
    facility?: string
    patientCode?: string
    status?: string
    timestamp?: number
    purpose?: string
  } | null>(null)

  const checkConsent = useCallback(() => {
    try {
      const raw = localStorage.getItem("medrelay.pending_consent")
      if (!raw) {
        setConsentRequest(null)
        return
      }
      const consent = JSON.parse(raw)
      const userCode = (localStorage.getItem("medrelay.user_unique_code") || "PT-8891").trim().toUpperCase()
      const reqCode = (consent.patientCode || "").trim().toUpperCase()

      // Match pending status and user's unique code (or fallback demo code)
      if (consent && consent.status === "pending" && (reqCode === userCode || reqCode === "PT-8891")) {
        setConsentRequest(prev => {
          // If a new request arrived, trigger chime
          if (!prev || prev.timestamp !== consent.timestamp) {
            playConsentChime()
          }
          return consent
        })
      } else {
        setConsentRequest(null)
      }
    } catch {
      setConsentRequest(null)
    }
  }, [])

  useEffect(() => {
    checkConsent()

    // Real-time listener across browser tabs & same tab custom events
    const handleStorage = (e?: StorageEvent) => {
      if (!e || e.key === "medrelay.pending_consent" || e.key === null) {
        checkConsent()
      }
    }

    const handleCustomEvent = () => {
      checkConsent()
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("medrelay-consent-update", handleCustomEvent)
    
    // Polling fallback every 500ms
    const interval = setInterval(checkConsent, 500)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("medrelay-consent-update", handleCustomEvent)
      clearInterval(interval)
    }
  }, [checkConsent])

  const handleConsent = (action: "approved" | "declined") => {
    if (!consentRequest) return
    try {
      const updated = {
        ...consentRequest,
        status: action,
        resolvedAt: Date.now()
      }
      localStorage.setItem("medrelay.pending_consent", JSON.stringify(updated))
      
      // Update ABDM consent log in localStorage for records page
      const logs = JSON.parse(localStorage.getItem("medrelay.consent_history") || "[]")
      logs.unshift({
        requester: consentRequest.facility || "Puducherry Health Facility",
        purpose: "Clinical Consultation & Electronic Health Record Access",
        status: action === "approved" ? "Granted" : "Denied",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        timestamp: Date.now()
      })
      localStorage.setItem("medrelay.consent_history", JSON.stringify(logs))

      // Trigger events for other tabs/listeners
      window.dispatchEvent(new Event("storage"))
      window.dispatchEvent(new CustomEvent("medrelay-consent-update"))
    } catch (e) {
      console.error("Failed to update consent:", e)
    } finally {
      setConsentRequest(null)
    }
  }

  if (!consentRequest) return null

  const facilityName = consentRequest.facility || "Primary Health Centre / Hospital, Pondicherry"
  const requestedCode = (consentRequest.patientCode || "PT-8891").toUpperCase()

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="consent-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="h-2 w-full bg-slate-800" />

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Top Status & Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck size={28} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] text-white font-bold items-center justify-center">!</span>
                </span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <BellRing size={11} className="text-indigo-600" /> Live Access Request
                </div>
                <h3 id="consent-modal-title" className="text-xl font-black text-slate-900 mt-1">
                  Health Record Access
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-slate-700">
              <KeyRound size={12} className="text-slate-500" />
              <span>{requestedCode}</span>
            </div>
          </div>

          {/* Facility Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Building2 size={14} className="text-teal-600" />
              <span>Requesting Facility</span>
            </div>
            <div className="text-base font-extrabold text-slate-900 leading-snug">
              {facilityName}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This Puducherry health facility is requesting digital authorization to view your electronic medical records and ongoing care history for today&apos;s intake and consultation.
            </p>
          </div>

          {/* ABDM Consent Standards Note */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-900">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="leading-tight">
              Under <strong>ABDM Patient Privacy</strong>, your data will only be visible to this facility if you grant consent.
            </p>
          </div>

          {/* Action Buttons: Accept / Reject */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleConsent("declined")}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <XCircle size={18} className="text-slate-600" />
              <span>Reject / Decline</span>
            </button>

            <button
              type="button"
              onClick={() => handleConsent("approved")}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <ShieldCheck size={18} className="text-white" />
              <span>Accept & Approve</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
