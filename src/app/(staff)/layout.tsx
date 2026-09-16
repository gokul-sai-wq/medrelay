"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldAlert, User, LogOut, CheckSquare, Stethoscope, Hospital, ShieldCheck, BarChart3, Landmark, UserPlus, Package, AlertOctagon, Activity, Users, FileText, Share2 } from "lucide-react"
import { OfflineBanner } from "@/components/layout/offline-banner"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const isDoctor = pathname.startsWith('/doctor')
  const isHospital = pathname.startsWith('/hospital')
  const isAdmin = pathname.startsWith('/admin')
  const isPHC = pathname.startsWith('/phc')
  const isASHA = pathname.startsWith('/asha')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      {/* Staff Sidebar */}
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
          <nav className="space-y-1 px-3">
            <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Portal Access</div>
            
            {isDoctor && (
              <Link href="/doctor" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Stethoscope size={20} className={pathname === '/doctor' ? "text-indigo-400" : "text-slate-400"} />
                <span className="font-medium">Doctor Portal</span>
              </Link>
            )}

            {isHospital && (
              <Link href="/hospital" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Hospital size={20} className={pathname === '/hospital' ? "text-red-400" : "text-slate-400"} />
                <span className="font-medium">Hospital Portal</span>
              </Link>
            )}

            {isPHC && (
              <Link href="/phc" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Landmark size={20} className={pathname === '/phc' ? "text-teal-400" : "text-slate-400"} />
                <span className="font-medium">Sub-Centre / PHC Portal</span>
              </Link>
            )}

            {isASHA && (
              <Link href="/asha" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/asha' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Users size={20} className={pathname === '/asha' ? "text-yellow-400" : "text-slate-400"} />
                <span className="font-medium">ASHA Worker Portal</span>
              </Link>
            )}

            {isAdmin && (
              <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <ShieldCheck size={20} className={pathname === '/admin' ? "text-purple-400" : "text-slate-400"} />
                <span className="font-medium">Admin Portal</span>
              </Link>
            )}
            
            <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">My Workspace</div>
            
            {isDoctor && (
              <>
                <Link href="/doctor" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <CheckSquare size={20} className="text-slate-400" />
                  <span className="font-medium">Pending Consults</span>
                </Link>
                <Link href="/doctor/records" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor/records' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <User size={20} className="text-slate-400" />
                  <span className="font-medium">Patient Records</span>
                </Link>
                <Link href="/doctor/schedule" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/doctor/schedule' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Stethoscope size={20} className="text-slate-400" />
                  <span className="font-medium">My Schedule</span>
                </Link>
              </>
            )}

            {isHospital && (
              <>
                <Link href="/hospital" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <ShieldAlert size={20} className="text-slate-400" />
                  <span className="font-medium">Active Emergencies</span>
                </Link>
                <Link href="/hospital/intake" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/intake' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <UserPlus size={20} className="text-slate-400" />
                  <span className="font-medium">Patient Intake</span>
                </Link>
                <Link href="/hospital/beds" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/beds' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Hospital size={20} className="text-slate-400" />
                  <span className="font-medium">Bed Availability</span>
                </Link>
                <Link href="/hospital/staff" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/staff' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <User size={20} className="text-slate-400" />
                  <span className="font-medium">Staff Roster</span>
                </Link>
                <Link href="/hospital/records" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/records' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <FileText size={20} className="text-slate-400" />
                  <span className="font-medium">Patient Records</span>
                </Link>
                <Link href="/hospital/referrals" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/referrals' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <UserPlus size={20} className="text-slate-400" />
                  <span className="font-medium">Inbound Referrals</span>
                </Link>
                <Link href="/hospital/queue" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/hospital/queue' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Users size={20} className="text-slate-400" />
                  <span className="font-medium">OPD Queue Management</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Activity size={20} className="text-slate-400" />
                  <span className="font-medium">District Command</span>
                </Link>
                <Link href="/admin/grievances" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/grievances' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <ShieldAlert size={20} className="text-red-400" />
                  <span className="font-medium">Citizen Grievances &amp; Reports</span>
                </Link>
                <Link href="/admin/leaderboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/leaderboard' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <BarChart3 size={20} className="text-slate-400" />
                  <span className="font-medium">Swasthya Leaderboard</span>
                </Link>
                <Link href="/admin/users" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/users' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <User size={20} className="text-slate-400" />
                  <span className="font-medium">User Management</span>
                </Link>
                <Link href="/admin/logs" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/logs' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <ShieldCheck size={20} className="text-slate-400" />
                  <span className="font-medium">System Audit Logs</span>
                </Link>
                <Link href="/admin/quality" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/quality' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <CheckSquare size={20} className="text-slate-400" />
                  <span className="font-medium">Quality & Accountability</span>
                </Link>
              </>
            )}

            {isPHC && (
              <>
                <Link href="/phc" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Activity size={20} className="text-slate-400" />
                  <span className="font-medium">PHC Dashboard</span>
                </Link>
                <Link href="/phc/emergency" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/emergency' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <AlertOctagon size={20} className="text-slate-400" />
                  <span className="font-medium">Emergency Requests</span>
                </Link>
                <Link href="/phc/intake" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/intake' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <UserPlus size={20} className="text-slate-400" />
                  <span className="font-medium">Patient Intake</span>
                </Link>
                <Link href="/phc/records" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/records' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <FileText size={20} className="text-slate-400" />
                  <span className="font-medium">Patient Records</span>
                </Link>
                <Link href="/phc/referrals" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/referrals' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Share2 size={20} className="text-slate-400" />
                  <span className="font-medium">Referrals & Closures</span>
                </Link>
                <Link href="/phc/queue" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/queue' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Users size={20} className="text-slate-400" />
                  <span className="font-medium">Queue Management</span>
                </Link>
                <Link href="/phc/stock" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/phc/stock' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Package size={20} className="text-slate-400" />
                  <span className="font-medium">Stock Reporting</span>
                </Link>
              </>
            )}

            {isASHA && (
              <>
                <Link href="/asha" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/asha' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <AlertOctagon size={20} className="text-red-400" />
                  <span className="font-medium">Emergency SOS Alerts</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-900/30 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Exit to Login</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <OfflineBanner />
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-end px-6 sticky top-0 z-10 shadow-sm">
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
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
