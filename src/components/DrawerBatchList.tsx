import {
  X,
  PlusCircle,
  Download,
  Upload,
  Trash2,
  Hourglass,
  ShoppingBag,
  Syringe,
  CheckSquare,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BATCHES_QUERY_KEY,
  CURRENCY_QUERY_KEY,
  createDefaultBatch,
  type Batch,
  type PoultryType,
} from './types'
import { useState } from 'react'

interface DrawerBatchListProps {
  activeBatchId: string
  onSelectBatch: (id: string) => void
  onCloseDrawer: () => void
  getAgeDays: (date: string) => number
  triggerToast: (
    type: 'error' | 'warning' | 'info',
    title: string,
    msg: string,
  ) => void
}

const DEFAULT_MILESTONES_CHECK = [
  { id: 'm1', day: 1, title: 'Anti-Stress + Vitamins' },
  { id: 'm2', day: 7, title: '1st Gumboro (IBD)' },
  { id: 'm3', day: 14, title: '1st Lasota (NDV)' },
  { id: 'm4', day: 21, title: '2nd Gumboro Booster' },
  { id: 'm5', day: 28, title: '2nd Lasota Booster' },
]

export function DrawerBatchList({
  activeBatchId,
  onSelectBatch,
  onCloseDrawer,
  getAgeDays,
  triggerToast,
}: DrawerBatchListProps) {
  const queryClient = useQueryClient()
  const [newBatchType, setNewBatchType] = useState<PoultryType>('broiler')

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: BATCHES_QUERY_KEY,
    enabled: false,
  })

  const { data: currency = '₦' } = useQuery<string>({
    queryKey: CURRENCY_QUERY_KEY,
    enabled: false,
  })

  const handleCreateBatch = () => {
    const newB = createDefaultBatch(batches.length + 1, newBatchType)
    const updated = [newB, ...batches]
    queryClient.setQueryData(BATCHES_QUERY_KEY, updated)
    onSelectBatch(newB.id)
    onCloseDrawer()
  }

  const handleDeleteBatch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (batches.length <= 1) {
      triggerToast(
        'error',
        'Action Restricted',
        'At least one active flock batch must remain in your Poultnova workspace.',
      )
      return
    }
    const nextBatches = batches.filter((b) => b.id !== id)
    queryClient.setQueryData(BATCHES_QUERY_KEY, nextBatches)
    if (activeBatchId === id) onSelectBatch(nextBatches[0].id)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/poultnova-logo-mark.png"
            alt="Poultnova Mark"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
              Flock Batches
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              poultnova.com • Multi-Pen Manager
            </p>
          </div>
        </div>
        <button
          onClick={onCloseDrawer}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Create New Batch with Poultry Type Selector */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center gap-2">
          <select
            value={newBatchType}
            onChange={(e) => setNewBatchType(e.target.value as PoultryType)}
            aria-label="New batch poultry type"
            className="h-10 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="broiler">Broiler</option>
            <option value="noiler">Noiler</option>
            <option value="layers">Layers</option>
          </select>
          <button
            onClick={handleCreateBatch}
            className="flex-1 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Flock Batch</span>
          </button>
        </div>
      </div>

      {/* Batch List with Smart Status Badges */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {batches.map((batch) => {
          const isActive = batch.id === activeBatchId
          const bAlive = Math.max(0, batch.birdCount - batch.mortality)
          const dDays = getAgeDays(batch.arrivalDate)
          let ageLabel = 'Not started'
          let statusBadge = null

          if (batch.arrivalDate) {
            if (dDays < 0) {
              ageLabel = `Starts in ${Math.abs(dDays)}d`
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Hourglass className="w-3 h-3" /> Upcoming
                </span>
              )
            } else {
              const w = Math.floor(dDays / 7)
              const d = dDays % 7
              ageLabel = `${w}w ${d}d old`

              const pendingMilestone = DEFAULT_MILESTONES_CHECK.find(
                (m) => dDays >= m.day && !batch.completedMilestones[m.id],
              )
              const isHarvestReady = dDays >= (batch.targetWeeks || 6) * 7

              if (isHarvestReady) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    <ShoppingBag className="w-3 h-3" /> Cycle Complete
                  </span>
                )
              } else if (pendingMilestone) {
                const isDueToday = dDays === pendingMilestone.day
                statusBadge = (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isDueToday
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 animate-pulse'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}
                  >
                    <Syringe className="w-3 h-3" />{' '}
                    {isDueToday
                      ? `Vaccine Due: Day ${pendingMilestone.day}`
                      : `Pending: ${pendingMilestone.title}`}
                  </span>
                )
              } else {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <CheckSquare className="w-3 h-3" /> On Schedule
                  </span>
                )
              }
            }
          }

          return (
            <div
              key={batch.id}
              onClick={() => {
                onSelectBatch(batch.id)
                onCloseDrawer()
              }}
              className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive
                        ? 'bg-emerald-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  ></span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {batch.name}
                  </h4>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {batch.poultryType}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-4">
                  <span className="font-mono font-semibold">{bAlive}</span>{' '}
                  birds • {ageLabel}
                </p>
                {statusBadge && <div className="pl-4 pt-1">{statusBadge}</div>}
              </div>
              <button
                onClick={(e) => handleDeleteBatch(e, batch.id)}
                title="Delete"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Currency & JSON Backup/Restore */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Farm Currency
          </span>
          <select
            value={currency}
            onChange={(e) =>
              queryClient.setQueryData(CURRENCY_QUERY_KEY, e.target.value)
            }
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="₦">NGN (₦)</option>
            <option value="$">USD ($)</option>
            <option value="£">GBP (£)</option>
            <option value="€">EUR (€)</option>
            <option value="GH₵">GHS (GH₵)</option>
            <option value="KSh">KES (KSh)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(
                  JSON.stringify({ batches, activeBatchId, currency }, null, 2),
                )
              const dl = document.createElement('a')
              dl.setAttribute('href', dataStr)
              dl.setAttribute(
                'download',
                `Poultnova_Backup_${new Date().toISOString().slice(0, 10)}.json`,
              )
              dl.click()
            }}
            className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Backup JSON</span>
          </button>
          <label className="cursor-pointer py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (evt) => {
                  try {
                    const parsed = JSON.parse(evt.target?.result as string)
                    if (parsed && Array.isArray(parsed.batches)) {
                      queryClient.setQueryData(
                        BATCHES_QUERY_KEY,
                        parsed.batches,
                      )
                      onSelectBatch(
                        parsed.activeBatchId || parsed.batches[0].id,
                      )
                      if (parsed.currency)
                        queryClient.setQueryData(
                          CURRENCY_QUERY_KEY,
                          parsed.currency,
                        )
                      onCloseDrawer()
                      triggerToast(
                        'info',
                        'Backup Restored',
                        'Your Poultnova farm data was imported successfully.',
                      )
                    }
                  } catch (err) {
                    triggerToast(
                      'error',
                      'Invalid File',
                      'Could not parse backup JSON file.',
                    )
                  }
                }
                reader.readAsText(file)
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
