import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import { formatYen } from '@/lib/transactions'

type Props = {
  income: number
  expense: number
}

export function SummaryCards({ income, expense }: Props) {
  const balance = income - expense

  return (
    <section aria-label="今月の収支" className="flex flex-col gap-3">
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <Wallet className="size-4" aria-hidden="true" />
          <span>今月の残高</span>
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
          {formatYen(balance)}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-income/10 text-income">
              <ArrowDownLeft className="size-3" aria-hidden="true" />
            </span>
            収入合計
          </div>
          <p className="mt-2 text-lg font-bold text-income tabular-nums">{formatYen(income)}</p>
        </div>
        <div className="flex-1 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-expense/10 text-expense">
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </span>
            支出合計
          </div>
          <p className="mt-2 text-lg font-bold text-expense tabular-nums">{formatYen(expense)}</p>
        </div>
      </div>
    </section>
  )
}
