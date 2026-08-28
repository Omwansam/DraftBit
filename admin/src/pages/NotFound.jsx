import { ArrowLeft, Compass } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface text-muted-foreground">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="eyebrow mb-3">Error 404</p>
      <h1 className="font-display text-3xl font-extrabold text-foreground">
        This page isn’t in the console
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The link may be out of date, or the record it pointed to has been deleted.
        Press <kbd className="rounded border border-border px-1.5 py-0.5 text-xs">⌘K</kbd> to
        search for what you were looking for.
      </p>
      <Button to="/" className="mt-6">
        <ArrowLeft className="h-4 w-4" /> Back to the dashboard
      </Button>
    </div>
  )
}
