"use client"

import { useState } from "react"
import { Users, Search, MoreVertical, Shield, UserX, UserCheck, Plus, X, Send, CheckCircle2, KeyRound, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const INITIAL_USERS = [
  { id: "USR-9982", name: "Ananya R.", email: "ananya.r@gmail.com", role: "Patient", facility: "Pondicherry Central", status: "Active", lastLogin: "2 mins ago" },
  { id: "USR-9983", name: "Dr. K. Sharma", email: "dr.sharma@iggh.py.gov.in", role: "Doctor", facility: "Indira Gandhi Govt General Hospital, Pondicherry", status: "Active", lastLogin: "1 hour ago" },
  { id: "USR-9984", name: "Sunita Devi", email: "sunita.asha@phc.py.gov.in", role: "ASHA Worker", facility: "Villianur PHC, Pondicherry", status: "Active", lastLogin: "15 mins ago" },
  { id: "USR-9985", name: "Pondicherry 108 Ambulance Unit 4", email: "dispatch4@108.py.gov.in", role: "Paramedic", facility: "108 Command Hub, Pondicherry", status: "Active", lastLogin: "12 mins ago" },
  { id: "USR-9986", name: "Ramesh V.", email: "ramesh.v@yahoo.com", role: "Patient", facility: "Bahour Block", status: "Suspended", lastLogin: "2 weeks ago" },
  { id: "USR-9987", name: "Directorate Admin", email: "admin@dhs.py.gov.in", role: "Admin", facility: "DHS Puducherry HQ", status: "Active", lastLogin: "Just now" },
  { id: "USR-9988", name: "Dr. S. Subramanian", email: "dr.subbu@phc.py.gov.in", role: "Doctor", facility: "Bahour PHC, Pondicherry", status: "Active", lastLogin: "3 hours ago" },
]

export default function AdminUsers() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All Roles")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Statuses")

  // Invite Modal states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("Doctor")
  const [newUserFacility, setNewUserFacility] = useState("Villianur PHC, Pondicherry")

  // Selected User Action Modal
  const [actionUser, setActionUser] = useState<any | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = useState("")

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName || !newUserEmail) return

    const newUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      facility: newUserFacility,
      status: "Active",
      lastLogin: "Just created"
    }

    setUsers(prev => [newUser, ...prev])
    setInviteSuccess(true)
    setTimeout(() => {
      setInviteSuccess(false)
      setShowInviteModal(false)
      setNewUserName("")
      setNewUserEmail("")
    }, 1500)
  }

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active"
        setActionSuccessMsg(`Account status updated to ${nextStatus}`)
        return { ...u, status: nextStatus }
      }
      return u
    }))
    setTimeout(() => {
      setActionSuccessMsg("")
      setActionUser(null)
    }, 1500)
  }

  const handleResetPassword = (userId: string) => {
    setActionSuccessMsg(`Password reset link sent to ${actionUser.email}`)
    setTimeout(() => {
      setActionSuccessMsg("")
      setActionUser(null)
    }, 1800)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = searchQuery === "" ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.facility.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = selectedRoleFilter === "All Roles" || u.role === selectedRoleFilter
    const matchesStatus = selectedStatusFilter === "All Statuses" || u.status === selectedStatusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" size={28} /> User & Staff Role Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage accounts, hospital personnel, ASHA workers, and access permissions in Puducherry.</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Invite New Staff / User
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl"><Users size={24} /></div>
            <div>
              <div className="text-3xl font-black text-slate-900">{users.length}</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Registered Accounts</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-teal-50 text-teal-700 p-3 rounded-xl"><Shield size={24} /></div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {users.filter(u => u.role !== 'Patient').length}
              </div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Verified Staff Personnel</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl"><UserX size={24} /></div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {users.filter(u => u.status === 'Suspended').length}
              </div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Suspended Accounts</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and User List Table */}
      <Card className="border border-slate-200 shadow-xs overflow-hidden rounded-2xl">
        <CardHeader className="bg-slate-50 border-b border-slate-200 py-3.5 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, facility, or email..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Role Filter */}
            <select 
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
            >
              <option value="All Roles">All Roles</option>
              <option value="Doctor">Doctor</option>
              <option value="ASHA Worker">ASHA Worker</option>
              <option value="Paramedic">Paramedic</option>
              <option value="Admin">Admin</option>
              <option value="Patient">Patient</option>
            </select>

            {/* Status Filter */}
            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                  <th className="p-4">User ID</th>
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Facility</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      No user accounts found matching query.
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-mono text-xs text-slate-400 font-semibold">{user.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'Doctor' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'ASHA Worker' ? 'bg-yellow-100 text-yellow-800' :
                        user.role === 'Paramedic' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1"><Building2 size={12}/> {user.facility}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {user.status === 'Active' ? <UserCheck size={16} className="text-emerald-500" /> : <UserX size={16} className="text-rose-500" />}
                        <span className={user.status === 'Active' ? 'text-emerald-700' : 'text-rose-600'}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{user.lastLogin}</td>
                    <td className="p-4 text-right">
                      <Button 
                        onClick={() => setActionUser(user)}
                        variant="ghost" 
                        size="sm"
                        className="text-xs text-indigo-600 hover:bg-indigo-50 font-semibold"
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Plus size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Invite New Staff / User</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Staff Account Created!</h4>
                <p className="text-xs text-slate-500">Invitation and login credentials sent to <strong>{newUserEmail}</strong>.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kannan"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. rajesh.k@phc.py.gov.in"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role Assignment</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                  >
                    <option value="Doctor">Doctor (Medical Officer)</option>
                    <option value="ASHA Worker">ASHA Worker (Frontline)</option>
                    <option value="Paramedic">Paramedic (108 Dispatch)</option>
                    <option value="Admin">District Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Facility Assignment (Puducherry)</label>
                  <select 
                    value={newUserFacility}
                    onChange={(e) => setNewUserFacility(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  >
                    <option value="Indira Gandhi Govt General Hospital, Pondicherry">Indira Gandhi Govt General Hospital, Pondicherry</option>
                    <option value="Villianur PHC, Pondicherry">Villianur PHC, Pondicherry</option>
                    <option value="Bahour PHC, Pondicherry">Bahour PHC, Pondicherry</option>
                    <option value="Ariyankuppam Sub-Centre, Pondicherry">Ariyankuppam Sub-Centre, Pondicherry</option>
                    <option value="Nettapakkam PHC, Pondicherry">Nettapakkam PHC, Pondicherry</option>
                    <option value="Karaikal PHC, Pondicherry">Karaikal PHC, Pondicherry</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
                    <Send size={16} /> Create & Send Invite
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manage User Modal */}
      {actionUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manage {actionUser.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{actionUser.id} — {actionUser.role}</p>
              </div>
              <button onClick={() => setActionUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {actionSuccessMsg ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={32} className="text-teal-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">{actionSuccessMsg}</h4>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
                  <div><strong>Email:</strong> {actionUser.email}</div>
                  <div><strong>Facility:</strong> {actionUser.facility}</div>
                  <div><strong>Current Status:</strong> {actionUser.status}</div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => handleToggleUserStatus(actionUser.id)}
                    className={`w-full text-xs font-bold ${actionUser.status === 'Active' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                  >
                    {actionUser.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                  </Button>

                  <Button 
                    onClick={() => handleResetPassword(actionUser.id)}
                    variant="outline"
                    className="w-full text-xs text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <KeyRound size={14} /> Send Password Reset Email
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
