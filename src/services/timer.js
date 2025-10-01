// Timer service for Pomodoro functionality
export class PomodoroTimer {
  constructor() {
    this.workDuration = 25 * 60 // 25 minutes in seconds
    this.breakDuration = 5 * 60 // 5 minutes in seconds
    this.timeRemaining = this.workDuration
    this.isRunning = false
    this.isWorkSession = true
    this.intervalId = null
    this.callbacks = {
      onTick: null,
      onSessionComplete: null,
      onStateChange: null,
    }
  }

  // Set callback functions
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Start the timer
  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  // Pause the timer
  pause() {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  // Reset the timer
  reset() {
    this.pause()
    this.isWorkSession = true
    this.timeRemaining = this.workDuration

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  // Timer tick function
  tick() {
    this.timeRemaining--

    this.callbacks.onTick?.({
      timeRemaining: this.timeRemaining,
      isWorkSession: this.isWorkSession,
    })

    if (this.timeRemaining <= 0) {
      this.completeSession()
    }
  }

  // Complete current session and switch to next
  completeSession() {
    this.pause()

    const completedSession = {
      type: this.isWorkSession ? "work" : "break",
      duration: this.isWorkSession ? this.workDuration : this.breakDuration,
      completedAt: new Date().toISOString(),
    }

    this.callbacks.onSessionComplete?.(completedSession)
  }

  // Switch to next session (work -> break or break -> work)
  switchToNextSession() {
    this.isWorkSession = !this.isWorkSession
    this.timeRemaining = this.isWorkSession ? this.workDuration : this.breakDuration

    this.callbacks.onStateChange?.({
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      timeRemaining: this.timeRemaining,
    })
  }

  // Format time for display (mm:ss)
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Get current state
  getState() {
    return {
      timeRemaining: this.timeRemaining,
      isRunning: this.isRunning,
      isWorkSession: this.isWorkSession,
      formattedTime: PomodoroTimer.formatTime(this.timeRemaining),
    }
  }

  // Set custom durations (in minutes)
  setDurations(workMinutes, breakMinutes) {
    this.workDuration = workMinutes * 60
    this.breakDuration = breakMinutes * 60

    // Reset to new work duration if not currently running
    if (!this.isRunning) {
      this.timeRemaining = this.isWorkSession ? this.workDuration : this.breakDuration
    }
  }
}

// Create singleton instance
export const pomodoroTimer = new PomodoroTimer()
