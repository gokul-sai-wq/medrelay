"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldAlert, Mail, Lock, User, Stethoscope, Hospital, ShieldCheck, Landmark, HeartHandshake } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneSimulator, SimulationMessage } from "../../components/PhoneSimulator"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const [simMessages, setSimMessages] = useState<SimulationMessage[]>([])

  const addSimMessage = (app: 'whatsapp' | 'sms', title: string, content: string) => {
      setSimMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), app, title, content }])
  }

  const demoCredentials = {
    user: { email: "user@medrelay.com", password: "password123", route: "/" },
    doctor: { email: "doctor@medrelay.com", password: "password123", route: "/doctor" },
    hospital: { email: "hospital@medrelay.com", password: "password123", route: "/hospital" },
    admin: { email: "admin@medrelay.com", password: "password123", route: "/admin" },
    phc: { email: "phc@medrelay.com", password: "password123", route: "/phc" },
    asha: { email: "asha@medrelay.com", password: "password123", route: "/asha" },
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate sending OTP via WhatsApp or SMS
    setTimeout(() => {
      setLoading(false)
      setShowOtp(true)
      
      const isAdminOrDoctor = email.includes("admin") || email.includes("doctor")
      const app = isAdminOrDoctor ? 'whatsapp' : 'sms'
      const title = isAdminOrDoctor ? 'MedRelay Security' : 'MedRelay OTP'
      const content = `Your MedRelay secure login code is 842911. Do not share this with anyone.`
      
      addSimMessage(app, title, content)
    }, 1000)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (email.includes("doctor")) router.push("/doctor")
      else if (email.includes("hospital")) router.push("/hospital")
      else if (email.includes("admin")) router.push("/admin")
      else if (email.includes("phc")) router.push("/phc")
      else if (email.includes("asha")) router.push("/asha")
      else router.push("/")
    }, 800)
  }

  const loadDemo = (role: keyof typeof demoCredentials) => {
    setEmail(demoCredentials[role].email)
    setPassword(demoCredentials[role].password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <img src="/medrelay-logo.svg" alt="MedRelay" className="h-6 w-6 shrink-0" />
        <span className="text-xl font-bold text-slate-900">MedRelay</span>
      </div>
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 hidden md:block">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Intelligent Health <br /> Safety & Emergency
          </h1>
          <p className="text-lg text-slate-600">
            Experience the future of healthcare communication. Securely access your personalized portal.
          </p>
          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Demo Access</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => loadDemo('user')} className="justify-start"><User size={16} className="mr-2 text-blue-500"/> User Demo</Button>
              <Button variant="outline" onClick={() => loadDemo('doctor')} className="justify-start"><Stethoscope size={16} className="mr-2 text-indigo-500"/> Doctor Demo</Button>
              <Button variant="outline" onClick={() => loadDemo('hospital')} className="justify-start"><Hospital size={16} className="mr-2 text-red-500"/> Hospital Demo</Button>
              <Button variant="outline" onClick={() => loadDemo('admin')} className="justify-start"><ShieldCheck size={16} className="mr-2 text-slate-500"/> Admin Demo</Button>
              <Button variant="outline" onClick={() => loadDemo('phc')} className="justify-start"><Landmark size={16} className="mr-2 text-teal-600"/> Sub-Centre / PHC</Button>
              <Button variant="outline" onClick={() => loadDemo('asha')} className="justify-start"><HeartHandshake size={16} className="mr-2 text-amber-600"/> ASHA Worker</Button>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-xl w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">{showOtp ? "Verify Device" : "Welcome back"}</CardTitle>
            <CardDescription>{showOtp ? "Enter the 6-digit code sent to your phone" : "Enter your credentials to access your account"}</CardDescription>
          </CardHeader>
          
          {!showOtp ? (
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-sm text-teal-600 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-11" disabled={loading}>
                  {loading ? "Authenticating..." : "Sign in"}
                </Button>
                <div className="text-sm text-center text-slate-500">
                  Don't have an account? <Link href="/register" className="text-teal-600 font-semibold hover:underline">Register here</Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2 pt-2">
                  <Label htmlFor="otp">Security Code</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    className="text-center text-lg tracking-[0.5em] font-bold h-12"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-slate-500 text-center mt-2">Checking simulator messages...</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-11" disabled={loading || otp.length < 6}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <button type="button" onClick={() => setShowOtp(false)} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                  Back to login
                </button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
      
      <PhoneSimulator 
        messages={simMessages} 
        onDismiss={(id) => setSimMessages(prev => prev.filter(m => m.id !== id))} 
      />
    </div>
  )
}
