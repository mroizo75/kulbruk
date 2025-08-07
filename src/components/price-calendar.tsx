'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PriceCalendarProps {
  onDateSelect: (date: string) => void
  selectedDate?: string
  origin?: string
  destination?: string
}

interface PriceData {
  price: number
  priceLevel: 'low' | 'medium' | 'high'
}

interface PriceCalendar {
  [date: string]: PriceData
}

export default function PriceCalendar({ onDateSelect, selectedDate, origin, destination }: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [priceData, setPriceData] = useState<PriceCalendar>({})
  const [isLoading, setIsLoading] = useState(false)

  // Hent prisdata når origin/destination endres
  useEffect(() => {
    if (origin && destination) {
      fetchPriceData()
    }
  }, [origin, destination, currentMonth])

  // Debug logging for price data
  useEffect(() => {
    if (Object.keys(priceData).length > 0) {
      console.log('🎨 PriceCalendar - got price data for', Object.keys(priceData).length, 'days')
      
      // Debug: Test en spesifikk dato
      const today = new Date()
      const testDate = today.toISOString().split('T')[0]
      if (priceData[testDate]) {
        console.log('✅ Today has price data:', priceData[testDate])
      }
    }
  }, [priceData])

  const fetchPriceData = async () => {
    if (!origin || !destination) return

    setIsLoading(true)
    try {
      // Hent priser for 2 måneder fremover
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 2)

      const response = await fetch('/api/flights/price-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      })

      const result = await response.json()
      if (result.success) {
        setPriceData(result.priceCalendar || {})
      }
    } catch (error) {
      console.error('Feil ved henting av prisdata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Legg til tomme celler for å starte på riktig ukedag
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Legg til alle dager i måneden
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDateKey = (date: Date) => {
    // Bruk lokaltid for å unngå tidssone-problemer
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getPriceColorClasses = (priceLevel: 'low' | 'medium' | 'high') => {
    switch (priceLevel) {
      case 'low':
        return 'bg-green-200 text-green-900 border-green-300 hover:bg-green-300 font-medium'
      case 'medium':
        return 'bg-yellow-200 text-yellow-900 border-yellow-300 hover:bg-yellow-300 font-medium'
      case 'high':
        return 'bg-red-200 text-red-900 border-red-300 hover:bg-red-300 font-medium'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
    }
  }

  const monthNames = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
  ]

  const dayNames = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newMonth
    })
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-lg border">
        {/* Kompakt kalender header */}
        <div className="flex items-center justify-between p-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            ←
          </Button>
          
          <h3 className="text-sm font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            →
          </Button>
        </div>

        <div className="p-3">
          {/* Kompakte ukedager */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

        {/* Kalenderdager - kompakt versjon */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-1"></div>
            }

            const dateKey = formatDateKey(date)
            const priceInfo = priceData[dateKey]
            const isPast = isPastDate(date)
            const isSelected = selectedDate === dateKey
            
            // Debug logging for første gyldig dato
            if (index === 0 && date && !isPast) {
              console.log('🎨 Kalender debug:', {
                dateKey,
                priceInfo,
                hasPriceData: !!priceInfo,
                priceLevel: priceInfo?.priceLevel,
                price: priceInfo?.price,
                totalPriceDataKeys: Object.keys(priceData).length
              })
            }

            return (
              <button
                key={dateKey}
                onClick={() => !isPast && onDateSelect(dateKey)}
                disabled={isPast || isLoading}
                className={`
                  relative p-1 text-xs border rounded transition-all duration-200 min-h-[40px] sm:min-h-[50px] flex flex-col items-center justify-center
                  ${isPast 
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100' 
                    : priceInfo 
                      ? getPriceColorClasses(priceInfo.priceLevel)
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                `}
              >
                <span className="font-medium text-xs sm:text-sm">{date.getDate()}</span>
                {priceInfo && !isPast && (
                  <span className="text-[10px] sm:text-xs font-semibold leading-tight">
                    {Math.round(priceInfo.price / 100) * 100}kr
                  </span>
                )}
                {isLoading && !isPast && (
                  <span className="text-[10px]">...</span>
                )}
              </button>
            )
          })}
        </div>

          {/* Kompakt forklaringsboks */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-200 border border-green-300 rounded-sm"></div>
                <span>Billig (&lt;1100kr)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded-sm"></div>
                <span>Moderat</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-200 border border-red-300 rounded-sm"></div>
                <span>Dyr (&gt;1400kr)</span>
              </div>
            </div>
            
            {origin && destination && (
              <p className="text-center text-xs text-gray-500 mt-2">
                {origin} → {destination}
                {isLoading && ' (laster...)'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
