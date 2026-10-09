'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    await mutate(() => true, undefined, { revalidate: false })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex size-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground"
      aria-label="ログアウト"
      title="ログアウト"
    >
      <LogOut className="size-4" aria-hidden="true" />
    </button>
  )
}
