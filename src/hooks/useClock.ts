import { useState, useEffect } from 'react'

export function useClock(): string {
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toISOString().split('T')[1].split('.')[0] + ' UTC'
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC')
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return time
}
