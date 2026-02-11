import { Member, PaymentShare } from '@/types'

export function calculateShares(
    totalAmount: number,
    selectedMembers: Member[],
    lastStoppedMemberId: string
): PaymentShare[] {
    const count = selectedMembers.length

    if (count === 1) {
        return [
            {
                memberId: selectedMembers[0].id,
                amount: totalAmount,
            },
        ]
    }

    const baseAmount = Math.floor(totalAmount / count)
    const remainder = totalAmount % count

    return selectedMembers.map((member) => ({
        memberId: member.id,
        amount:
            member.id === lastStoppedMemberId ? baseAmount + remainder : baseAmount,
    }))
}
