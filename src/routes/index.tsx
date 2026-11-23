import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Drawer } from 'vaul'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Receipt,
  Sun,
  Moon,
  Monitor,
  Info,
  Pencil,
  HelpCircle,
  ChevronDown,
  HeartPulse,
  Plus,
  Minus,
  Calculator,
  CalendarDays,
  Hourglass,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Header } from '@/components/Header'
import { DrawerBatchList } from '@/components/DrawerBatchList'
import { Footer } from '@/components/Footer'
import { BroilerBatchView } from '@/components/BroilerBatchView'
import { NoilerBatchView } from '@/components/NoilerBatchView'
import { LayersBatchView } from '@/components/LayersBatchView'
import {
  AutoGrowTextarea,
  FormattedCurrencyInput,
} from '@/components/SharedInputs'
import {
  BATCHES_QUERY_KEY,
  CURRENCY_QUERY_KEY,
  createDefaultBatch,
  type Batch,
  type PoultryType,
  type Theme,
} from '@/components/types'

export const Route = createFileRoute('/')({
  component: PoultnovaApp,
})

const THEME_STORAGE_KEY = 'poultnova_theme'
const STORAGE_KEY = 'poultnova_erp_v1'

const THEME_OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
]

const PRESET_CYCLE_WEEKS = [6, 7, 8, 14, 72]

