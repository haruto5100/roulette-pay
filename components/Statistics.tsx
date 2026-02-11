'use client'

import { Payment, Member } from '@/types'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

type Props = {
    payments: Payment[]
    members: Member[]
}

const COLORS = [
    '#8b5cf6',
    '#06b6d4',
    '#f59e0b',
    '#ef4444',
    '#10b981',
    '#ec4899',
    '#6366f1',
    '#f97316',
    '#14b8a6',
    '#a855f7',
]

export default function Statistics({ payments, members }: Props) {
    if (payments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>統計データがありません</p>
            </div>
        )
    }

    // sharesから集計
    const memberStats: Record<string, { total: number; count: number }> = {}
    members.forEach((m) => {
        memberStats[m.id] = { total: 0, count: 0 }
    })

    payments.forEach((p) => {
        p.shares.forEach((share) => {
            if (memberStats[share.memberId]) {
                memberStats[share.memberId].total += share.amount
                memberStats[share.memberId].count += 1
            }
        })
    })

    // ランキング用データ（支払総額の多い順）
    const rankingData = members
        .map((m) => ({
            id: m.id,
            name: m.name,
            total: memberStats[m.id]?.total || 0,
            count: memberStats[m.id]?.count || 0,
        }))
        .filter((d) => d.total > 0)
        .sort((a, b) => b.total - a.total)

    const barData = members
        .map((m) => ({
            name: m.name,
            回数: memberStats[m.id]?.count || 0,
        }))
        .filter((d) => d.回数 > 0)

    return (
        <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                統計
            </h3>

            {/* ランキング形式 */}
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-4 font-medium">メンバー別支払総額</p>
                <div className="space-y-3">
                    {rankingData.map((member, index) => {
                        const memberIndex = members.findIndex(m => m.id === member.id)
                        const color = COLORS[memberIndex % COLORS.length]
                        const isFirst = index === 0
                        const isSecond = index === 1
                        const isThird = index === 2

                        return (
                            <div
                                key={member.id}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isFirst
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30'
                                        : isSecond
                                            ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border border-gray-400/30'
                                            : isThird
                                                ? 'bg-gradient-to-r from-orange-700/20 to-orange-800/10 border border-orange-700/30'
                                                : 'bg-gray-700/30 border border-gray-600/20'
                                    }`}
                            >
                                {/* 順位 */}
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    {isFirst ? (
                                        <span className="text-2xl">🥇</span>
                                    ) : isSecond ? (
                                        <span className="text-2xl">🥈</span>
                                    ) : isThird ? (
                                        <span className="text-2xl">🥉</span>
                                    ) : (
                                        <span className="text-gray-400 font-bold text-sm">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>

                                {/* カラーインジケーター */}
                                <div
                                    className="w-1 h-8 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                />

                                {/* 名前 */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {member.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {member.count}回の支払い
                                    </p>
                                </div>

                                {/* 金額 */}
                                <div className="flex-shrink-0 text-right">
                                    <p className="text-white font-bold text-lg">
                                        ¥{member.total.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 棒グラフ */}
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-3 font-medium">支払回数</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: '#fff',
                            }}
                            itemStyle={{
                                color: '#fff',
                            }}
                            labelStyle={{
                                color: '#fff',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="回数" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
