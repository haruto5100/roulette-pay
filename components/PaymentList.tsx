'use client'

import { Payment, Member } from '@/types'

type Props = {
    payments: Payment[]
    members: Member[]
    onDelete: (paymentId: string) => void
}

export default function PaymentList({ payments, members, onDelete }: Props) {
    const getMemberName = (id: string) => {
        return members.find((m) => m.id === id)?.name || '不明'
    }

    if (payments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>まだ支払い記録がありません</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                支払い履歴 ({payments.length}件)
            </h3>

            {[...payments].reverse().map((payment) => (
                <div
                    key={payment.id}
                    className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4 space-y-3"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-white font-bold text-lg">
                                ¥{payment.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-gray-400 text-sm">{payment.memo || 'メモなし'}</p>
                            <p className="text-gray-500 text-xs mt-1">{payment.date}</p>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('この支払い記録を削除しますか？')) {
                                    onDelete(payment.id)
                                }
                            }}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {payment.shares.map((share) => (
                            <span
                                key={share.memberId}
                                className="inline-flex items-center gap-1 bg-gray-700/50 text-gray-300 text-sm px-3 py-1 rounded-lg"
                            >
                                <span>{getMemberName(share.memberId)}</span>
                                <span className="text-purple-400 font-semibold">¥{share.amount.toLocaleString()}</span>
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
