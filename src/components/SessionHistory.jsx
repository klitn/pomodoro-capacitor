"use client"

import { useState, useEffect } from "react"
import { storageService } from "../services/storage.js"
// React Icons
import { FaHistory, FaTimes, FaFilter, FaTrash, FaClock, FaCalendarDay, FaCalendarWeek, FaList } from "react-icons/fa"
import { MdWork, MdCoffee } from "react-icons/md"

const SessionHistory = ({ onClose }) => {
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState("today") // 'today', 'week', 'all'
  const [stats, setStats] = useState(storageService.getStats())

  useEffect(() => {
    loadSessions()
  }, [filter])

  const loadSessions = () => {
    let filteredSessions = []
    const allSessions = storageService.getSessions()

    switch (filter) {
      case "today":
        filteredSessions = storageService.getTodaySessions()
        break
      case "week":
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filteredSessions = allSessions.filter((session) => new Date(session.completedAt) >= weekAgo)
        break
      case "all":
      default:
        filteredSessions = allSessions
        break
    }

    // Sort by most recent first
    filteredSessions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    setSessions(filteredSessions)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Hôm nay ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hôm qua ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const getSessionIcon = (type) => {
    return type === "work" ? "🍅" : "☕"
  }

  const clearAllSessions = async () => {
    const shouldClear = window.confirm("Are you sure you want to clear all session history? This cannot be undone.")
    if (shouldClear) {
      storageService.clearAll()
      setSessions([])
      setStats(storageService.getStats())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <FaHistory className="text-primary" /> Lịch Sử Phiên
            </h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors p-2 hover:bg-gray-100 rounded-full">
              <FaTimes />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter("today")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === "today"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              <FaCalendarDay /> Hôm Nay
            </button>
            <button
              onClick={() => setFilter("week")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === "week"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              <FaCalendarWeek /> Tuần Này
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              <FaList /> Tất Cả
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                <MdWork />
                {filter === "today"
                  ? stats.today.workSessions
                  : filter === "week"
                    ? sessions.filter((s) => s.type === "work").length
                    : stats.total.workSessions}
              </div>
              <div className="text-xs text-text-secondary">Làm Việc</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary flex items-center justify-center gap-1">
                <MdCoffee />
                {filter === "today"
                  ? stats.today.breakSessions
                  : filter === "week"
                    ? sessions.filter((s) => s.type === "break").length
                    : stats.total.breakSessions}
              </div>
              <div className="text-xs text-text-secondary">Nghỉ</div>
            </div>
            <div>
              <div className="text-lg font-bold text-black flex items-center justify-center gap-1">
                <FaClock />
                {filter === "today" ? stats.today.sessions : filter === "week" ? sessions.length : stats.total.sessions}
              </div>
              <div className="text-xs text-text-secondary">Tổng</div>
            </div>
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {sessions.length === 0 ? (
            <div className="p-8 text-center">
              <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-text-secondary">Không tìm thấy phiên nào</p>
              <p className="text-sm text-text-secondary mt-1">Hoàn thành một số phiên Pomodoro để xem chúng ở đây</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl">
                    {session.type === "work" ? <MdWork className="text-primary" /> : <MdCoffee className="text-secondary" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-text">
                      {session.type === "work" ? "Phiên Làm Việc" : "Giờ Nghỉ"}
                    </div>
                    <div className="text-sm text-text-secondary flex items-center gap-1">
                      <FaClock className="text-xs" />
                      {Math.round(session.duration / 60)} phút
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-secondary">{formatDate(session.completedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={clearAllSessions}
              className="w-full text-sm text-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2 py-2 hover:bg-red-50 rounded-lg"
            >
              <FaTrash /> Xóa Tất Cả Lịch Sử
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionHistory
