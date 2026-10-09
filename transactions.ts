'use client'

import { useEffect, useSyncExternalStore } from 'react'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'

export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: string
  date: string
  amount: number
  category: string
  type: TransactionType
  memo: string
  createdAt: number
}

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>

type TransactionRow = {
  id: string
  date: string
  amount: number
  category: string
  type: TransactionType
  memo: string
  created_at: string
}

export const CATEGORIES: Record<TransactionType, string[]> = {
  expense: ['食費', '日用品', '交通費', '娯楽', '衣服・美容', '医療', '通信費', '住居', 'その他'],
  income: ['給料', 'お小遣い', '臨時収入', 'その他'],
}

const KEY = 'transactions'
const COLUMNS = 'id, date, amount, category, type, memo, created_at'

function fromRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    category: row.category,
    type: row.type,
    memo: row.memo ?? '',
    createdAt: new Date(row.created_at).getTime(),
  }
}

async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await createClient()
    .from('transactions')
    .select(COLUMNS)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as TransactionRow[]).map(fromRow)
}

export function useTransactions() {
  const swr = useSWR(KEY, fetchTransactions, { revalidateOnFocus: true })

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('transactions-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          mutate(KEY)
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return swr
}

export async function addTransaction(input: TransactionInput, userId: string) {
  const supabase = createClient()
  const optimistic: Transaction = {
    ...input,
    id: `temp-${crypto.randomUUID()}`,
    createdAt: Date.now(),
  }

  await mutate<Transaction[]>(
    KEY,
    async (current = []) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...input, user_id: userId })
        .select(COLUMNS)
        .single()
      if (error) throw error
      return [fromRow(data as TransactionRow), ...current.filter((t) => t.id !== data.id)]
    },
    {
      optimisticData: (current = []) => [optimistic, ...current],
      rollbackOnError: true,
      revalidate: false,
    },
  )
}

export async function deleteTransaction(id: string) {
  const supabase = createClient()
  await mutate<Transaction[]>(
    KEY,
    async (current = []) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
      return current.filter((t) => t.id !== id)
    },
    {
      optimisticData: (current = []) => current.filter((t) => t.id !== id),
      rollbackOnError: true,
      revalidate: false,
    },
  )
}

const noopSubscribe = () => () => {}

export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

const yenFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
})

export function formatYen(value: number) {
  return yenFormatter.format(value)
}

export function toLocalDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toMonthKey(date: Date) {
  return toLocalDateString(date).slice(0, 7)
}
