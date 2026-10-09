'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CATEGORIES,
  addTransaction,
  toLocalDateString,
  type TransactionType,
} from '@/lib/transactions'
import { cn } from '@/lib/utils'

const fieldClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25'

export function TransactionForm({ userId }: { userId: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [date, setDate] = useState(() => toLocalDateString(new Date()))
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.expense[0])
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')

  function changeType(next: TransactionType) {
    setType(next)
    setCategory(CATEGORIES[next][0])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(amount)
    if (!date) {
      setError('日付を入力してください')
      return
    }
    if (!Number.isInteger(value) || value <= 0 || value > 100_000_000) {
      setError('金額は1円以上の整数で入力してください')
      return
    }
    const input = { date, amount: value, category, type, memo: memo.trim().slice(0, 100) }
    setAmount('')
    setMemo('')
    setError('')
    setSubmitting(true)
    try {
      await addTransaction(input, userId)
    } catch (err) {
      console.error('Failed to add transaction:', err)
      setAmount(String(input.amount))
      setMemo(input.memo)
      setError('保存に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="form-heading" className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="form-heading" className="text-base font-bold">
        収支を記録する
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        <div
          role="radiogroup"
          aria-label="タイプ"
          className="flex rounded-xl bg-muted p-1"
        >
          {(['expense', 'income'] as const).map((value) => {
            const active = type === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => changeType(value)}
                className={cn(
                  'h-10 flex-1 rounded-lg text-sm font-semibold transition',
                  active
                    ? value === 'expense'
                      ? 'bg-card text-expense shadow-sm'
                      : 'bg-card text-income shadow-sm'
                    : 'text-muted-foreground',
                )}
              >
                {value === 'expense' ? '支出' : '収入'}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-sm font-medium">
            金額
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              {'¥'}
            </span>
            <input
              id="amount"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              className={cn(fieldClass, 'pl-8 text-lg font-semibold tabular-nums')}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'form-error' : undefined}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium">
              日付
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium">
              カテゴリ
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            >
              {CATEGORIES[type].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="memo" className="text-sm font-medium">
            メモ <span className="font-normal text-muted-foreground">（任意）</span>
          </label>
          <input
            id="memo"
            value={memo}
            maxLength={100}
            placeholder="例：スーパーで買い物"
            onChange={(e) => setMemo(e.target.value)}
            className={fieldClass}
          />
        </div>

        {error && (
          <p id="form-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="h-12 rounded-xl text-base font-semibold">
          <Plus className="size-5" aria-hidden="true" />
          {submitting ? '保存中…' : '追加する'}
        </Button>
      </form>
    </section>
  )
}
