"use client"

import * as React from "react"
import { WifiOff } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = React.useState(false)
  const { t } = useLanguage()

  React.useEffect(() => {
    setIsOffline(typeof navigator !== "undefined" && !navigator.onLine)
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="bg-amber-500 text-white text-sm font-medium px-6 py-2 flex items-center gap-2 justify-center">
      <WifiOff size={16} />
      <span>{t("offline.banner")}</span>
    </div>
  )
}
