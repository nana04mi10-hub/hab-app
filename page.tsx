import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'

export const metadata = { title: '確認メールを送信しました | おこづかい帳' }

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="確認メールを送信しました"
      description="メール内のリンクを開くと登録が完了し、ログインできるようになります。"
    >
      <Link href="/auth/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        ログイン画面へ戻る
      </Link>
    </AuthShell>
  )
}
