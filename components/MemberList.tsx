'use client'

import { useState } from 'react'
import { Member } from '@/types'
import { v4 as uuidv4 } from 'uuid'

type Props = {
    members: Member[]
    onUpdate: (members: Member[]) => void
}

export default function MemberList({ members, onUpdate }: Props) {
    const [newName, setNewName] = useState('')

    const handleAdd = () => {
        const name = newName.trim()
        if (!name) return
        if (members.some((m) => m.name === name)) {
            alert('同じ名前のメンバーが既に存在します')
            return
        }
        onUpdate([...members, { id: uuidv4(), name }])
        setNewName('')
    }

    const handleRemove = (id: string) => {
        onUpdate(members.filter((m) => m.id !== id))
    }

    return (
        <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                メンバー ({members.length}人)
            </h3>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="名前を入力"
                    className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                <button
                    onClick={handleAdd}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
                >
                    追加
                </button>
            </div>

            <div className="space-y-2">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between bg-gray-800/40 border border-gray-700/30 rounded-xl px-4 py-3 group"
                    >
                        <span className="text-white font-medium">{member.name}</span>
                        <button
                            onClick={() => handleRemove(member.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
