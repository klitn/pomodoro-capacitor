"use client"

import { useState } from "react"
import { storageService } from "../services/storage.js"
import { pomodoroTimer } from "../services/timer.js"
// React Icons
import { FaCog, FaTimes, FaClock, FaVolumeUp, FaSave, FaUndo, FaMobileAlt, FaBell, FaPlay } from "react-icons/fa"
import { MdWork, MdCoffee, MdVibration, MdNotifications, MdMusicNote } from "react-icons/md"
import { IoVolumeHigh, IoMusicalNotes } from "react-icons/io5"
import { AiOutlineSound } from "react-icons/ai"

const Settings = ({ onClose }) => {
  const [settings, setSettings] = useState(storageService.getSettings())
  const [tempSettings, setTempSettings] = useState(settings)

  const handleSave = () => {
    storageService.saveSettings(tempSettings)
    setSettings(tempSettings)

    // Update timer durations
    pomodoroTimer.setDurations(tempSettings.workDuration, tempSettings.breakDuration)

    onClose()
  }

  const handleReset = () => {
    const defaultSettings = {
      workDuration: 25,
      breakDuration: 5,
      soundEnabled: true,
      vibrationEnabled: true,
      soundType: "beep",
    }
    setTempSettings(defaultSettings)
  }

  // Available sound options
  const soundOptions = [
    { value: "beep", label: "Tiếng Bíp", icon: <AiOutlineSound className="text-blue-500" />, file: "beep.wav" },
    { value: "bell", label: "Tiếng Chuông", icon: <FaBell className="text-yellow-500" />, file: "bell.wav" },
    { value: "chime", label: "Tiếng Chime", icon: <IoMusicalNotes className="text-purple-500" />, file: "chime.wav" },
    { value: "ding", label: "Tiếng Ding", icon: <IoVolumeHigh className="text-green-500" />, file: "ding.wav" },
    { value: "notification", label: "Thông Báo", icon: <MdNotifications className="text-red-500" />, file: "notification.wav" },
  ]

  // Play preview sound
  const playPreviewSound = (soundType) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configure sound based on selected type
      switch (soundType) {
        case "beep":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          break
        case "bell":
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          break
        case "chime":
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          break
        case "ding":
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
          break
        case "notification":
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
          break
        default:
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      }

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.6)
    } catch (e) {
      console.log("Cannot play preview sound:", e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <FaCog className="text-primary" /> Cài Đặt
            </h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors p-2 hover:bg-gray-100 rounded-full">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="p-6 space-y-6">
          {/* Timer Durations */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <FaClock className="text-primary" /> Thời Gian Đếm
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text mb-2 flex items-center gap-2">
                  <MdWork className="text-primary" /> Phiên Làm Việc (phút)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.workDuration}
                  onChange={(e) =>
                    setTempSettings((prev) => ({
                      ...prev,
                      workDuration: Number.parseInt(e.target.value) || 25,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text mb-2 flex items-center gap-2">
                  <MdCoffee className="text-secondary" /> Thời Gian Nghỉ (phút)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempSettings.breakDuration}
                  onChange={(e) =>
                    setTempSettings((prev) => ({
                      ...prev,
                      breakDuration: Number.parseInt(e.target.value) || 5,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <FaVolumeUp className="text-primary" /> Thông Báo
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={tempSettings.soundEnabled}
                  onChange={(e) =>
                    setTempSettings((prev) => ({
                      ...prev,
                      soundEnabled: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <FaVolumeUp className="text-gray-400" />
                <span className="text-text">Bật âm thanh thông báo</span>
              </label>

              {/* Sound Selection */}
              {tempSettings.soundEnabled && (
                <div className="ml-7 space-y-2">
                  <label className="text-sm font-medium text-text flex items-center gap-2">
                    <MdMusicNote className="text-primary" />
                    Chọn âm thanh:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={tempSettings.soundType || "beep"}
                      onChange={(e) => {
                        setTempSettings((prev) => ({
                          ...prev,
                          soundType: e.target.value,
                        }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      {soundOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => playPreviewSound(tempSettings.soundType || "beep")}
                      className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                    >
                      <FaPlay className="text-xs" />
                      Nghe thử
                    </button>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={tempSettings.vibrationEnabled}
                  onChange={(e) =>
                    setTempSettings((prev) => ({
                      ...prev,
                      vibrationEnabled: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <MdVibration className="text-gray-400" />
                <span className="text-text">Bật rung</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button onClick={handleReset} className="flex-1 btn btn-outline flex items-center justify-center gap-2">
            <FaUndo /> Đặt Lại Mặc Định
          </button>
          <button onClick={handleSave} className="flex-1 btn btn-primary flex items-center justify-center gap-2">
            <FaSave /> Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
