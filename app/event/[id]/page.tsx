'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EventGroup } from '@/types'
import { getEvent, updateEvent } from '@/lib/storage'
import MemberList from '@/components/MemberList'
import PaymentList from '@/components/PaymentList'
import Statistics from '@/components/Statistics'
import Link from 'next/link'

type TabType = 'members' | 'payments' | 'stats'

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string
    const [event, setEvent] = useState<EventGroup | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('members')
    const [mounted, setMounted] = useState(false)

    const loadEvent = useCallback(() => {
        const ev = getEvent(eventId)
        if (!ev) {
            router.push('/')
            return
        }
        setEvent(ev)
    }, [eventId, router])

    useEffect(() => {
        setMounted(true)
        loadEvent()
    }, [loadEvent])

    const handleUpdateMembers = (members: EventGroup['members']) => {
        if (!event) return
        const updated = { ...event, members }
        updateEvent(updated)
        setEvent(updated)
    }

    const handleDeletePayment = (paymentId: string) => {
        if (!event) return
        const updated = {
            ...event,
            payments: event.payments.filter((p) => p.id !== paymentId),
        }
        updateEvent(updated)
        setEvent(updated)
    }

    if (!mounted || !event) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const tabs: { key: TabType; label: string; icon: string }[] = [
        { key: 'members', label: 'メンバー', icon: '👥' },
        { key: 'payments', label: '支払い', icon: '💰' },
        { key: 'stats', label: '統計', icon: '📊' },
    ]

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
                <div className="max-w-lg mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors p-1"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-white truncate">
                                {event.name}
                            </h1>
                            <p className="text-xs text-gray-500">
                                {event.members.length}人 · {event.payments.length}回の支払い
                            </p>
                        </div>
                        {event.members.length >= 2 && (
                            <Link
                                href={`/event/${eventId}/roulette`}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
                            >
                                🎰 ルーレット
                            </Link>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                                    ? 'bg-gray-700 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span className="mr-1">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6">
                {activeTab === 'members' && (
                    <MemberList
                        members={event.members}
                        onUpdate={handleUpdateMembers}
                    />
                )}
                {activeTab === 'payments' && (
                    <PaymentList
                        payments={event.payments}
                        members={event.members}
                        onDelete={handleDeletePayment}
                    />
                )}
                {activeTab === 'stats' && (
                    <Statistics
                        payments={event.payments}
                        members={event.members}
                    />
                )}
            </div>
        </div>
    )
}
