export type Member = {
  id: string
  name: string
}

export type PaymentShare = {
  memberId: string
  amount: number
}

export type Payment = {
  id: string
  totalAmount: number
  memo: string
  date: string
  shares: PaymentShare[]
}

export type EventGroup = {
  id: string
  name: string
  members: Member[]
  payments: Payment[]
}
