'use client'

import { useState, useEffect } from 'react'
import { EventGroup } from '@/types'
import { loadEvents, saveEvents, deleteEvent } from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'
import EventCard from '@/components/EventCard'

export default function HomePage() {
  const [events, setEvents] = useState<EventGroup[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEvents(loadEvents())
  }, [])

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return

    const newEvent: EventGroup = {
      id: uuidv4(),
      name,
      members: [],
      payments: [],
    }

    const updated = [...events, newEvent]
    setEvents(updated)
    saveEvents(updated)
    setNewName('')
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    deleteEvent(id)
    setEvents(loadEvents())
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🎰 Roulette Pay
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">ルーレットで支払いを決定</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-purple-500/25"
          >
            + 新しい会
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Create Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 space-y-4 animate-in">
            <h2 className="text-white font-semibold">新しい会を作成</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="会の名前（例: 忘年会）"
              autoFocus
              className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false)
                  setNewName('')
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-purple-500/25"
              >
                作成
              </button>
            </div>
          </div>
        )}

        {/* Event List */}
        {events.length === 0 && !showForm ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎰</div>
            <h2 className="text-xl font-bold text-white mb-2">
              会を作成しましょう
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              ルーレットで支払者を決定し、
              <br />
              割り勘記録を管理できます
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-purple-500/25"
            >
              はじめる
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
