'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const fieldClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25'

type Mode = 'login' | 'sign-up'

// Credential errors stay generic so they don't reveal whether an email is registered.
function errorMessage(error: unknown, mode: Mode) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'email_not_confirmed') return 'メールアドレスの確認が完了していません。受信箱のリンクを開いてください。'
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || status === 429)
    return '試行回数が多すぎます。しばらく待ってから再度お試しください。'
  if (code === 'weak_password') return 'より強力なパスワードを設定してください（6文字以上）。'
  if (code === 'email_address_invalid') return '有効なメールアドレスを入力してください。'
  if (code === 'email_address_not_authorized') return 'このアドレスには確認メールを送信できません。別のアドレスをお試しください。'
  if (code === 'invalid_credentials') return 'メールアドレスまたはパスワードが正しくありません。'
  return mode === 'login' ? 'ログインできませんでした。もう一度お試しください。' : '登録できませんでした。もう一度お試しください。'
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (!isLogin && password !== repeat) {
      setError('パスワードが一致しません')
      return
    }
    setLoading(true)
    const supabase = createClient()
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        router.push('/auth/sign-up-success')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(errorMessage(err, mode))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </div>
      {!isLogin && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="repeat" className="text-sm font-medium">
            パスワード（確認）
          </label>
          <input
            id="repeat"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className={fieldClass}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="h-12 rounded-xl text-base font-semibold">
        {loading ? '処理中…' : isLogin ? 'ログイン' : '新規登録'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? 'アカウントをお持ちでない方は ' : 'すでにアカウントをお持ちの方は '}
        <Link
          href={isLogin ? '/auth/sign-up' : '/auth/login'}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isLogin ? '新規登録' : 'ログイン'}
        </Link>
      </p>
    </form>
  )
}