function PoultnovaApp() {
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Bottom-center toast notification state
  const [toast, setToast] = useState<{
    id: number
    type: 'error' | 'warning' | 'info'
    title: string
    message: string
  } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerToast = (
    type: 'error' | 'warning' | 'info',
    title: string,
    message: string,
  ) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ id: Date.now(), type, title, message })
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
    }, 5500)
  }

  const [expenseToDelete, setExpenseToDelete] = useState<{
    id: string
    item: string
    cost: number
  } | null>(null)

  // Shared React Query state for batches
  const { data: batches = [createDefaultBatch(1, 'broiler')] } = useQuery<
    Batch[]
  >({
    queryKey: BATCHES_QUERY_KEY,
    queryFn: () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.batches && parsed.batches.length > 0)
              return parsed.batches
          } catch (e) {}
        }
      }
      return [createDefaultBatch(1, 'broiler')]
    },
    staleTime: Infinity,
  })

  const { data: currency = '₦' } = useQuery<string>({
    queryKey: CURRENCY_QUERY_KEY,
    queryFn: () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.currency) return parsed.currency
          } catch (e) {}
        }
      }
      return '₦'
    },
    staleTime: Infinity,
  })

  const [activeBatchId, setActiveBatchId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.activeBatchId) return parsed.activeBatchId
        } catch (e) {}
      }
    }
    return batches[0]?.id || ''
  })

  // Theme state
  const [theme, setTheme] = useState<Theme>('dark')
  const [systemDark, setSystemDark] = useState(true)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDivElement>(null)
  const isDark = theme === 'dark' || (theme === 'system' && systemDark)
  const ThemeIcon = THEME_OPTIONS.find((o) => o.value === theme)?.Icon ?? Moon

  // Modal & Dropdown states
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean
    title: string
    body: string
  }>({ isOpen: false, title: '', body: '' })
  const [cycleDropdownOpen, setCycleDropdownOpen] = useState(false)
  const [showCustomWeeks, setShowCustomWeeks] = useState(false)
  const [customWeeksVal, setCustomWeeksVal] = useState('')

  const activeBatch = batches.find((b) => b.id === activeBatchId) || batches[0]

  const [birdCountInput, setBirdCountInput] = useState(() =>
    String(activeBatch.birdCount),
  )

  useEffect(() => {
    setBirdCountInput(String(activeBatch.birdCount))
  }, [activeBatch.id, activeBatch.birdCount])

  // Persist to LocalStorage whenever batches, activeBatchId, or currency update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ batches, activeBatchId, currency }),
      )
    }
  }, [batches, activeBatchId, currency])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setTheme(saved)
      }
    } catch (e) {}
  }, [])

  const changeTheme = (next: Theme) => {
    setTheme(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch (e) {}
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])

  useEffect(() => {
    if (!themeMenuOpen) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(e.target as Node)
      ) {
        setThemeMenuOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setThemeMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [themeMenuOpen])

  // Shared React Query Batch Updater
  const updateActiveBatch = (updater: (b: Batch) => Batch) => {
    const updated = batches.map((b) =>
      b.id === activeBatch.id ? updater({ ...b }) : b,
    )
    queryClient.setQueryData(BATCHES_QUERY_KEY, updated)
  }

  const parseLocalDate = (yyyy_mm_dd: string) => {
    const [y, m, d] = yyyy_mm_dd.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const getAgeDays = (arrivalDateStr: string) => {
    if (!arrivalDateStr) return 0
    const start = parseLocalDate(arrivalDateStr)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatShortDate = (dateObj: Date) =>
    dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  // Calculations
  const diffDays = getAgeDays(activeBatch.arrivalDate)
  const isFuture = Boolean(activeBatch.arrivalDate && diffDays < 0)
  const weeks = Math.floor(Math.max(0, diffDays) / 7)
  const days = Math.max(0, diffDays) % 7
  const alive = Math.max(0, activeBatch.birdCount - activeBatch.mortality)
  const totalExpenses = activeBatch.expenses.reduce(
    (sum, e) => sum + (parseFloat(String(e.cost)) || 0),
    0,
  )
  const costPerBird = alive > 0 ? Math.round(totalExpenses / alive) : 0
  const targetDays = activeBatch.targetWeeks * 7
  const rawPct = activeBatch.arrivalDate
    ? Math.min(100, Math.max(0, Math.round((diffDays / targetDays) * 100)))
    : 0

  const isCustomCycle =
    showCustomWeeks || !PRESET_CYCLE_WEEKS.includes(activeBatch.targetWeeks)
  const cycleButtonLabel = showCustomWeeks
    ? 'Others (Custom Weeks)'
    : isCustomCycle
      ? `Others (${activeBatch.targetWeeks} Weeks)`
      : activeBatch.targetWeeksLabel

  const handleSetRelativeDays = (daysAgo: number) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - daysAgo)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    updateActiveBatch((b) => {
      b.arrivalDate = dateStr
      return b
    })
    if (daysAgo >= targetDays) {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } })
    }
  }

  const adjustMortality = (delta: number) => {
    updateActiveBatch((b) => {
      b.mortality = Math.min(b.birdCount, Math.max(0, b.mortality + delta))
      return b
    })
  }

  const handlePoultryTypeChange = (newType: PoultryType) => {
    const cycleDefaults = {
      broiler: { weeks: 6, label: '6 Weeks (42 Days)' },
      noiler: { weeks: 14, label: '14 Weeks (98 Days)' },
      layers: { weeks: 72, label: '72 Weeks (Full Lay Cycle)' },
    }[newType]

    updateActiveBatch((b) => {
      b.poultryType = newType
      b.targetWeeks = cycleDefaults.weeks
      b.targetWeeksLabel = cycleDefaults.label
      return b
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* BOTTOM-CENTER TOAST ALERT */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div
            className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl flex items-start gap-3.5 ${
              toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/80 text-rose-50 shadow-rose-950/50'
                : toast.type === 'warning'
                  ? 'bg-amber-950/95 border-amber-500/80 text-amber-50 shadow-amber-950/50'
                  : 'bg-slate-900/95 border-emerald-500/80 text-slate-50 shadow-emerald-950/50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-inner ${
                toast.type === 'error'
                  ? 'bg-rose-500/30 text-rose-200'
                  : toast.type === 'warning'
                    ? 'bg-amber-500/30 text-amber-200'
                    : 'bg-emerald-500/30 text-emerald-200'
              }`}
            >
              {toast.type === 'error' ? (
                <ShieldAlert className="w-5 h-5 animate-bounce" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-extrabold tracking-tight">
                {toast.title}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed mt-1 font-medium">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss alert"
              onClick={() => setToast(null)}
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* EXPENSE DELETE CONFIRMATION MODAL */}
      {expenseToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Delete Expense Record?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to permanently remove{' '}
                  <strong className="text-slate-900 dark:text-white">
                    &ldquo;{expenseToDelete.item || 'Untitled Expense'}&rdquo;
                  </strong>{' '}
                  ({currency}
                  {expenseToDelete.cost.toLocaleString('en-US')})? This will
                  recalculate your batch cost per bird.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateActiveBatch((b) => {
                    b.expenses = b.expenses.filter(
                      (x) => x.id !== expenseToDelete.id,
                    )
                    return b
                  })
                  setExpenseToDelete(null)
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VAUL LEFT DRAWER */}
      <Drawer.Root
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        direction="left"
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs z-40" />
          <Drawer.Content className="fixed top-0 left-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl">
            <DrawerBatchList
              activeBatchId={activeBatch.id}
              onSelectBatch={setActiveBatchId}
              onCloseDrawer={() => setDrawerOpen(false)}
              getAgeDays={getAgeDays}
              triggerToast={triggerToast}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* TOP HEADER */}
      <Header
        onOpenDrawer={() => setDrawerOpen(true)}
        isDark={isDark}
        activeBatch={activeBatch}
      />

      {/* INFO MODAL */}
      {infoModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <Info className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {infoModal.title}
                </h3>
              </div>
              <button
                onClick={() =>
                  setInfoModal({ isOpen: false, title: '', body: '' })
                }
                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {infoModal.body}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  setInfoModal({ isOpen: false, title: '', body: '' })
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-14 space-y-6">
        {/* SETUP & CORE INPUT CARD */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={activeBatch.name}
                onChange={(e) => {
                  const val = e.target.value
                  updateActiveBatch((b) => {
                    b.name = val
                    return b
                  })
                }}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5 w-full max-w-md transition-colors"
              />
              <Pencil className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            </div>

            {/* Restored Simulate Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">
                Simulate:
              </span>
              <button
                onClick={() => handleSetRelativeDays(0)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300"
              >
                Day 0
              </button>
              <button
                onClick={() => handleSetRelativeDays(14)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300"
              >
                2 Wks
              </button>
              <button
                onClick={() => handleSetRelativeDays(28)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300"
              >
                4 Wks
              </button>
              <button
                onClick={() => handleSetRelativeDays(42)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300"
              >
                6 Wks
              </button>
              <button
                onClick={() => handleSetRelativeDays(126)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300"
              >
                18 Wks
              </button>
            </div>
          </div>

          {/* 4-Column Setup Grid Including Poultry Type Selection Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Poultry Type Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Poultry Type
                </label>
                <button
                  onClick={() =>
                    setInfoModal({
                      isOpen: true,
                      title: 'Poultry Category',
                      body: 'Switch between Broilers (fast meat birds), Noilers (hardy dual-purpose meat & eggs), and Layers (commercial egg pullets). Each module loads tailored vaccination schedules, feed benchmarks, and production tools.',
                    })
                  }
                  className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <select
                value={activeBatch.poultryType}
                onChange={(e) =>
                  handlePoultryTypeChange(e.target.value as PoultryType)
                }
                className="w-full h-11 px-3.5 rounded-xl border border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="broiler">Broiler (Meat Production)</option>
                <option value="noiler">Noiler (Dual-Purpose)</option>
                <option value="layers">Layers (Egg Production)</option>
              </select>
            </div>

            {/* Arrival Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Arrival Date
                </label>
                <button
                  onClick={() =>
                    setInfoModal({
                      isOpen: true,
                      title: 'Arrival / Stocking Date',
                      body: 'The exact date your day-old chicks arrived on the farm (Day 0). All milestones and feed schedules calculate from here.',
                    })
                  }
                  className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="date"
                value={activeBatch.arrivalDate}
                onChange={(e) => {
                  const val = e.target.value
                  updateActiveBatch((b) => {
                    b.arrivalDate = val
                    return b
                  })
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Bird Count */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Initial Chick Count
                </label>
                <button
                  onClick={() =>
                    setInfoModal({
                      isOpen: true,
                      title: 'Initial Chick Count',
                      body: 'Total live day-old chicks stocked in brooder.',
                    })
                  }
                  className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={birdCountInput}
                  onChange={(e) => {
                    const raw = e.target.value
                    setBirdCountInput(raw)
                    const n = parseInt(raw, 10)
                    if (n >= 1) {
                      updateActiveBatch((b) => {
                        b.birdCount = n
                        return b
                      })
                    }
                  }}
                  onBlur={() => {
                    const n = parseInt(birdCountInput, 10)
                    if (!(n >= 1)) {
                      setBirdCountInput(String(activeBatch.birdCount))
                    }
                    updateActiveBatch((b) => {
                      b.mortality = Math.min(b.mortality, b.birdCount)
                      return b
                    })
                  }}
                  placeholder="e.g. 50"
                  className="w-full h-11 pl-3.5 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-slate-400 pointer-events-none">
                  birds
                </span>
              </div>
            </div>

            {/* Target Harvest / Lay Cycle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Cycle
                </label>
                <button
                  onClick={() =>
                    setInfoModal({
                      isOpen: true,
                      title: 'Target Cycle Duration',
                      body: 'Planned duration (6–8 wks for Broilers, 14–16 wks for Noilers, 72+ wks for Layers).',
                    })
                  }
                  className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCycleDropdownOpen(!cycleDropdownOpen)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm flex items-center justify-between gap-2"
                >
                  <span className="truncate">{cycleButtonLabel}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                </button>
                {cycleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    {PRESET_CYCLE_WEEKS.map((wk) => {
                      const selected =
                        !isCustomCycle && activeBatch.targetWeeks === wk
                      return (
                        <div
                          key={wk}
                          onClick={() => {
                            updateActiveBatch((b) => {
                              b.targetWeeks = wk
                              b.targetWeeksLabel = `${wk} Weeks (${wk * 7} Days)`
                              return b
                            })
                            setCycleDropdownOpen(false)
                            setShowCustomWeeks(false)
                            setCustomWeeksVal('')
                          }}
                          className={`px-3.5 py-2.5 text-sm font-semibold hover:bg-emerald-600/20 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between ${
                            selected
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : ''
                          }`}
                        >
                          <span>
                            {wk} Weeks ({wk * 7} Days)
                          </span>
                          {selected && <Check className="w-4 h-4" />}
                        </div>
                      )
                    })}
                    <div
                      onClick={() => {
                        setShowCustomWeeks(true)
                        setCycleDropdownOpen(false)
                      }}
                      className="px-3.5 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/20 cursor-pointer flex items-center justify-between"
                    >
                      <span>Others (Custom Weeks)...</span>
                      {isCustomCycle && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showCustomWeeks && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Enter Custom Weeks
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={customWeeksVal}
                  onChange={(e) => setCustomWeeksVal(e.target.value)}
                  placeholder="e.g. 16"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                />
              </div>
              <button
                onClick={() => {
                  const val = parseInt(customWeeksVal, 10)
                  if (val >= 1) {
                    updateActiveBatch((b) => {
                      b.targetWeeks = val
                      b.targetWeeksLabel = `${val} Weeks (${val * 7} Days)`
                      return b
                    })
                    setShowCustomWeeks(false)
                    setCustomWeeksVal('')
                  } else {
                    triggerToast(
                      'warning',
                      'Invalid Duration',
                      'Please enter at least 1 week.',
                    )
                  }
                }}
                className="mt-5 px-4 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Apply
              </button>
            </div>
          )}

          {/* LIVABILITY BAR */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Flock & Livability
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tap + each time a bird dies to update live inventory.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-x-6 gap-y-3 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Alive / Survival
                </div>
                <div className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                  {alive}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {((alive / activeBatch.birdCount) * 100).toFixed(1)}%
                    </span>
                    )
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Dead Birds
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Decrease dead birds"
                    onClick={() => adjustMortality(-1)}
                    disabled={activeBatch.mortality <= 0}
                    className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-10 text-center font-mono text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    {activeBatch.mortality}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase dead birds"
                    onClick={() => adjustMortality(1)}
                    disabled={activeBatch.mortality >= activeBatch.birdCount}
                    className="w-9 h-9 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MATERIAL-UI STYLE EXPENSES LEDGER */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Batch Expenses Ledger
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track chicks, feeds, vaccines, and operational costs.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateActiveBatch((b) => {
                    b.expenses = [
                      ...b.expenses,
                      {
                        id:
                          'ex_' +
                          Date.now() +
                          '_' +
                          Math.random().toString(36).slice(2, 5),
                        item: '',
                        cost: 0,
                        date: new Date().toISOString().slice(0, 10),
                      },
                    ]
                    return b
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </div>

            <div className="w-full overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm">
              <table className="w-full min-w-[580px] border-collapse bg-white dark:bg-slate-900 text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-300 dark:border-slate-700">
                    <th className="py-3 px-4 text-left w-[240px] sm:w-[280px]">
                      Item / Description
                    </th>
                    <th className="py-3 px-4 text-left w-[130px] sm:w-[150px]">
                      Cost ({currency})
                    </th>
                    <th className="py-3 px-4 text-left w-[140px] sm:w-[160px]">
                      Date
                    </th>
                    <th className="py-3 px-3 text-center w-[72px] sticky right-0 bg-slate-100 dark:bg-slate-950/90 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {activeBatch.expenses.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                      >
                        No expenses logged. Click &ldquo;Add Expense&rdquo;
                        above to begin tracking.
                      </td>
                    </tr>
                  )}
                  {activeBatch.expenses.map((ex) => (
                    <tr
                      key={ex.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 align-middle">
                        <AutoGrowTextarea
                          ariaLabel="Item description"
                          placeholder="Enter item..."
                          value={ex.item}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\n/g, ' ')
                            updateActiveBatch((b) => {
                              b.expenses = b.expenses.map((x) =>
                                x.id === ex.id ? { ...x, item: val } : x,
                              )
                              return b
                            })
                          }}
                          className="bg-transparent text-xs sm:text-sm leading-snug text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
                        />
                      </td>
                      <td className="py-2.5 px-4 align-middle">
                        <FormattedCurrencyInput
                          ariaLabel="Cost"
                          placeholder="0"
                          value={ex.cost}
                          onChange={(val) => {
                            updateActiveBatch((b) => {
                              b.expenses = b.expenses.map((x) =>
                                x.id === ex.id ? { ...x, cost: val } : x,
                              )
                              return b
                            })
                          }}
                          className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-4 align-middle">
                        <input
                          type="date"
                          aria-label="Date"
                          value={ex.date}
                          onChange={(e) => {
                            const val = e.target.value
                            updateActiveBatch((b) => {
                              b.expenses = b.expenses.map((x) =>
                                x.id === ex.id ? { ...x, date: val } : x,
                              )
                              return b
                            })
                          }}
                          className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center align-middle sticky right-0 bg-white dark:bg-slate-900 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                        <button
                          type="button"
                          aria-label="Delete expense"
                          onClick={() =>
                            setExpenseToDelete({
                              id: ex.id,
                              item: ex.item,
                              cost: ex.cost,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="bg-slate-100 dark:bg-slate-950 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center gap-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Batch Spend:
                </span>
                <span className="font-mono text-lg font-extrabold text-rose-600 dark:text-rose-400">
                  {currency}
                  {totalExpenses.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>

          {/* COST PER BIRD CALCULATOR */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-r from-slate-50 dark:from-slate-950 to-white dark:to-slate-900 p-5 rounded-2xl border border-slate-300 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cost Per Bird Calculator
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live flock unit economics & financial breakdown.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-white/90 dark:bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    Alive Birds
                  </div>
                  <div className="font-mono text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {alive}
                  </div>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-800 px-2">
                  <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    Total Cost
                  </div>
                  <div className="font-mono text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    {currency}
                    {totalExpenses.toLocaleString('en-US')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    Cost / Bird
                  </div>
                  <div className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {currency}
                    {costPerBird.toLocaleString('en-US')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EMPTY STATE */}
        {!activeBatch.arrivalDate && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Select Arrival Date Above
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Choose your chick arrival date or use a simulation button to
              unlock the full management suite for {activeBatch.poultryType}s.
            </p>
          </div>
        )}

        {/* FUTURE BANNER */}
        {isFuture && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Hourglass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Upcoming Chick Arrival
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Chicks arrive on{' '}
                {formatShortDate(parseLocalDate(activeBatch.arrivalDate))}!
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                Disinfect pen 48h prior, spread fresh dry wood shavings, and
                pre-heat brooder to 33°C.
              </p>
            </div>
          </div>
        )}

        {/* SPECIALIZED POULTRY DASHBOARD COMPONENTS */}
        {activeBatch.arrivalDate && !isFuture && (
          <>
            {activeBatch.poultryType === 'broiler' && (
              <BroilerBatchView
                activeBatch={activeBatch}
                updateActiveBatch={updateActiveBatch}
                currency={currency}
                isDark={isDark}
                diffDays={diffDays}
                weeks={weeks}
                days={days}
                alive={alive}
                totalExpenses={totalExpenses}
                targetDays={targetDays}
                rawPct={rawPct}
                triggerToast={triggerToast}
              />
            )}

            {activeBatch.poultryType === 'noiler' && (
              <NoilerBatchView
                activeBatch={activeBatch}
                updateActiveBatch={updateActiveBatch}
                currency={currency}
                isDark={isDark}
                diffDays={diffDays}
                weeks={weeks}
                days={days}
                alive={alive}
                totalExpenses={totalExpenses}
                targetDays={targetDays}
                rawPct={rawPct}
                triggerToast={triggerToast}
              />
            )}

            {activeBatch.poultryType === 'layers' && (
              <LayersBatchView
                activeBatch={activeBatch}
                updateActiveBatch={updateActiveBatch}
                currency={currency}
                isDark={isDark}
                diffDays={diffDays}
                weeks={weeks}
                days={days}
                alive={alive}
                totalExpenses={totalExpenses}
                targetDays={targetDays}
                rawPct={rawPct}
                triggerToast={triggerToast}
              />
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <Footer onOpenDrawer={() => setDrawerOpen(true)} isDark={isDark} />

      {/* FLOATING THEME SWITCHER */}
      <div ref={themeMenuRef} className="fixed bottom-4 left-4 z-30">
        {themeMenuOpen && (
          <div
            role="menu"
            aria-label="Theme"
            className="absolute bottom-full left-0 mb-2 w-40 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-2xl"
          >
            {THEME_OPTIONS.map(({ value, label, Icon }) => {
              const active = theme === value
              return (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    changeTheme(value)
                    setThemeMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {active && <Check className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </div>
        )}
        <button
          type="button"
          aria-label="Change theme"
          aria-haspopup="menu"
          aria-expanded={themeMenuOpen}
          onClick={() => setThemeMenuOpen((o) => !o)}
          className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-black/30 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ThemeIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
