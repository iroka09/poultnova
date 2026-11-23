import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Syringe,
  Bell,
  BellRing,
  Check,
  AlertTriangle,
  Lightbulb,
  LayoutDashboard,
  LineChart,
  Cpu,
  ShoppingBag,
  Thermometer,
  Wheat,
  Scale,
  TrendingUp,
  PackageCheck,
  Coins,
  Radio,
  Zap,
  PlugZap,
  Flame,
  Users,
  UserPlus,
  Trash2,
} from 'lucide-react'
import Chart from 'chart.js/auto'
import { FormattedCurrencyInput } from './SharedInputs'
import type { Batch } from './types'

export interface WeeklyBenchmark {
  week: number
  temp: string
  tempNote: string
  feed: string
  gPerBird: number
  stage: string
  tip: string
}

export interface MilestoneItem {
  id: string
  day: number
  title: string
  desc: string
}

interface PoultryOperationsEngineProps {
  activeBatch: Batch
  updateActiveBatch: (updater: (b: Batch) => Batch) => void
  currency: string
  isDark: boolean
  diffDays: number
  weeks: number
  days: number
  alive: number
  totalExpenses: number
  targetDays: number
  rawPct: number
  weeklyGuide: WeeklyBenchmark[]
  standardWeights: number[]
  milestones: MilestoneItem[]
  breedDisplayName: string
  triggerToast: (
    type: 'error' | 'warning' | 'info',
    title: string,
    msg: string,
  ) => void
  extraTopBanner?: React.ReactNode
  extraTabContent?: React.ReactNode
}

