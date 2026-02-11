import { Member } from '@/types'

export function selectRandomMembers(
    members: Member[],
    count: number
): Member[] {
    const shuffled = [...members].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}
