"use client"

// Lightweight shared "backend" for the prototype. In production this is a
// real database + API — this module exists so staff-side actions (creating
// a referral, updating stock) and patient-side views (referral tracking,
// availability) read/write the same data instead of being two disconnected
// mocks.

export type ReferralStage = {
  label: string
  facility: string
  status: "done" | "current" | "pending"
  note?: string
  date?: string
}

export type Referral = {
  id: string
  patientName?: string
  priority?: string
  reason: string
  createdAt: string
  stages: ReferralStage[]
}

export type CitizenGrievance = {
  id: string
  patientCode: string
  patientName: string
  phone: string
  category: string
  facility: string
  severity: "Critical" | "High" | "Medium" | "General"
  description: string
  emergencySosId?: string
  status: "Pending Action" | "Show-Cause Issued" | "Under Investigation" | "Resolved & Penalized"
  createdAt: string
  actionNotes?: string
  actionTakenBy?: string
  actionDate?: string
  penaltyPoints?: number
}

export type StockLevel = "Available" | "Limited" | "Out of stock"

const REFERRALS_KEY = "medrelay.staffReferrals"
const STOCK_KEY = "medrelay.stockOverrides"
const GRIEVANCES_KEY = "medrelay.citizen_grievances"

export function getCitizenGrievances(): CitizenGrievance[] {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(GRIEVANCES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function submitCitizenGrievance(data: Omit<CitizenGrievance, "id" | "createdAt" | "status">): CitizenGrievance {
  if (typeof window === "undefined") {
    return {
      ...data,
      id: "GRV-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      status: "Pending Action"
    }
  }

  const current = getCitizenGrievances()
  const newGrievance: CitizenGrievance = {
    ...data,
    id: "GRV-" + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
    status: "Pending Action"
  }
  const updated = [newGrievance, ...current]
  window.localStorage.setItem(GRIEVANCES_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event("storage"))
  window.dispatchEvent(new CustomEvent("medrelay-grievance-update"))
  return newGrievance
}

export function updateGrievanceAction(
  id: string,
  status: CitizenGrievance["status"],
  actionNotes: string,
  actionTakenBy: string = "District Health Officer (DHO), Puducherry",
  penaltyPoints?: number
) {
  if (typeof window === "undefined") return
  const current = getCitizenGrievances()
  const updated = current.map(g => {
    if (g.id === id) {
      return {
        ...g,
        status,
        actionNotes,
        actionTakenBy,
        actionDate: new Date().toISOString(),
        penaltyPoints: penaltyPoints ?? g.penaltyPoints
      }
    }
    return g
  })
  window.localStorage.setItem(GRIEVANCES_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event("storage"))
  window.dispatchEvent(new CustomEvent("medrelay-grievance-update"))
}

export function getStaffReferrals(): Referral[] {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(REFERRALS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function addReferral(referral: Referral) {
  const current = getStaffReferrals()
  window.localStorage.setItem(REFERRALS_KEY, JSON.stringify([referral, ...current]))
}

export function updateReferralStage(referralId: string, stageIndex: number, payload: Partial<ReferralStage>) {
  const current = getStaffReferrals()
  const updated = current.map(ref => {
    if (ref.id === referralId) {
      const newStages = [...ref.stages]
      newStages[stageIndex] = { ...newStages[stageIndex], ...payload }
      
      // If we mark a stage as done, auto-mark the next stage as current if it exists
      if (payload.status === "done" && stageIndex + 1 < newStages.length) {
         newStages[stageIndex + 1] = { ...newStages[stageIndex + 1], status: "current" }
      }
      return { ...ref, stages: newStages }
    }
    return ref
  })
  window.localStorage.setItem(REFERRALS_KEY, JSON.stringify(updated))
}

// facility name -> item name -> level
export type StockOverrides = Record<string, Record<string, StockLevel>>

export function getStockOverrides(): StockOverrides {
  if (typeof window === "undefined") return {}
  const raw = window.localStorage.getItem(STOCK_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function setStockLevel(facility: string, item: string, level: StockLevel) {
  const overrides = getStockOverrides()
  overrides[facility] = { ...(overrides[facility] || {}), [item]: level }
  window.localStorage.setItem(STOCK_KEY, JSON.stringify(overrides))
}

// Appointment Requests Management
export type AppointmentRequest = {
  id: string
  patientName: string
  facility: string
  requestedDate: string
  preferredWindow: string
  department: string
  status: "pending" | "confirmed" | "rescheduled" | "declined"
  confirmedTime?: string
  facilityNote?: string
  createdAt: string
}

const APPOINTMENTS_KEY = "medrelay.appointment_requests"

export function getAppointmentRequests(): AppointmentRequest[] {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(APPOINTMENTS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function addAppointmentRequest(req: AppointmentRequest) {
  const current = getAppointmentRequests()
  window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([req, ...current]))
}

export function updateAppointmentRequestStatus(
  id: string,
  updates: Partial<AppointmentRequest>
) {
  const current = getAppointmentRequests()
  const updated = current.map(item => {
    if (item.id === id) {
      return { ...item, ...updates }
    }
    return item
  })
  window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated))
}

export function closeReferral(referralId: string, note?: string, closingFacility: string = "Indira Gandhi Govt General Hospital, Pondicherry") {
  if (typeof window === "undefined") return
  const current = getStaffReferrals()
  const updated = current.map(ref => {
    if (ref.id === referralId) {
      const newStages = ref.stages.map((stage, idx) => {
        if (idx === ref.stages.length - 1) {
          return {
            ...stage,
            status: "done" as const,
            facility: stage.facility || closingFacility,
            note: note || stage.note || "Referral completed, patient stabilized and discharged back to local PHC.",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
          }
        }
        return { ...stage, status: "done" as const }
      })
      return { ...ref, stages: newStages }
    }
    return ref
  })
  window.localStorage.setItem(REFERRALS_KEY, JSON.stringify(updated))

  // Also update or add to medical history
  try {
    const history = JSON.parse(localStorage.getItem("medrelay.medical_history") || "[]")
    const matchIndex = history.findIndex((h: any) => h.referralId === referralId)
    const nowIso = new Date().toISOString()
    const closeNote = note || "Consultation and referral treatment completed. Patient discharged back to primary care."
    if (matchIndex !== -1) {
      history[matchIndex] = {
        ...history[matchIndex],
        referralClosed: true,
        closeNote: closeNote,
        closeDate: nowIso,
        status: "Treated"
      }
    } else {
      const targetRef = current.find(r => r.id === referralId)
      history.unshift({
        date: nowIso,
        facility: closingFacility,
        patient: "PT-8891",
        patientName: targetRef?.patientName || "Patient (PT-8891)",
        chiefComplaint: targetRef?.reason || "Hospital Referral Consultation",
        actionTaken: closeNote,
        status: "Treated",
        referralId: referralId,
        referralClosed: true,
        closeNote: closeNote,
        closeDate: nowIso
      })
    }
    localStorage.setItem("medrelay.medical_history", JSON.stringify(history))
  } catch {}

  window.dispatchEvent(new Event("storage"))
  window.dispatchEvent(new CustomEvent("medrelay-referral-update"))
}

export function ensureDemoSeedData() {
  if (typeof window === "undefined") return

  // Seed Referrals if empty
  const rawRefs = window.localStorage.getItem(REFERRALS_KEY)
  if (!rawRefs || JSON.parse(rawRefs).length === 0) {
    const initialReferrals: Referral[] = [
      {
        id: "REF-1042",
        patientName: "Aarav Kumar (PT-8891)",
        priority: "High",
        reason: "Acute appendicitis with high-grade fever. Requires tertiary surgical consult.",
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        stages: [
          {
            label: "Sub-Centre Triage",
            facility: "Villianur Sub-Centre PHC, Pondicherry",
            status: "done",
            date: "Today, 09:15 AM",
            note: "Patient examined. Vitals checked: Pulse 108, BP 130/85. Immediate PHC transfer."
          },
          {
            label: "PHC Evaluation",
            facility: "Villianur PHC, Pondicherry",
            status: "done",
            date: "Today, 10:30 AM",
            note: "Ultrasound Abdomen ordered. Transferred to IGGGH via 108 Emergency Ambulance."
          },
          {
            label: "District Hospital Specialist Consult",
            facility: "Indira Gandhi Govt General Hospital, Pondicherry",
            status: "current",
            date: "Today, 11:45 AM",
            note: "Patient received in Surgical Casualty. Pre-op labs initiated. Bed assigned."
          },
          {
            label: "Referral Completion & PHC Continuity",
            facility: "Villianur PHC Follow-up",
            status: "pending"
          }
        ]
      },
      {
        id: "REF-1038",
        patientName: "Meenakshi Sundaram (PT-4421)",
        priority: "Critical",
        reason: "Third-trimester gestational hypertension (BP 165/108 mmHg) with pre-eclampsia symptoms.",
        createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
        stages: [
          {
            label: "MCH ANC Screening",
            facility: "Bahour PHC, Pondicherry",
            status: "done",
            date: "Yesterday, 02:00 PM",
            note: "BP 165/108 mmHg. Albumin 2+. Immediate referral to tertiary obstetrics."
          },
          {
            label: "Tertiary Obstetric Admission",
            facility: "Indira Gandhi Govt General Hospital, Pondicherry",
            status: "done",
            date: "Yesterday, 04:30 PM",
            note: "Admitted to MCH High-Risk Unit. IV Labetalol administered, fetal heart rate stable."
          },
          {
            label: "Referral Closed & PHC ANC Plan",
            facility: "Bahour PHC, Pondicherry",
            status: "done",
            date: "Today, 08:30 AM",
            note: "BP normalized to 124/80 mmHg. Referral closed. Twice-weekly ANC monitoring scheduled at Bahour PHC."
          }
        ]
      },
      {
        id: "REF-1029",
        patientName: "K. Ranganathan (PT-6190)",
        priority: "Moderate",
        reason: "Suspected Falciparum Malaria with thrombocytopenia (Platelets 42,000).",
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        stages: [
          {
            label: "Primary Clinical Intake",
            facility: "Nettapakkam PHC, Pondicherry",
            status: "done",
            date: "Sep 12, 10:00 AM",
            note: "Malaria RDT positive. Platelet count critically low. Referred to IGGGH."
          },
          {
            label: "Inpatient Infectious Disease Care",
            facility: "Indira Gandhi Govt General Hospital, Pondicherry",
            status: "done",
            date: "Sep 13, 01:00 PM",
            note: "3-day IV Artesunate protocol completed. Platelet count recovered to 148,000."
          },
          {
            label: "Discharge & Referral Closed",
            facility: "Nettapakkam PHC, Pondicherry",
            status: "done",
            date: "Sep 15, 09:00 AM",
            note: "Patient fully afebrile and clinically cured. Referral officially completed and closed."
          }
        ]
      }
    ]
    window.localStorage.setItem(REFERRALS_KEY, JSON.stringify(initialReferrals))
  }

  // Seed Medical History if empty
  const rawHist = window.localStorage.getItem("medrelay.medical_history")
  if (!rawHist || JSON.parse(rawHist).length === 0) {
    const initialHistory = [
      {
        id: "HIST-101",
        date: new Date(Date.now() - 3600000 * 1).toISOString(),
        facility: "Villianur PHC, Pondicherry",
        patient: "PT-8891",
        patientName: "Aarav Kumar",
        chiefComplaint: "sadas",
        actionTaken: "ASHA Field Triage (Moderate Risk)",
        flags: ["Maternal Risk"],
        diagnostics: "Blood Glucose (Random)",
        reportDetails: {
          testName: "Blood Glucose (Random)",
          value: "142 mg/dL",
          range: "70 - 140 mg/dL",
          status: "Slightly Elevated",
          notes: "Patient monitored by ASHA worker. Advised dietary control and repeat fasting glucose test."
        },
        referralId: null,
        referralClosed: false,
        status: "Treated"
      },
      {
        id: "HIST-102",
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        facility: "District Hospital",
        patient: "PT-8891",
        patientName: "Aarav Kumar",
        chiefComplaint: "asas",
        actionTaken: "Admitted to IPD/Ward",
        flags: ["asa"],
        diagnostics: "Complete Blood Count (CBC)",
        reportDetails: {
          testName: "Complete Blood Count (CBC)",
          value: "WBC: 12,400 /uL, Hb: 11.2 g/dL, Platelets: 210,000 /uL",
          range: "WBC: 4,500-11,000 /uL",
          status: "Leukocytosis",
          notes: "Admitted for IV antibiotic regimen and 48-hour clinical observation."
        },
        referralId: null,
        referralClosed: false,
        status: "Admitted"
      },
      {
        id: "HIST-103",
        date: new Date(Date.now() - 3600000 * 25).toISOString(),
        facility: "District Hospital",
        patient: "PT-8891",
        patientName: "Aarav Kumar",
        chiefComplaint: "check up",
        actionTaken: "Treated in OPD",
        flags: [],
        diagnostics: "ECG (12-Lead)",
        reportDetails: {
          testName: "ECG (12-Lead)",
          value: "Normal Sinus Rhythm, HR: 74 bpm",
          range: "60 - 100 bpm",
          status: "Normal",
          notes: "No ischemic changes or conduction delays detected."
        },
        referralId: null,
        referralClosed: false,
        status: "Treated"
      },
      {
        id: "HIST-104",
        date: new Date(Date.now() - 3600000 * 26).toISOString(),
        facility: "Shirur PHC",
        patient: "PT-8891",
        patientName: "Aarav Kumar",
        chiefComplaint: "he was the one",
        actionTaken: "Referred to District Hospital",
        flags: ["fever"],
        diagnostics: "Dengue NS1 Antigen Test",
        reportDetails: {
          testName: "Dengue NS1 Antigen Test",
          value: "Positive (NS1 Ag)",
          range: "Negative",
          status: "Critical Alert",
          notes: "High fever with thrombocytopenia warning. Referred to District Hospital ER."
        },
        referralId: "REF-1042",
        referralClosed: false,
        status: "Referred"
      },
      {
        id: "HIST-105",
        date: new Date(Date.now() - 3600000 * 27).toISOString(),
        facility: "District Hospital",
        patient: "PT-8891",
        patientName: "Aarav Kumar",
        chiefComplaint: "General Consult",
        actionTaken: "Treated in OPD",
        flags: [],
        diagnostics: "Urine Protein Routine",
        reportDetails: {
          testName: "Urine Protein Routine",
          value: "Trace Protein (Nil)",
          range: "Negative",
          status: "Normal",
          notes: "Routine renal parameters within normal physiological limits."
        },
        referralId: null,
        referralClosed: false,
        status: "Treated"
      },
      {
        id: "HIST-106",
        date: new Date(Date.now() - 3600000 * 28).toISOString(),
        facility: "Shirur PHC",
        patient: "PT-8891",
        patientName: "Aarav Kumar",
        chiefComplaint: "General Consult",
        actionTaken: "Treated in OPD",
        flags: [],
        diagnostics: "",
        referralId: null,
        referralClosed: false,
        status: "Treated"
      },
      {
        id: "HIST-107",
        date: new Date(Date.now() - 3600000 * 29).toISOString(),
        facility: "Shirur PHC",
        patient: "PT-8891",
        patientName: "Aarav Kumar",
        chiefComplaint: "hello",
        actionTaken: "Referred to District Hospital",
        flags: ["no"],
        diagnostics: "Chest X-Ray Digital",
        reportDetails: {
          testName: "Chest X-Ray Digital",
          value: "Bilateral lower lobe haziness / infiltrates",
          range: "Clear",
          status: "Abnormal",
          notes: "Pneumonic consolidation observed. Referred to tertiary hospital specialist."
        },
        referralId: null,
        referralClosed: false,
        status: "Referred"
      }
    ]
    window.localStorage.setItem("medrelay.medical_history", JSON.stringify(initialHistory))
  }

  // Seed Grievances if empty
  const rawGrv = window.localStorage.getItem(GRIEVANCES_KEY)
  if (!rawGrv || JSON.parse(rawGrv).length === 0) {
    const initialGrievances: CitizenGrievance[] = [
      {
        id: "GRV-1001",
        patientCode: "PT-8891",
        patientName: "Aarav Kumar",
        phone: "+91 98401 23456",
        category: "Emergency SOS Not Accepted / Ignored",
        facility: "Villianur Sub-Centre PHC, Pondicherry",
        severity: "Critical",
        description: "Triggered emergency SOS mode at 11:15 PM with acute abdominal trauma. System broadcasted continuously for 25 minutes with zero response or acknowledgment from the PHC duty officer.",
        emergencySosId: "SOS-8821",
        status: "Pending Action",
        createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
      },
      {
        id: "GRV-0982",
        patientCode: "PT-4421",
        patientName: "Meenakshi Sundaram",
        phone: "+91 97910 88234",
        category: "PHC / Sub-Centre Not Responding",
        facility: "Bahour PHC, Pondicherry",
        severity: "High",
        description: "Visited Bahour PHC during afternoon OPD hours (2:30 PM) for severe gestational dizziness. Facility main gate was locked and no medical staff or nurse was on premises.",
        status: "Show-Cause Issued",
        createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        actionNotes: "Formal show-cause notice served to In-charge Medical Officer, Bahour PHC under Puducherry Public Health Act. Explanation demanded within 48 hours.",
        actionTakenBy: "Dr. K. Ramanathan, District Health Officer (DHO)",
        actionDate: new Date(Date.now() - 3600000 * 18).toISOString(),
        penaltyPoints: -15
      },
      {
        id: "GRV-0955",
        patientCode: "PT-6190",
        patientName: "K. Ranganathan",
        phone: "+91 94432 10987",
        category: "No Proper Response / Inadequate Medical Care",
        facility: "Ariyankuppam Sub-Centre, Pondicherry",
        severity: "Medium",
        description: "Presented with high fever and chills. Pharmacist refused to dispense prescribed antipyretics, citing false stock outage, and demanded private medical shop purchase.",
        status: "Resolved & Penalized",
        createdAt: new Date(Date.now() - 3600000 * 68).toISOString(),
        actionNotes: "Surprise inspection conducted by Directorate of Health Services flying squad. Medicine stock verified in inventory. Written warning issued to pharmacist and supplies disbursed to patient.",
        actionTakenBy: "Directorate of Health & Family Welfare Services, Govt of Puducherry",
        actionDate: new Date(Date.now() - 3600000 * 36).toISOString(),
        penaltyPoints: -25
      }
    ]
    window.localStorage.setItem(GRIEVANCES_KEY, JSON.stringify(initialGrievances))
  }
}


