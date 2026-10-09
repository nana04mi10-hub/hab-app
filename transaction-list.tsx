'use client'

import { Trash2, ReceiptText } from 'lucide-react'
import { deleteTransaction, formatYen, type Transaction } from '@/lib/transactions'
import { cn } from '@/lib/utils'

type Props = {
  transactions: Transaction[]
}

function formatDate(date: string) {
  const [, m, d] = date.split('-')
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][new Date(`${date}T00:00:00`).getDay()]
  return `${Number(m)}/${Number(d)}（${weekday}）`
}

export function TransactionList({ transactions }: Props) {
  return (
    <section aria-labelledby="list-heading" className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 id="list-heading" className="text-base font-bold">
          収支の一覧
        </h2>
        <span className="text-xs text-muted-foreground">{transactions.length}件</span>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 pt-6 pb-10 text-center text-muted-foreground">
          <ReceiptText className="size-8" aria-hidden="true" />
          <p className="text-sm">まだ記録がありません</p>
        </div>
      ) : (
        <ul className="divide-y px-2 pb-2">
          {transactions.map((t) => {
            const isIncome = t.type === 'income'
            return (
              <li key={t.id} className="flex items-center gap-3 px-3 py-3">
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isIncome ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense',
                  )}
                  aria-hidden="true"
                >
                  {t.category.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {t.category}
                    <span className="sr-only">（{isIncome ? '収入' : '支出'}）</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(t.date)}
                    {t.memo && ` ・ ${t.memo}`}
                  </p>
                </div>
                <p
                  className={cn(
                    'shrink-0 text-sm font-bold tabular-nums',
                    isIncome ? 'text-income' : 'text-expense',
                  )}
                >
                  {isIncome ? '+' : '-'}
                  {formatYen(t.amount)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm('この記録を削除しますか？')) return
                    deleteTransaction(t.id).catch((err) => {
                      console.error('Failed to delete transaction:', err)
                      window.alert('削除に失敗しました。もう一度お試しください。')
                    })
                  }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                  aria-label={`${formatDate(t.date)}の${t.category} ${formatYen(t.amount)}を削除`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
