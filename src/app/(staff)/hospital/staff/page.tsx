import { User, Search, MapPin, Phone, ShieldCheck, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StaffRoster() {
  const staff = [
    { id: "EMP-001", name: "Dr. Sarah Jenkins", role: "ER Physician", status: "On Duty", location: "Emergency Ward", phone: "555-0101" },
    { id: "EMP-002", name: "Paramedic Unit 4", role: "Ambulance Team", status: "Dispatched", location: "Route to incident", phone: "555-0102" },
    { id: "EMP-003", name: "Dr. Marcus Chen", role: "Cardiologist", status: "On Call", location: "Off-site", phone: "555-0103" },
    { id: "EMP-004", name: "Nurse Emily Davis", role: "Triage Nurse", status: "On Duty", location: "Triage Desk", phone: "555-0104" },
    { id: "EMP-005", name: "Paramedic Unit 7", role: "Ambulance Team", status: "Available", location: "Ambulance Bay", phone: "555-0105" },
    { id: "EMP-006", name: "Dr. James Wilson", role: "Neurologist", status: "In Surgery", location: "OR 3", phone: "555-0106" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Staff Roster</h2>
          <p className="text-slate-500">Live directory of on-duty personnel and dispatched units.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Add Staff Member</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between space-y-0 rounded-t-xl">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search staff by name or role..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50">All Staff</Button>
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100">Doctors</Button>
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100">Paramedics</Button>
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100">Nurses</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-slate-500 font-semibold bg-white">
                <th className="p-4 py-3">Employee</th>
                <th className="p-4 py-3">Role</th>
                <th className="p-4 py-3">Status</th>
                <th className="p-4 py-3">Current Location</th>
                <th className="p-4 py-3 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {staff.map((person, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                        <User size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{person.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{person.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-700">{person.role}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      person.status === 'On Duty' || person.status === 'Available' ? 'bg-green-100 text-green-700' :
                      person.status === 'Dispatched' || person.status === 'In Surgery' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        person.status === 'On Duty' || person.status === 'Available' ? 'bg-green-500' :
                        person.status === 'Dispatched' || person.status === 'In Surgery' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`} />
                      {person.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                      <MapPin size={14} className="text-indigo-500" />
                      {person.location}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200">
                      <Phone size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200">
                      <Mail size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
