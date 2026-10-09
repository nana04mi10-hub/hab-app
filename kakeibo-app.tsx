'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SummaryCards } from '@/components/summary-cards'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { toMonthKey, useHydrated, useTransactions, type Transaction } from '@/lib/transactions'

function shiftMonth(monthKey: string, diff: number) {
  const [y, m] = monthKey.split('-').map(Number)
  return toMonthKey(new Date(y, m - 1 + diff, 1))
}

export function KakeiboApp({ userId }: { userId: string }) {
  const hydrated = useHydrated()
  const { data, error, isLoading, mutate } = useTransactions()
  if (!hydrated || isLoading) return <LoadingState />
  if (error && !data) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">データを読み込めませんでした。</p>
        <button
          type="button"
          onClick={() => mutate()}
          className="rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          再読み込み
        </button>
      </div>
    )
  }
  return <KakeiboContent transactions={data ?? []} userId={userId} />
}

function KakeiboContent({ transactions, userId }: { transactions: Transaction[]; userId: string }) {
  const currentMonth = toMonthKey(new Date())
  const [month, setMonth] = useState(currentMonth)

  const { monthly, income, expense } = useMemo(() => {
    const monthly = transactions
      .filter((t) => t.date.startsWith(month))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    let income = 0
    let expense = 0
    for (const t of monthly) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { monthly, income, expense }
  }, [transactions, month])

  const [y, m] = month.split('-').map(Number)
  const isCurrent = month === currentMonth

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="表示月" className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          className="flex size-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground"
          aria-label="前の月"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold" aria-live="polite">
            {y}年{m}月
          </p>
          {!isCurrent && (
            <button
              type="button"
              onClick={() => setMonth(currentMonth)}
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              今月に戻る
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          className="flex size-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground"
          aria-label="次の月"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </nav>

      <SummaryCards income={income} expense={expense} />

      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="md:w-80 md:shrink-0">
          <TransactionForm userId={userId} />
        </div>
        <div className="min-w-0 flex-1">
          <TransactionList transactions={monthly} />
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="読み込み中">
      <div className="mx-auto h-7 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      <div className="flex gap-3">
        <div className="h-20 flex-1 animate-pulse rounded-2xl bg-muted" />
        <div className="h-20 flex-1 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}
