'use client'

import { EventGroup } from '@/types'
import Link from 'next/link'

type Props = {
    event: EventGroup
    onDelete: (id: string) => void
}

export default function EventCard({ event, onDelete }: Props) {
    const totalSpent = event.payments.reduce((sum, p) => sum + p.totalAmount, 0)

    return (
        <div className="relative group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <Link href={`/event/${event.id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white truncate pr-8">{event.name}</h3>
                    <span className="flex-shrink-0 bg-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-full font-medium">
                        {event.members.length}人
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{event.payments.length}回</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>¥{totalSpent.toLocaleString()}</span>
                    </div>
                </div>
            </Link>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (confirm(`「${event.name}」を削除しますか？`)) {
                        onDelete(event.id)
                    }
                }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 p-1"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    )
}
