'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAutoRefresh(intervalMs: number = 30000, enabled: boolean = true) {
  const router = useRouter()
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshPage = () => {
    setIsRefreshing(true)
    router.refresh()
    setLastRefresh(new Date())
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      refreshPage()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs, enabled, router])

  return {
    lastRefresh,
    isRefreshing,
    refreshPage
  }
}