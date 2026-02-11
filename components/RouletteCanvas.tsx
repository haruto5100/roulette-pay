'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Member } from '@/types'

type Props = {
    members: Member[]
    onResult: (member: Member) => void
    spinning: boolean
    onSpinEnd: () => void
    slicesPerMember?: number  // 1人あたりの分割数（デフォルト1）
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

export default function RouletteCanvas({
    members,
    onResult,
    spinning,
    onSpinEnd,
    slicesPerMember = 1,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [rotation, setRotation] = useState(0)
    const animationRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)
    const totalRotationRef = useRef<number>(0)
    const baseRotationRef = useRef<number>(0)

    const draw = useCallback(
        (currentRotation: number) => {
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const dpr = window.devicePixelRatio || 1
            const displaySize = Math.min(canvas.parentElement?.clientWidth || 320, 360)
            canvas.style.width = `${displaySize}px`
            canvas.style.height = `${displaySize}px`
            canvas.width = displaySize * dpr
            canvas.height = displaySize * dpr
            ctx.scale(dpr, dpr)

            const cx = displaySize / 2
            const cy = displaySize / 2
            const radius = displaySize / 2 - 10

            // 総分割数 = メンバー数 × 1人あたりの分割数
            const totalSlices = members.length * slicesPerMember
            const sliceAngle = (2 * Math.PI) / totalSlices

            ctx.clearRect(0, 0, displaySize, displaySize)

            // Shadow
            ctx.save()
            ctx.beginPath()
            ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2)
            ctx.shadowColor = 'rgba(139, 92, 246, 0.3)'
            ctx.shadowBlur = 20
            ctx.fillStyle = 'transparent'
            ctx.fill()
            ctx.restore()

            // Draw slices - 交互に配置（青、橙、紫、青、橙、紫...）
            for (let i = 0; i < totalSlices; i++) {
                // 交互に配置: i番目のスライスは (i % members.length) 番目のメンバー
                const memberIndex = i % members.length
                const member = members[memberIndex]

                const startAngle = i * sliceAngle + currentRotation
                const endAngle = startAngle + sliceAngle

                // Draw slice
                ctx.beginPath()
                ctx.moveTo(cx, cy)
                ctx.arc(cx, cy, radius, startAngle, endAngle)
                ctx.closePath()
                ctx.fillStyle = COLORS[memberIndex % COLORS.length]
                ctx.fill()
                ctx.strokeStyle = 'rgba(0,0,0,0.3)'
                ctx.lineWidth = 2
                ctx.stroke()

                // Draw text - 各メンバーの最初のスライスにのみ表示
                // slicesPerMemberが3で3人なら、0,3,6番目に表示（各メンバーの最初）
                const memberSliceCount = Math.floor(i / members.length) // このメンバーの何番目のスライスか
                if (memberSliceCount === 0) {
                    ctx.save()
                    ctx.translate(cx, cy)
                    ctx.rotate(startAngle + sliceAngle / 2)
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillStyle = '#fff'
                    ctx.font = `bold ${Math.max(12, Math.min(16, 200 / members.length))}px sans-serif`
                    ctx.shadowColor = 'rgba(0,0,0,0.5)'
                    ctx.shadowBlur = 3
                    ctx.fillText(member.name, radius * 0.6, 0)
                    ctx.restore()
                }
            }

            // Center circle
            ctx.beginPath()
            ctx.arc(cx, cy, 20, 0, Math.PI * 2)
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
            gradient.addColorStop(0, '#c084fc')
            gradient.addColorStop(1, '#7c3aed')
            ctx.fillStyle = gradient
            ctx.fill()
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 3
            ctx.stroke()

            // Arrow pointer (top - pointing down)
            ctx.beginPath()
            ctx.moveTo(cx, 5)
            ctx.lineTo(cx - 12, 0)
            ctx.lineTo(cx + 12, 0)
            ctx.closePath()
            ctx.fillStyle = '#ef4444'
            ctx.fill()
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1
            ctx.stroke()

            // Arrow body
            ctx.beginPath()
            ctx.moveTo(cx, 0)
            ctx.lineTo(cx, 18)
            ctx.strokeStyle = '#ef4444'
            ctx.lineWidth = 3
            ctx.stroke()
        },
        [members, slicesPerMember]
    )

    // Spin animation
    useEffect(() => {
        if (!spinning) return

        const DURATION = 20000 // 20 seconds
        const TOTAL_ROTATION = Math.PI * 16 + Math.random() * Math.PI * 12 // 8-14 full rotations

        startTimeRef.current = performance.now()
        totalRotationRef.current = TOTAL_ROTATION
        baseRotationRef.current = rotation

        const animate = (now: number) => {
            const elapsed = now - startTimeRef.current
            const progress = Math.min(elapsed / DURATION, 1)

            // Ease out quint — last few seconds get very slow
            const eased = 1 - Math.pow(1 - progress, 5)
            const currentRotation =
                baseRotationRef.current + totalRotationRef.current * eased

            setRotation(currentRotation)
            draw(currentRotation)

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate)
            } else {
                // Determine result
                // 針は上部（0度の位置）を指している
                // ルーレットは時計回りに回転している
                // currentRotationは累積回転角度

                const totalSlices = members.length * slicesPerMember
                const sliceAngle = (Math.PI * 2) / totalSlices

                // 正規化された回転角度（0〜2π）
                const normalizedRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

                // 針の位置は上部（-π/2 または 3π/2の位置）
                // ルーレットの最初のスライスは3時の位置（0度）から始まる
                // 針が指しているスライスを計算
                // 針の角度 = 3π/2（上部）
                // ルーレットが回転した分を引く
                const pointerAngle = (Math.PI * 1.5 - normalizedRotation + Math.PI * 2) % (Math.PI * 2)

                // どのスライスを指しているか
                const selectedSliceIndex = Math.floor(pointerAngle / sliceAngle) % totalSlices

                // 交互配置なので、スライスインデックス % メンバー数 = メンバーインデックス
                const selectedMemberIndex = selectedSliceIndex % members.length

                onResult(members[selectedMemberIndex])
                onSpinEnd()
            }
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spinning])

    // Initial draw
    useEffect(() => {
        draw(rotation)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [members, slicesPerMember])

    return (
        <div className="flex justify-center">
            <canvas
                ref={canvasRef}
                className="max-w-full"
            />
        </div>
    )
}
