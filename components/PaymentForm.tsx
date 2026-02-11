'use client'

import { useState } from 'react'
import { Member, Payment, PaymentShare } from '@/types'
import { calculateShares } from '@/lib/calculation'
import { v4 as uuidv4 } from 'uuid'

type Props = {
    selectedMembers: Member[]     // ルーレットで選ばれたメンバー（1人以上）
    lastStoppedMember: Member     // 最後にルーレットで当たった人（端数負担）
    onSave: (payment: Payment) => void
    onCancel: () => void
}

export default function PaymentForm({
    selectedMembers,
    lastStoppedMember,
    onSave,
    onCancel,
}: Props) {
    const [amount, setAmount] = useState('')
    const [memo, setMemo] = useState('')
    const [error, setError] = useState('')

    const handleSave = () => {
        setError('')

        const numAmount = parseInt(amount, 10)
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            setError('正しい金額を入力してください（1円以上の整数）')
            return
        }

        if (!Number.isInteger(numAmount)) {
            setError('金額は整数で入力してください')
            return
        }

        const shares: PaymentShare[] = calculateShares(
            numAmount,
            selectedMembers,
            lastStoppedMember.id
        )

        const payment: Payment = {
            id: uuidv4(),
            totalAmount: numAmount,
            memo: memo.trim(),
            date: new Date().toISOString().split('T')[0],
            shares,
        }

        onSave(payment)
    }

    const isSinglePayer = selectedMembers.length === 1

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    合計金額
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        ¥
                    </span>
                    <input
                        type="number"
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl pl-8 pr-4 py-3.5 text-white text-xl font-bold placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    メモ
                </label>
                <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="例: ランチ、飲み会"
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
            </div>

            {/* 支払者表示 */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-2">
                <p className="text-purple-300 text-sm font-medium">
                    {isSinglePayer ? '🎯 支払者' : `🎯 支払者 (${selectedMembers.length}人で割り勘)`}
                </p>
                <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((m) => (
                        <span
                            key={m.id}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${m.id === lastStoppedMember.id
                                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                                : 'bg-gray-700/50 text-gray-300'
                                }`}
                        >
                            {m.name}
                            {!isSinglePayer && m.id === lastStoppedMember.id && (
                                <span className="text-xs text-purple-400">+端数</span>
                            )}
                        </span>
                    ))}
                </div>
                {isSinglePayer ? (
                    <p className="text-gray-400 text-xs">
                        全額このメンバーが支払います
                    </p>
                ) : (
                    <p className="text-gray-400 text-xs">
                        端数は最後に当選した {lastStoppedMember.name} に加算されます
                    </p>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3.5 rounded-xl font-medium transition-all duration-200 active:scale-95"
                >
                    キャンセル
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-purple-500/25"
                >
                    記録する
                </button>
            </div>
        </div>
    )
}
