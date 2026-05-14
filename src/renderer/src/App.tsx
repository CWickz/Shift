import { useState, useEffect, useMemo } from 'react'
import { calculateRest, formatTime } from './utils/timerHelpers'
import alertFocus from './assets/alert.mp3'
import alertRest from './assets/alert2.mp3'
import introSound from './assets/intro.mp3' // 1. Added the Intro Sound asset

function App() {
  const [focusInput, setFocusInput] = useState<number | ''>('')
  const [restInput, setRestInput] = useState<number | ''>('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isRestMode, setIsRestMode] = useState(false)
  const [autoLoop, setAutoLoop] = useState(true)

  // 2. Memoize Audio objects to prevent re-creation on every render
  const soundFocusEnd = useMemo(() => new Audio(alertFocus), [])
  const soundRestEnd = useMemo(() => new Audio(alertRest), [])
  const soundIntro = useMemo(() => new Audio(introSound), [])

  // 3. INTRO SOUND TRIGGER: Plays once when the app boots up
  useEffect(() => {
    const playIntro = () => {
      soundIntro.play().catch((e) => console.log('Intro autoplay blocked:', e))
    }
    playIntro()
  }, [soundIntro])

  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      setFocusInput('')
      setRestInput('')
      if (!isActive && !isRestMode) setTimeLeft(0)
      return
    }
    const numVal = Number(val)
    setFocusInput(numVal)
    setRestInput(calculateRest(numVal))
    if (!isActive && !isRestMode) setTimeLeft(Math.round(numVal * 60))
  }

  const handleRestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      setRestInput('')
      if (!isActive && isRestMode) setTimeLeft(0)
      return
    }
    const numVal = Number(val)
    setRestInput(numVal)
    if (!isActive && isRestMode) setTimeLeft(Math.round(numVal * 60))
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      handleTimerExpiry()
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const handleTimerExpiry = () => {
    const safeRest = Number(restInput) > 0 ? Number(restInput) : 0.1
    const safeFocus = Number(focusInput) > 0 ? Number(focusInput) : 0.1

    if (!isRestMode) {
      soundFocusEnd.play().catch((e) => console.log(e))
      new Notification('TIME TO STAND UP! 🚶‍♂️', {
        body: `Starting ${safeRest}m break.`,
        silent: true
      })
      setIsRestMode(true)
      setTimeLeft(Math.round(safeRest * 60))
      setIsActive(true)
    } else {
      soundRestEnd.play().catch((e) => console.log(e))
      new Notification('BREAK OVER! 💻', {
        body: autoLoop ? 'Restarting session.' : 'Ready?',
        silent: true
      })
      setIsRestMode(false)
      setTimeLeft(Math.round(safeFocus * 60))
      setIsActive(autoLoop)
    }
  }

  return (
    <div className={`container ${isRestMode ? 'rest-bg' : 'focus-bg'}`}>
      {/* Invisible handle for dragging the frameless window */}
      <div className="drag-handle"></div>

      <div className="header-label">
        Cycle: {focusInput || 0}m Work / {restInput || 0}m Rest
      </div>

      <div className="glass-card">
        <h1 className="status-text">{isRestMode ? 'Resting' : 'Focusing'}</h1>
        <div className="timer-display">{formatTime(timeLeft)}</div>

        {!isActive && (
          <div className="settings-panel">
            <div className="input-group">
              <label>Work</label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={focusInput}
                onChange={handleFocusChange}
              />
            </div>
            <div className="input-group">
              <label>Rest</label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={restInput}
                onChange={handleRestChange}
              />
            </div>
            <div className="input-group">
              <label>Loop</label>
              <input
                type="checkbox"
                className="toggle-box"
                checked={autoLoop}
                onChange={(e) => setAutoLoop(e.target.checked)}
              />
            </div>
          </div>
        )}

        {/* 4. BUTTON STACK: Optimized for the Centered CSS alignment */}
        <div className="button-stack">
          <button
            className="btn-main"
            onClick={() => setIsActive(!isActive)}
            disabled={!isActive && (!focusInput || focusInput <= 0)}
          >
            {isActive ? 'Pause' : 'Start Engine'}
          </button>

          <button
            className="btn-reset-minimal"
            onClick={() => {
              setIsActive(false)
              setIsRestMode(false)
              setFocusInput('')
              setRestInput('')
              setTimeLeft(0)
            }}
          >
            Reset System
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