export function PoultryOperationsEngine({
  activeBatch,
  updateActiveBatch,
  currency,
  isDark,
  diffDays,
  weeks,
  days,
  alive,
  totalExpenses,
  targetDays,
  rawPct,
  weeklyGuide,
  standardWeights,
  milestones,
  breedDisplayName,
  triggerToast,
  extraTopBanner,
  extraTabContent,
}: PoultryOperationsEngineProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'growth' | 'iot' | 'sales'
  >('overview')
  const [notificationsActive, setNotificationsActive] = useState(false)

  // Growth input state
  const [sampleWeek, setSampleWeek] = useState(1)
  const [sampleWeightInput, setSampleWeightInput] = useState('')

  // Buyer input state
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerQty, setBuyerQty] = useState('')
  const [buyerProduct, setBuyerProduct] = useState<'live_birds' | 'egg_crates'>(
    'live_birds',
  )

  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const parseLocalDate = (yyyy_mm_dd: string) => {
    const [y, m, d] = yyyy_mm_dd.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const formatShortDate = (dateObj: Date) =>
    dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const guideIdx = Math.min(weeks, weeklyGuide.length - 1)
  const guide = weeklyGuide[guideIdx]
  const stdWeightG =
    standardWeights[Math.min(weeks + 1, standardWeights.length - 1)]
  const dailyFeedKg = ((alive * guide.gPerBird) / 1000).toFixed(2)
  const dailyWaterL = (parseFloat(dailyFeedKg) * 2).toFixed(1)

  const sellingPrice = activeBatch.sellingPricePerBird ?? 8500
  const projectedBirdRevenue = alive * sellingPrice

  // Include egg revenue for Layers & Noilers
  const totalCratesLogged = (activeBatch.eggLogs || []).reduce(
    (sum, log) => sum + log.cratesCollected + log.looseEggs / 30,
    0,
  )
  const eggRevenue = Math.round(
    totalCratesLogged * (activeBatch.sellingPricePerCrate || 0),
  )
  const projectedRevenue = projectedBirdRevenue + eggRevenue
  const projectedProfit = projectedRevenue - totalExpenses

  const toggleNotifications = async () => {
    if (!notificationsActive) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const perm = await Notification.requestPermission()
          if (perm === 'granted') {
            setNotificationsActive(true)
            triggerToast(
              'info',
              'Notifications Enabled',
              `Poultnova will notify you of upcoming medication schedules for ${activeBatch.name}.`,
            )
            new Notification('Poultnova Alerts Activated', {
              body: `Monitoring vaccination schedules for ${activeBatch.name}.`,
            })
            return
          }
        } catch (e) {}
      }
      setNotificationsActive(true)
      triggerToast(
        'info',
        'In-App Alerts Activated',
        'In-app medication reminders and status badges are now active.',
      )
    } else {
      setNotificationsActive(false)
      triggerToast(
        'info',
        'Notifications Muted',
        'Poultnova background alerts have been turned off.',
      )
    }
  }

  const handleToggleMilestone = (m: MilestoneItem) => {
    const isDone = !!activeBatch.completedMilestones[m.id]

    if (isDone) {
      updateActiveBatch((b) => {
        b.completedMilestones = { ...b.completedMilestones, [m.id]: false }
        return b
      })
      return
    }

    if (diffDays < m.day) {
      const daysRemaining = m.day - diffDays
      triggerToast(
        'error',
        'Scheduled Date Not Yet Reached',
        `Administration blocked: "${m.title}" is programmed for Day ${m.day} (${daysRemaining} day${daysRemaining > 1 ? 's' : ''} from now). Administering vaccines prematurely compromises flock immunity.`,
      )
      return
    }

    if (diffDays > m.day) {
      const daysOverdue = diffDays - m.day
      triggerToast(
        'warning',
        'Overdue Medication Warning',
        `Caution: "${m.title}" was scheduled for Day ${m.day} (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue). Administering late requires veterinary consultation regarding withdrawal periods.`,
      )
    } else {
      triggerToast(
        'info',
        'Medication Administered Successfully',
        `"${m.title}" has been recorded as completed for Day ${m.day}.`,
      )
    }

    updateActiveBatch((b) => {
      b.completedMilestones = { ...b.completedMilestones, [m.id]: true }
      return b
    })
  }

  useEffect(() => {
    if (activeTab === 'growth' && chartRef.current && activeBatch.arrivalDate) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
      const weekCount = Math.min(standardWeights.length - 1, 16)
      const weekIndices = Array.from({ length: weekCount }, (_, i) => i + 1)
      const labels = weekIndices.map((w) => `Wk ${w}`)
      const stdSeries = standardWeights.slice(1, weekCount + 1)
      const actualSeries = weekIndices.map(
        (w) => activeBatch.sampleWeights[w] || null,
      )

      const legendColor = isDark ? '#cbd5e1' : '#334155'
      const tickColor = isDark ? '#94a3b8' : '#64748b'
      const gridColor = isDark
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(15,23,42,0.08)'

      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: `${breedDisplayName} Standard (g)`,
              data: stdSeries,
              borderColor: '#64748b',
              borderDash: [5, 5],
              tension: 0.35,
              pointRadius: 3,
            },
            {
              label: 'Your Flock Sample (g)',
              data: actualSeries,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              spanGaps: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: legendColor,
                font: { family: 'Plus Jakarta Sans', size: 11 },
              },
            },
          },
          scales: {
            x: { ticks: { color: tickColor }, grid: { color: gridColor } },
            y: { ticks: { color: tickColor }, grid: { color: gridColor } },
          },
        },
      })
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [activeTab, activeBatch, isDark, standardWeights, breedDisplayName])

  return (
    <div className="space-y-6">
      {extraTopBanner}

      {/* 1. HERO AGE & CYCLE COMPLETION CARD */}
      <section className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{guide.stage}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {weeks} Weeks
              </span>
              <span className="text-2xl sm:text-3xl font-light text-slate-400 dark:text-slate-500">
                &
              </span>
              <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {days} Days
              </span>
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-sm mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Exact Age:{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {diffDays} days
                </strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>
                Target Cycle End:{' '}
                <strong className="text-emerald-700 dark:text-emerald-300">
                  {formatShortDate(
                    new Date(
                      parseLocalDate(activeBatch.arrivalDate).getTime() +
                        targetDays * 86400000,
                    ),
                  )}
                </strong>
              </span>
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 lg:min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Cycle Completion</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {rawPct}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-700"
                style={{ width: `${rawPct}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {Math.max(0, targetDays - diffDays)} days remaining
            </p>
          </div>
        </div>
      </section>

      {/* 2. MEDICATION ROADMAP & MANAGEMENT TIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-500" /> Vaccination &
              Medication Roadmap
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleNotifications}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border transition-all ${
                  notificationsActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                {notificationsActive ? (
                  <>
                    <BellRing className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                    <span>Alerts Active</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Alerts Muted</span>
                  </>
                )}
              </button>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-xl">
                {
                  Object.values(activeBatch.completedMilestones).filter(Boolean)
                    .length
                }
                /{milestones.length} Done
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m) => {
              const isDone = !!activeBatch.completedMilestones[m.id]
              const isDueToday = !isDone && diffDays === m.day
              const isOverdue = !isDone && diffDays > m.day
              const isUpcoming = !isDone && diffDays < m.day
              const dueDate = parseLocalDate(activeBatch.arrivalDate)
              dueDate.setDate(dueDate.getDate() + m.day)

              return (
                <div
                  key={m.id}
                  onClick={() => handleToggleMilestone(m)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isDone
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : isDueToday
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40 animate-pulse shadow-lg shadow-emerald-500/10'
                        : isOverdue
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400/60 dark:border-amber-700/60 hover:border-amber-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isDueToday
                          ? 'border-2 border-emerald-500 bg-emerald-500/10'
                          : 'border-2 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {m.title}
                        </h4>
                        {isDueToday && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            <Syringe className="w-3 h-3" /> Due Today
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                            <AlertTriangle className="w-3 h-3" /> Overdue (
                            {diffDays - m.day}d)
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            In {m.day - diffDays}d
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Day {m.day} • {formatShortDate(dueDate)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {m.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. MANAGEMENT TIPS CARD */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
              <Lightbulb className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Week {weeks + 1} Management Tip
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
              <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                {guide.tip}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Biosecurity Status</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{' '}
              Active
            </span>
          </div>
        </section>
      </div>

      {/* Specialized Poultry Module Section (e.g., Egg Lay Tracker for Layers/Noilers) */}
      {extraTabContent}

      {/* TABS */}
      <nav className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Daily Operations
        </button>
        <button
          onClick={() => setActiveTab('growth')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'growth'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <LineChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />{' '}
          Weight, Feed & Profit
        </button>
        <button
          onClick={() => setActiveTab('iot')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'iot'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Brooder
          IoT & Power
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'sales'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />{' '}
          Pre-Orders & Buyers
        </button>
      </nav>

      {/* TAB 1: DAILY OPERATIONS KPIs */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Target Temp
              </span>
              <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              {guide.temp}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {guide.tempNote}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Active Feed
              </span>
              <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {guide.feed}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ~{guide.gPerBird}g / bird today
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Daily Ration
              </span>
              <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              {dailyFeedKg} kg
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Water: ~{dailyWaterL} L/day
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Breed Std Weight
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              {stdWeightG >= 1000
                ? `${(stdWeightG / 1000).toFixed(2)} kg`
                : `${stdWeightG} g`}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {breedDisplayName} target
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: GROWTH, FEED & PROFITABILITY */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Actual vs. Breed Standard Weight
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Weigh 5–10 random birds weekly and log average weight
                    (grams).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sampleWeek}
                    onChange={(e) => setSampleWeek(parseInt(e.target.value))}
                    className="h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {Array.from(
                      { length: Math.min(standardWeights.length - 1, 16) },
                      (_, i) => i + 1,
                    ).map((w) => (
                      <option key={w} value={w}>
                        Wk {w}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={sampleWeightInput}
                    onChange={(e) => setSampleWeightInput(e.target.value)}
                    placeholder="Grams"
                    className="w-28 h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      const w = parseFloat(sampleWeightInput)
                      if (w > 0) {
                        updateActiveBatch((b) => {
                          b.sampleWeights = {
                            ...b.sampleWeights,
                            [sampleWeek]: w,
                          }
                          return b
                        })
                        setSampleWeightInput('')
                        triggerToast(
                          'info',
                          'Sample Logged',
                          `Recorded ${w}g average weight for Week ${sampleWeek}.`,
                        )
                      }
                    }}
                    className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Log
                  </button>
                </div>
              </div>
              <div className="h-64 w-full">
                <canvas ref={chartRef}></canvas>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />{' '}
                  Feed Store Inventory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Predicts run-out date based on flock age & count.
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    25kg Bags Currently in Store
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={activeBatch.feedBagsInStore}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      updateActiveBatch((b) => {
                        b.feedBagsInStore = val
                        return b
                      })
                    }}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono font-bold text-base text-slate-900 dark:text-white"
                  />
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Stock Runway
                  </span>
                  <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {Math.floor(
                      (activeBatch.feedBagsInStore * 25) /
                        Math.max(0.1, (alive * guide.gPerBird) / 1000),
                    )}{' '}
                    Days
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    Estimated inventory depletion
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* PROJECTED HARVEST & EGG PROFITABILITY SIMULATOR */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Profit & Margin Estimator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Simulate projected revenue from live birds
                    {activeBatch.poultryType !== 'broiler'
                      ? ' + logged egg crates'
                      : ''}
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="w-44">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Target Price / Bird ({currency})
                  </label>
                  <FormattedCurrencyInput
                    ariaLabel="Target selling price per bird"
                    value={sellingPrice}
                    onChange={(val) =>
                      updateActiveBatch((b) => {
                        b.sellingPricePerBird = val
                        return b
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {activeBatch.poultryType !== 'broiler' && (
                  <div className="w-44">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Price / Egg Crate ({currency})
                    </label>
                    <FormattedCurrencyInput
                      ariaLabel="Selling price per egg crate"
                      value={activeBatch.sellingPricePerCrate || 0}
                      onChange={(val) =>
                        updateActiveBatch((b) => {
                          b.sellingPricePerCrate = val
                          return b
                        })
                      }
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  Projected Gross Sales ({alive} birds
                  {eggRevenue > 0
                    ? ` + ${totalCratesLogged.toFixed(1)} crates`
                    : ''}
                  )
                </span>
                <div className="font-mono text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {currency}
                  {projectedRevenue.toLocaleString('en-US')}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  Current Logged Expenses
                </span>
                <div className="font-mono text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                  {currency}
                  {totalExpenses.toLocaleString('en-US')}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  Estimated Net Margin
                </span>
                <div
                  className={`font-mono text-xl font-extrabold mt-1 ${
                    projectedProfit >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {projectedProfit >= 0 ? '+' : ''}
                  {currency}
                  {projectedProfit.toLocaleString('en-US')}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: IOT & POWER */}
      {activeTab === 'iot' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />{' '}
                  Pen Climate Sensor Hook
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ESP32 Telemetry Node • poultnova.com IoT
                </p>
              </div>
              <button
                onClick={() => {
                  updateActiveBatch((b) => {
                    b.iot = {
                      ...b.iot,
                      tempC: parseFloat((29 + Math.random() * 4.5).toFixed(1)),
                      humidity: Math.floor(55 + Math.random() * 14),
                    }
                    return b
                  })
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Poll Sensor
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Live Temp (°C)
                </span>
                <input
                  type="number"
                  value={activeBatch.iot.tempC}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    updateActiveBatch((b) => {
                      b.iot = { ...b.iot, tempC: val }
                      return b
                    })
                  }}
                  className="mt-1 w-full bg-transparent font-mono text-3xl font-extrabold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Humidity (%)
                </span>
                <input
                  type="number"
                  value={activeBatch.iot.humidity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    updateActiveBatch((b) => {
                      b.iot = { ...b.iot, humidity: val }
                      return b
                    })
                  }}
                  className="mt-1 w-full bg-transparent font-mono text-3xl font-extrabold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />{' '}
              Power, Lighting & Heat Guard
            </h3>
            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <PlugZap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Grid / Inverter Active
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      48V Battery Bank OK
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={activeBatch.iot.powerOn}
                  onChange={(e) => {
                    const val = e.target.checked
                    updateActiveBatch((b) => {
                      b.iot = { ...b.iot, powerOn: val }
                      return b
                    })
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Backup Brooder Ready
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Charcoal/Gas staged
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={activeBatch.iot.backupHeat}
                  onChange={(e) => {
                    const val = e.target.checked
                    updateActiveBatch((b) => {
                      b.iot = { ...b.iot, backupHeat: val }
                      return b
                    })
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </label>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: PRE-ORDERS */}
      {activeTab === 'sales' && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />{' '}
                Buyer & Pre-Order Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lock in buyers early for live birds or egg crates.
              </p>
            </div>
            <div className="text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/50">
              Reserved Birds:{' '}
              <strong className="font-mono">
                {activeBatch.buyers
                  .filter((o) => o.productType !== 'egg_crates')
                  .reduce((s, o) => s + o.qty, 0)}
              </strong>{' '}
              / <span className="font-mono">{alive}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Customer Name"
              className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="Phone Number"
              className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <select
              value={buyerProduct}
              onChange={(e) =>
                setBuyerProduct(e.target.value as 'live_birds' | 'egg_crates')
              }
              className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="live_birds">Live Birds</option>
              <option value="egg_crates">Egg Crates</option>
            </select>
            <input
              type="number"
              value={buyerQty}
              onChange={(e) => setBuyerQty(e.target.value)}
              placeholder="Qty"
              className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm text-slate-900 dark:text-white"
            />
            <button
              onClick={() => {
                const q = parseInt(buyerQty)
                if (buyerName && q > 0) {
                  updateActiveBatch((b) => {
                    b.buyers = [
                      ...b.buyers,
                      {
                        id: 'ord_' + Date.now(),
                        name: buyerName,
                        phone: buyerPhone || '—',
                        qty: q,
                        paid: false,
                        productType: buyerProduct,
                      },
                    ]
                    return b
                  })
                  setBuyerName('')
                  setBuyerPhone('')
                  setBuyerQty('')
                }
              }}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Add Order
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {activeBatch.buyers.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {o.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {o.phone}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                      {o.productType === 'egg_crates'
                        ? 'Egg Crates'
                        : 'Live Birds'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{o.qty}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          updateActiveBatch((b) => {
                            b.buyers = b.buyers.map((item) =>
                              item.id === o.id
                                ? { ...item, paid: !item.paid }
                                : item,
                            )
                            return b
                          })
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          o.paid
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {o.paid ? 'Paid' : 'Pending'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() =>
                          updateActiveBatch((b) => {
                            b.buyers = b.buyers.filter((x) => x.id !== o.id)
                            return b
                          })
                        }
                        className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
