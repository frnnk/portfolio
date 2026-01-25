import { useClock } from '../../hooks/useClock'

export function Clock() {
  const time = useClock()

  return <span>{time}</span>
}
