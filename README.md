# MedRelay — Intelligent Rural-Urban Healthcare Relay & Command Platform

![MedRelay Logo](/public/medrelay-logo.svg)

**MedRelay** is an enterprise-grade, AI-powered healthcare coordination platform designed specifically for **Puducherry (Pondicherry)**. It seamlessly bridges rural Sub-Centres, Primary Health Centres (PHCs), ASHA frontline health workers, District Hospitals, and citizens with live voice-enabled triage, dual-hub emergency SOS dispatch, ABDM ABHA health record continuity, and district epidemic surveillance.

---

## 🌟 Key Platform Modules & Portals

### 1. 👤 Patient Portal (`/`)
- **Voice-Enabled AI Digital Triage (`/triage`)**: Powered by the browser Web Speech API for hands-free speech-to-text symptom descriptions and custom symptom inputs.
- **Appointment Scheduling (`/appointments`)**: Custom date and slot requests for **Indira Gandhi Govt General Hospital, Pondicherry** and regional PHCs.
- **Diagnostic Lab & OPD Search (`/diagnostics`)**: Live lab availability across Villianur, Bahour, and Pondicherry Central.
- **ABDM Health Records (`/records`)**: Downloadable FHIR discharge summaries and ABHA consent logs.

### 2. 🚨 Emergency SOS & Dual-Hub Dispatch (`/emergency`, `/dispatch`)
- **Dual-Hub Emergency Alert System**: Instant distress dispatch routed simultaneously to nearby PHCs and **Indira Gandhi Govt General Hospital, Pondicherry**.
- **Voice Note Recording**: High-fidelity Base64 audio recording with in-app playback and automated audio transcripts.
- **2G/4G Low-Bandwidth Mode**: Simulates low-network connectivity for rural sectors.

### 3. 🤝 ASHA & Frontline Health Worker Portal (`/asha`)
- **Exclusive SOS Emergency Requests Inbox**: Live stream of citizen emergency distress calls in assigned Pondicherry villages (Villianur, Bahour, Muthialpet).
- **Citizen Voice Note Player**: Play emergency voice recordings directly within distress cards.
- **First Responder Actions**: One-click **Acknowledge First Response**, **Direct Call Patient**, and **Map Location**.
- **Swasthya Mitra Points Counter**: Tracks earned points and frontline leaderboard standings.

### 4. 🏥 Sub-Centre / PHC Portal (`/phc`)
- **OPD Patient Intake (`/phc/intake`)**: Digitizes walk-in intake with automated triage scoring.
- **Emergency Requests Receiver (`/phc/emergency`)**: Manages first-responder dispatch.
- **OPD Queue & Stock Reporting (`/phc/queue`, `/phc/stock`)**: Tracks medicine inventory threshold alerts.

### 5. 👨‍⚕️ Doctor Portal (`/doctor`)
- **Pending Consults Hub (`/doctor`)**: Live patient queue, WebRTC video consultation stream, and prescription generator.
- **Patient Records & Schedule (`/doctor/records`, `/doctor/schedule`)**: Longitudinal patient history inspection.

### 6. 🏢 Hospital Portal (`/hospital`)
- **Active Emergencies & Intake (`/hospital`, `/hospital/intake`)**: Real-time ambulance telemetry and inpatient admission tracking.
- **Bed Availability Matrix (`/hospital/beds`)**: ICU, Oxygen, and General bed capacity monitor.
- **OPD Queue & Staff Roster (`/hospital/queue`, `/hospital/staff`)**.

### 7. 🏛️ District Health Command (`/admin`)
- **Live Epidemic Surveillance Map**: AI-detected symptom clusters across Pondicherry (Dengue in Ward 4 Muthialpet, Malaria in Bahour).
- **Interactive Broadcast Alert Gateway**: Dispatch emergency health advisories via WhatsApp, SMS, and Push notifications to 4,280 Puducherry health workers.
- **Predictive Inventory & Auto-Route Logistics**: Forecasts stockouts at Villianur PHC & Bahour PHC, with one-click supply dispatch from **Indira Gandhi Central Medical Depot**.

### 8. 📊 Quality Assurance & Accountability (`/admin/quality`)
- **SLA Breach Monitoring**: Real-time flag tracking with **Resolve Flag** and **Escalate to DHS Puducherry** actions.
- **Automated Clinical Audit PDF Download**: One-click monthly audit report generator.

### 9. 🏆 Swasthya Mitra Leaderboard (`/admin/leaderboard`)
- **Gamified ASHA Rankings**: Sector-wise performance leaderboard.
- **Direct Incentive Disbursement Modal**: Disburse ₹500 / ₹1,000 / ₹2,500 DBT performance bonuses and award digital certificates.

### 10. 📜 ABDM System Audit Logs (`/admin/logs`)
- **Live Tail Streaming Terminal**: Real-time log terminal with Play/Pause simulation.
- **JSON Audit Export**: Export logs as `medrelay-system-logs-pondicherry.json`.

### 11. 👥 User & Staff Role Management (`/admin/users`)
- Manage Doctor, ASHA Worker, Paramedic, Admin, and Patient accounts.
- **Invite New Staff Modal** with facility assignment to Puducherry health centers.

### 12. 📲 WhatsApp & SMS Simulation (`/whatsapp`)
- 2-way mobile messaging interface mirroring emergency alerts, voice notes, and broadcast advisories.

---

## 🔑 Quick Demo Login Accounts

Access the `/login` page and click any quick demo access button:

| Portal | Email | Password | Target Route |
| :--- | :--- | :--- | :--- |
| **Patient Portal** | `user@medrelay.com` | `password123` | `/` |
| **Doctor Portal** | `doctor@medrelay.com` | `password123` | `/doctor` |
| **ASHA Worker** | `asha@medrelay.com` | `password123` | `/asha` |
| **Sub-Centre / PHC** | `phc@medrelay.com` | `password123` | `/phc` |
| **Hospital Portal** | `hospital@medrelay.com` | `password123` | `/hospital` |
| **Admin Command** | `admin@medrelay.com` | `password123` | `/admin` |

---

## 🛠️ Tech Stack & Prerequisites

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Lucide Icons
- **Voice Capabilities**: Web Speech API & Base64 Audio Encoders
- **Data Persistence**: LocalStorage Real-Time Cross-Tab Event Bus

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Verify TypeScript compilation**:
   ```bash
   npx tsc --noEmit --tsBuildInfoFile /tmp/tsbuildinfo
   ```

---

*MedRelay Puducherry Healthcare Initiative — Built for Speed, Accessibility & Rural Health Equity.*
