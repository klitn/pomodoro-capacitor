"use client"

import { useState, useEffect } from "react"
import { pomodoroTimer, PomodoroTimer } from "../services/timer.js"
import { notificationService } from "../services/notifications.js"
import { storageService } from "../services/storage.js"
import SessionHistory from "./SessionHistory.jsx"
import Settings from "./Settings.jsx"
// React Icons
import { FaPlay, FaPause, FaStop, FaHistory, FaCog } from "react-icons/fa"
import { MdWork, MdCoffee } from "react-icons/md"
import { AiOutlineClockCircle } from "react-icons/ai"

const TimerComponent = () => {
  const [timerState, setTimerState] = useState(pomodoroTimer.getState())
  const [stats, setStats] = useState(null) // Initialize as null during SSR
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Initialize stats on client side only
  useEffect(() => {
    setStats(storageService.getStats())
  }, [])

  useEffect(() => {
    // Set up timer callbacks
    pomodoroTimer.setCallbacks({
      onTick: (data) => {
        setTimerState((prev) => ({
          ...prev,
          timeRemaining: data.timeRemaining,
          formattedTime: PomodoroTimer.formatTime(data.timeRemaining),
        }))
      },
      onSessionComplete: (completedSession) => {
        // Save session to storage
        storageService.saveSession(completedSession)
        setStats(storageService.getStats())

        // Handle notification and user choice
        notificationService.handleSessionComplete(
          completedSession.type,
          () => {
            // Continue to next session
            pomodoroTimer.switchToNextSession()
            pomodoroTimer.start()
          },
          () => {
            // Stop timer
            pomodoroTimer.reset()
          },
        )
      },
      onStateChange: (state) => {
        setTimerState((prev) => ({
          ...prev,
          ...state,
          formattedTime: PomodoroTimer.formatTime(state.timeRemaining),
        }))
      },
    })

    // Cleanup on unmount
    return () => {
      pomodoroTimer.pause()
    }
  }, [])

  const handleStart = () => {
    pomodoroTimer.start()
  }

  const handlePause = () => {
    pomodoroTimer.pause()
  }

  const handleReset = async () => {
    const shouldReset = await notificationService.showDialog(
      "Reset Timer",
      "Are you sure you want to reset the current session?",
      ["Cancel", "Reset"],
    )

    if (shouldReset) {
      pomodoroTimer.reset()
    }
  }

  const getSessionTypeText = () => {
    return timerState.isWorkSession ? "Phiên Làm Việc" : "Giờ Nghỉ"
  }

  const getSessionIcon = () => {
    return timerState.isWorkSession ? <MdWork className="inline mr-2" /> : <MdCoffee className="inline mr-2" />
  }

  const getSessionTypeColor = () => {
    return timerState.isWorkSession ? "text-primary" : "text-secondary"
  }

  const getProgressPercentage = () => {
    const totalTime = timerState.isWorkSession ? 25 * 60 : 5 * 60
    const elapsed = totalTime - timerState.timeRemaining
    return (elapsed / totalTime) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <h1 className="text-4xl font-bold gradient-title mb-3 relative glow-effect">
              <AiOutlineClockCircle className="inline mr-3 text-blue-600 glow-effect" />
              Bộ Đếm Pomodoro
            </h1>
          </div>
          

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setShowHistory(true)}
              className="text-sm text-text-secondary hover:text-text transition-colors flex items-center gap-1"
            >
              <FaHistory /> Lịch Sử
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm text-text-secondary hover:text-text transition-colors flex items-center gap-1"
            >
              <FaCog /> Cài Đặt
            </button>
          </div>
        </div>

        {/* Main Timer Card */}
        <div className="bg-surface rounded-2xl shadow-lg p-8 mb-6">
          {/* Session Type */}
          <div className="text-center mb-6">
            <h2 className={`text-xl font-semibold ${getSessionTypeColor()}`}>
              {getSessionIcon()}
              {getSessionTypeText()}
            </h2>
          </div>

          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                className={timerState.isWorkSession ? "text-primary" : "text-secondary"}
                strokeLinecap="round"
              />
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-text">{timerState.formattedTime}</div>
                <div className="text-sm text-text-secondary mt-1">
                  {timerState.isRunning ? "Đang Chạy" : "Tạm Dừng"}
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!timerState.isRunning ? (
              <button onClick={handleStart} className="btn btn-primary flex-1 max-w-32 flex items-center justify-center gap-2">
                <FaPlay /> Bắt Đầu
              </button>
            ) : (
              <button onClick={handlePause} className="btn btn-accent flex-1 max-w-32 flex items-center justify-center gap-2">
                <FaPause /> Tạm Dừng
              </button>
            )}

            <button onClick={handleReset} className="btn btn-outline flex-1 max-w-32 flex items-center justify-center gap-2">
              <FaStop /> Đặt Lại
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-surface rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
             Tiến Độ Hôm Nay
          </h3>

          {stats ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    <MdWork className="text-lg" />
                    {stats.today.workSessions}
                  </div>
                  <div className="text-sm text-text-secondary">Phiên Làm Việc</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary flex items-center justify-center gap-1">
                    <MdCoffee className="text-lg" />
                    {stats.today.breakSessions}
                  </div>
                  <div className="text-sm text-text-secondary">Lần Nghỉ</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-text">{stats.today.sessions} Tổng Phiên</div>
                  <div className="text-sm text-text-secondary">
                    {Math.round(stats.today.workSessions * 25)} phút tập trung hôm nay
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-text-secondary">
              <div className="text-lg">Đang tải thống kê...</div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => {
              pomodoroTimer.switchToNextSession()
            }}
            className="text-sm text-text-secondary hover:text-text transition-colors"
            disabled={timerState.isRunning}
          >
            Switch to {timerState.isWorkSession ? "Break" : "Work"}
          </button>
        </div>
      </div>

      {/* Modal components */}
      {showHistory && <SessionHistory onClose={() => setShowHistory(false)} />}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default TimerComponent
