// Calculation: 20% of focus time = rest time.
// Example: 50 mins focus = 10 mins rest.
export const calculateRest = (focusMinutes: number): number => {
  return Math.max(1, Math.floor(focusMinutes * 0.2))
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
