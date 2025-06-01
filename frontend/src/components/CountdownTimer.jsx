"use client"

import { useEffect, useState } from "react"
import { Clock, CheckCircle } from "lucide-react"

const CountdownTimer = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000)
    const difference = endTime - now

    if (difference <= 0) return null

    const hours = Math.floor(difference / 3600)
    const minutes = Math.floor((difference % 3600) / 60)
    const seconds = difference % 60

    return { hours, minutes, seconds }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (!timeLeft) {
    return (
      <div className="flex items-center space-x-2 text-red-400">
        <CheckCircle className="w-4 h-4" />
        <span className="font-mono text-sm">Finalizada</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-blue-400">
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm">
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  )
}

export default CountdownTimer
