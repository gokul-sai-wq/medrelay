"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { ShieldAlert, User, LogOut, CheckSquare, Stethoscope, Hospital, ShieldCheck, BarChart3, Landmark, UserPlus, Package, AlertOctagon, Activity, Users, FileText, Share2, Menu, X } from "lucide-react"
import { OfflineBanner } from "@/components/layout/offline-banner"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isDoctor = pathname.startsWith('/doctor')
  const isHospital = pathname.startsWith('/hospital')
  const isAdmin = pathname.startsWith('/admin')
  const isPHC = pathname.startsWith('/phc')
  const isASHA = pathname.startsWith('/asha')

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const renderNavLinks = () => (
    <nav className="space-y-1 px-3">
      <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Portal Access</div>
      
      {isDoctor && (
        <Link href="/doctor" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
          <Stethoscope size={20} className={pathname === '/doctor' ? "text-indigo-400" : "text-slate-400"} />
          <span className="font-medium">Doctor Portal</span>
        </Link>
      )}

      {isHospital && (
        <Link href="/hospital" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
          <Hospital size={20} className={pathname === '/hospital' ? "text-red-400" : "text-slate-400"} />
          <span className="font-medium">Hospital Portal</span>
        </Link>
      )}

      {isPHC && (
        <Link href="/phc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
          <Landmark size={20} className={pathname === '/phc' ? "text-teal-400" : "text-slate-400"} />
          <span className="font-medium">Sub-Centre / PHC Portal</span>
        </Link>
      )}

      {isASHA && (
        <Link href="/asha" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/asha' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
          <Users size={20} className={pathname === '/asha' ? "text-yellow-400" : "text-slate-400"} />
          <span className="font-medium">ASHA Worker Portal</span>
        </Link>
      )}

      {isAdmin && (
        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
          <ShieldCheck size={20} className={pathname === '/admin' ? "text-purple-400" : "text-slate-400"} />
          <span className="font-medium">Admin Portal</span>
        </Link>
      )}
      
      <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">My Workspace</div>
      
      {isDoctor && (
        <>
          <Link href="/doctor" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <CheckSquare size={20} className="text-slate-400" />
            <span className="font-medium">Pending Consults</span>
          </Link>
          <Link href="/doctor/records" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor/records' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <User size={20} className="text-slate-400" />
            <span className="font-medium">Patient Records</span>
          </Link>
          <Link href="/doctor/schedule" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor/schedule' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Stethoscope size={20} className="text-slate-400" />
            <span className="font-medium">My Schedule</span>
          </Link>
        </>
      )}

      {isHospital && (
        <>
          <Link href="/hospital" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <ShieldAlert size={20} className="text-slate-400" />
            <span className="font-medium">Active Emergencies</span>
          </Link>
          <Link href="/hospital/intake" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/intake' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <UserPlus size={20} className="text-slate-400" />
            <span className="font-medium">Patient Intake</span>
          </Link>
          <Link href="/hospital/beds" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/beds' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Hospital size={20} className="text-slate-400" />
            <span className="font-medium">Bed Availability</span>
          </Link>
          <Link href="/hospital/staff" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/staff' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <User size={20} className="text-slate-400" />
            <span className="font-medium">Staff Roster</span>
          </Link>
          <Link href="/hospital/records" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/records' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={20} className="text-slate-400" />
            <span className="font-medium">Patient Records</span>
          </Link>
          <Link href="/hospital/referrals" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/referrals' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <UserPlus size={20} className="text-slate-400" />
            <span className="font-medium">Inbound Referrals</span>
          </Link>
          <Link href="/hospital/queue" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/queue' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Users size={20} className="text-slate-400" />
            <span className="font-medium">OPD Queue Management</span>
          </Link>
        </>
      )}

      {isAdmin && (
        <>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Activity size={20} className="text-slate-400" />
            <span className="font-medium">District Command</span>
          </Link>
          <Link href="/admin/grievances" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/grievances' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <ShieldAlert size={20} className="text-red-400" />
            <span className="font-medium">Citizen Grievances &amp; Reports</span>
          </Link>
          <Link href="/admin/leaderboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/leaderboard' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 size={20} className="text-slate-400" />
            <span className="font-medium">Swasthya Leaderboard</span>
          </Link>
          <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/users' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <User size={20} className="text-slate-400" />
            <span className="font-medium">User Management</span>
          </Link>
          <Link href="/admin/logs" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/logs' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <ShieldCheck size={20} className="text-slate-400" />
            <span className="font-medium">System Audit Logs</span>
          </Link>
          <Link href="/admin/quality" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/quality' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <CheckSquare size={20} className="text-slate-400" />
            <span className="font-medium">Quality &amp; Accountability</span>
          </Link>
        </>
      )}

      {isPHC && (
        <>
          <Link href="/phc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Activity size={20} className="text-slate-400" />
            <span className="font-medium">PHC Dashboard</span>
          </Link>
          <Link href="/phc/emergency" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/emergency' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <AlertOctagon size={20} className="text-slate-400" />
            <span className="font-medium">Emergency Requests</span>
          </Link>
          <Link href="/phc/intake" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/intake' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <UserPlus size={20} className="text-slate-400" />
            <span className="font-medium">Patient Intake</span>
          </Link>
          <Link href="/phc/records" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/records' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={20} className="text-slate-400" />
            <span className="font-medium">Patient Records</span>
          </Link>
          <Link href="/phc/referrals" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/referrals' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Share2 size={20} className="text-slate-400" />
            <span className="font-medium">Referrals &amp; Closures</span>
          </Link>
          <Link href="/phc/queue" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/queue' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Users size={20} className="text-slate-400" />
            <span className="font-medium">Queue Management</span>
          </Link>
          <Link href="/phc/stock" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/stock' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Package size={20} className="text-slate-400" />
            <span className="font-medium">Stock Reporting</span>
          </Link>
        </>
      )}

      {isASHA && (
        <>
          <Link href="/asha" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/asha' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <AlertOctagon size={20} className="text-red-400" />
            <span className="font-medium">Emergency SOS Alerts</span>
          </Link>
        </>
      )}
    </nav>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      {/* Staff Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 text-slate-300 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950">
              <Link href="/login" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <img src="/medrelay-logo.svg" alt="MedRelay" className="h-6 w-6 shrink-0" />
                <span className="text-lg font-bold text-white">MedRelay</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto py-4">
              {renderNavLinks()}
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-900/30 transition-colors">
                <LogOut size={20} />
                <span className="font-medium">Exit to Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Staff Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Link href="/login" className="flex items-center gap-2">
            <img src="/medrelay-logo.svg" alt="MedRelay" className="h-6 w-6 shrink-0" />
            <span className="text-xl font-bold text-white">MedRelay <span className="text-sm font-normal text-slate-400">
              {isDoctor ? 'Doctor' : isHospital ? 'Hospital' : isPHC ? 'Sub-Centre / PHC' : isASHA ? 'ASHA Worker' : 'Admin'}
            </span></span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          {renderNavLinks()}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-900/30 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Exit to Login</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <OfflineBanner />
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between md:justify-end px-4 sm:px-6 sticky top-0 z-10 shadow-sm">
          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              aria-label="Open staff menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold text-slate-800">
              {isDoctor ? 'Doctor Portal' : isHospital ? 'Hospital Portal' : isPHC ? 'PHC Portal' : isASHA ? 'ASHA Portal' : 'Admin Portal'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-600 hidden sm:block">
              Welcome, Staff Member
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white shadow-sm overflow-hidden flex justify-center items-center">
              <User size={16} className="text-slate-300" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
