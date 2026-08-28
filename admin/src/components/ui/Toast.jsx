import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, Undo2, X, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

const TONES = {
  success: { icon: CheckCircle2, cls: 'text-success', ring: 'border-success/30' },
  error: { icon: XCircle, cls: 'text-critical', ring: 'border-critical/30' },
  warning: { icon: AlertTriangle, cls: 'text-warning', ring: 'border-warning/35' },
  info: { icon: Info, cls: 'text-primary', ring: 'border-primary/30' },
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  /**
   * toast('Saved')                          → success
   * toast('Could not save', { tone: 'error' })
   * toast('3 messages archived', { action: { label: 'Undo', onClick: restore } })
   */
  const toast = useCallback(
    (message, { tone = 'success', duration = 4500, action } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, message, tone, action }])
      timers.current.set(id, setTimeout(() => dismiss(id), duration))
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-2.5"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map(({ id, message, tone, action }) => {
            const { icon: Icon, cls, ring } = TONES[tone] ?? TONES.info
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${ring} bg-surface px-4 py-3 shadow-2xl`}
              >
                <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${cls}`} style={{ height: 18, width: 18 }} aria-hidden="true" />
                <p className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-foreground">{message}</p>
                {action && (
                  <button
                    type="button"
                    onClick={() => { action.onClick(); dismiss(id) }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.8125rem] font-medium text-primary hover:bg-primary/10"
                  >
                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {action.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
