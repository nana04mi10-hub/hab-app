import { ThemeControls } from '@/components/theme-controls'

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-4">
          <span
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            aria-hidden="true"
          >
            {'¥'}
          </span>
          <p className="text-lg font-bold">おこづかい帳</p>
          <ThemeControls />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 md:items-center">
        <section className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-6">{children}</div>
        </section>
      </main>
    </div>
  )
}
