'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Member, Payment } from '@/types'
import { getEvent, updateEvent } from '@/lib/storage'
import RouletteCanvas from '@/components/RouletteCanvas'
import PaymentForm from '@/components/PaymentForm'
import Link from 'next/link'

export default function RoulettePage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string

    const [members, setMembers] = useState<Member[]>([])
    const [eventName, setEventName] = useState('')
    const [spinning, setSpinning] = useState(false)
    const [mounted, setMounted] = useState(false)

    // 支払人数設定（デフォルト1人 = 全額支払い）
    const [payerCount, setPayerCount] = useState(1)
    const [payerCountError, setPayerCountError] = useState('')

    // 分割数設定（1人あたりの分割数、デフォルト1）
    const [slicesPerMember, setSlicesPerMember] = useState(1)

    // 複数回スピンの管理
    const [selectedPayers, setSelectedPayers] = useState<Member[]>([])
    const [currentRound, setCurrentRound] = useState(0) // 0 = まだ開始してない
    const [latestResult, setLatestResult] = useState<Member | null>(null)

    // 完了フラグ
    const [allSpinsDone, setAllSpinsDone] = useState(false)
    const [showPaymentForm, setShowPaymentForm] = useState(false)

    const loadData = useCallback(() => {
        const ev = getEvent(eventId)
        if (!ev || ev.members.length < 2) {
            router.push(`/event/${eventId}`)
            return
        }
        setMembers(ev.members)
        setEventName(ev.name)
    }, [eventId, router])

    useEffect(() => {
        setMounted(true)
        loadData()
    }, [loadData])

    const handleStartRoulette = () => {
        setPayerCountError('')

        if (payerCount < 1) {
            setPayerCountError('1人以上を指定してください')
            return
        }
        if (payerCount > members.length) {
            setPayerCountError(`メンバー数（${members.length}人）を超えています`)
            return
        }

        // リセットして1回目のスピン開始
        setSelectedPayers([])
        setLatestResult(null)
        setAllSpinsDone(false)
        setShowPaymentForm(false)
        setCurrentRound(1)
        setSpinning(true)
    }

    const handleResult = (member: Member) => {
        setLatestResult(member)
    }

    const handleSpinEnd = () => {
        setSpinning(false)
    }

    // 当選確定 → 次のスピンまたは完了
    const handleConfirmResult = () => {
        if (!latestResult) return

        const newPayers = [...selectedPayers, latestResult]
        setSelectedPayers(newPayers)

        if (newPayers.length >= payerCount) {
            // 全員選出完了
            setAllSpinsDone(true)
            setLatestResult(null)
        } else {
            // 次のスピンへ
            setLatestResult(null)
            setCurrentRound(currentRound + 1)
            setSpinning(true)
        }
    }

    // やり直し（現在のラウンドを再スピン）
    const handleRetry = () => {
        setLatestResult(null)
        setSpinning(true)
    }

    const handleSavePayment = (payment: Payment) => {
        const ev = getEvent(eventId)
        if (!ev) return

        const updated = {
            ...ev,
            payments: [...ev.payments, payment],
        }
        updateEvent(updated)

        // リセット
        setShowPaymentForm(false)
        setAllSpinsDone(false)
        setSelectedPayers([])
        setCurrentRound(0)
        setLatestResult(null)
        router.push(`/event/${eventId}`)
    }

    const handleReset = () => {
        setSelectedPayers([])
        setCurrentRound(0)
        setLatestResult(null)
        setAllSpinsDone(false)
        setShowPaymentForm(false)
        setSpinning(false)
    }

    // ルーレットに表示するメンバー（既に選ばれた人を除外 — payerCount > 1 の場合）
    const availableMembers =
        payerCount > 1
            ? members.filter((m) => !selectedPayers.some((s) => s.id === m.id))
            : members

    if (!mounted || members.length === 0) {
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
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
                    <Link
                        href={`/event/${eventId}`}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-white">🎰 ルーレット</h1>
                        <p className="text-xs text-gray-500">{eventName}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

                {/* 支払人数設定（まだスピン開始前） */}
                {currentRound === 0 && (
                    <>
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 space-y-4 animate-in">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <span className="text-xl">🎯</span> 支払人数を設定
                            </h3>
                            <p className="text-gray-400 text-sm">
                                1人の場合は当選者が全額支払い。2人以上の場合は当選者で割り勘になります。
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPayerCount(Math.max(1, payerCount - 1))}
                                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-xl transition-all active:scale-95 flex items-center justify-center"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={1}
                                    max={members.length}
                                    value={payerCount}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value, 10)
                                        if (!isNaN(v)) setPayerCount(v)
                                    }}
                                    className="w-20 bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                />
                                <button
                                    onClick={() =>
                                        setPayerCount(Math.min(members.length, payerCount + 1))
                                    }
                                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-xl transition-all active:scale-95 flex items-center justify-center"
                                >
                                    +
                                </button>
                                <span className="text-gray-400 text-sm">
                                    人 / {members.length}人中
                                </span>
                            </div>

                            {/* 分割数設定 */}
                            <div className="border-t border-gray-700/50 pt-4">
                                <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                                    <span className="text-xl">🎰</span> ルーレット分割数
                                </h3>
                                <p className="text-gray-400 text-sm mb-3">
                                    1人あたりの分割数を設定します。数が大きいほどルーレットが細かく分割されます。
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSlicesPerMember(Math.max(1, slicesPerMember - 1))}
                                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-xl transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        max={5}
                                        value={slicesPerMember}
                                        onChange={(e) => {
                                            const v = parseInt(e.target.value, 10)
                                            if (!isNaN(v) && v >= 1 && v <= 5) setSlicesPerMember(v)
                                        }}
                                        className="w-20 bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                    />
                                    <button
                                        onClick={() => setSlicesPerMember(Math.min(5, slicesPerMember + 1))}
                                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-xl transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                    <span className="text-gray-400 text-sm">
                                        分割 / 1人
                                    </span>
                                </div>
                                <p className="text-gray-500 text-xs mt-2">
                                    総分割数: {members.length * slicesPerMember}
                                </p>
                            </div>

                            {payerCountError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                    <p className="text-red-400 text-sm">{payerCountError}</p>
                                </div>
                            )}
                            <button
                                onClick={handleStartRoulette}
                                className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-95"
                            >
                                🎲 ルーレットを回す
                            </button>
                        </div>
                    </>
                )}

                {/* ルーレット進行中 */}
                {currentRound > 0 && !allSpinsDone && !showPaymentForm && (
                    <>
                        {/* 進捗表示 */}
                        {payerCount > 1 && (
                            <div className="flex items-center justify-between bg-gray-800/40 border border-gray-700/30 rounded-xl px-4 py-3">
                                <span className="text-gray-400 text-sm">
                                    第 {currentRound} / {payerCount} 回目
                                </span>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: payerCount }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-3 h-3 rounded-full ${i < selectedPayers.length
                                                ? 'bg-purple-500'
                                                : i === selectedPayers.length
                                                    ? 'bg-purple-400 animate-pulse'
                                                    : 'bg-gray-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 既に選ばれた人（複数回モード） */}
                        {selectedPayers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedPayers.map((p) => (
                                    <span
                                        key={p.id}
                                        className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-300 text-sm px-3 py-1.5 rounded-lg font-medium"
                                    >
                                        ✓ {p.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* ルーレット */}
                        {availableMembers.length >= 2 && (
                            <RouletteCanvas
                                members={availableMembers}
                                onResult={handleResult}
                                spinning={spinning}
                                onSpinEnd={handleSpinEnd}
                                slicesPerMember={slicesPerMember}
                            />
                        )}

                        {/* 回転中 */}
                        {spinning && (
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-gray-400">
                                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                    回転中...
                                </div>
                            </div>
                        )}

                        {/* 結果表示 */}
                        {latestResult && !spinning && (
                            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-6 text-center space-y-4 animate-in">
                                <div className="text-4xl mb-2">🎉</div>
                                <h2 className="text-2xl font-bold text-white">
                                    {latestResult.name}
                                </h2>
                                <p className="text-purple-300 text-sm">
                                    {payerCount === 1
                                        ? 'が当選しました！全額このメンバーが支払います。'
                                        : `が当選しました！（${currentRound}人目 / ${payerCount}人）`}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRetry}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
                                    >
                                        やり直す
                                    </button>
                                    <button
                                        onClick={handleConfirmResult}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-green-500/25"
                                    >
                                        {currentRound < payerCount ? '✓ 確定 → 次へ' : '✓ 確定'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* 全員選出完了 */}
                {allSpinsDone && !showPaymentForm && (
                    <div className="space-y-4 animate-in">
                        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-6 text-center space-y-4">
                            <div className="text-4xl mb-2">🎊</div>
                            <h2 className="text-xl font-bold text-white">
                                {payerCount === 1 ? '支払者が決定！' : '支払者が全員決定！'}
                            </h2>
                            <div className="flex flex-wrap justify-center gap-2">
                                {selectedPayers.map((p, i) => (
                                    <span
                                        key={p.id}
                                        className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-base font-bold ${i === selectedPayers.length - 1
                                            ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                                            : 'bg-gray-700/50 text-gray-300'
                                            }`}
                                    >
                                        {p.name}
                                        {payerCount > 1 && i === selectedPayers.length - 1 && (
                                            <span className="text-xs text-purple-400 ml-1">+端数</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {payerCount === 1 ? (
                                <p className="text-gray-400 text-sm">
                                    {selectedPayers[0]?.name} が全額支払います
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm">
                                    {selectedPayers.length}人で割り勘 · 端数は {selectedPayers[selectedPayers.length - 1]?.name} に加算
                                </p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
                                >
                                    最初から
                                </button>
                                <button
                                    onClick={() => setShowPaymentForm(true)}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-green-500/25"
                                >
                                    💰 記録する
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Form */}
                {showPaymentForm && selectedPayers.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 animate-in">
                        <h3 className="text-white font-bold text-lg mb-4">支払いを記録</h3>
                        <PaymentForm
                            selectedMembers={selectedPayers}
                            lastStoppedMember={selectedPayers[selectedPayers.length - 1]}
                            onSave={handleSavePayment}
                            onCancel={() => {
                                setShowPaymentForm(false)
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
