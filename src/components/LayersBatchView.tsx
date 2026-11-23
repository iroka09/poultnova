import { useState } from 'react'
import { Egg, Plus, Trash2 } from 'lucide-react'
import {
  PoultryOperationsEngine,
  type WeeklyBenchmark,
  type MilestoneItem,
} from './PoultryOperationsEngine'
import type { Batch } from './types'

const LAYERS_GUIDE: WeeklyBenchmark[] = [
  {
    week: 0,
    temp: '32–34°C',
    tempNote: 'Warm brooder 24/7',
    feed: 'Chick Mash (Starter)',
    gPerBird: 15,
    stage: 'Week 1 • Pullet Brooding',
    tip: 'Ensure uniform chick body weight from week 1—uniformity determines peak egg production later.',
  },
  {
    week: 1,
    temp: '29–31°C',
    tempNote: 'Reduce heat ~2.5°C',
    feed: 'Chick Mash',
    gPerBird: 25,
    stage: 'Week 2 • Early Pullet Frame',
    tip: 'Provide adequate drinker space and keep litter completely dry.',
  },
  {
    week: 4,
    temp: '21–24°C',
    tempNote: 'Ambient temperature',
    feed: 'Chick → Grower Mash',
    gPerBird: 48,
    stage: 'Weeks 5–8 • Skeletal Development',
    tip: 'Pullets build 85% of their skeletal frame before week 12. Do not skimp on protein/minerals.',
  },
  {
    week: 8,
    temp: '20–24°C',
    tempNote: 'Ambient temperature',
    feed: 'Pullet Grower Mash',
    gPerBird: 68,
    stage: 'Weeks 9–15 • Rearing Phase',
    tip: 'Maintain constant day-length lighting during rearing; never increase light hours prematurely.',
  },
  {
    week: 16,
    temp: '20–24°C',
    tempNote: 'Keep pen calm & ventilated',
    feed: 'Pre-Lay Mash (2% Calcium)',
    gPerBird: 90,
    stage: 'Weeks 16–17 • Pre-Lay Conditioning',
    tip: 'Switch to Pre-Lay mash to build medullary bone calcium reserves before the first egg drops.',
  },
  {
    week: 18,
    temp: '19–23°C',
    tempNote: 'Optimal laying temp',
    feed: 'Layer Mash (3.8% Calcium)',
    gPerBird: 115,
    stage: 'Week 18+ • Active Egg Production',
    tip: 'Step up lighting to 16 hours/day and collect eggs at least 3 times daily to prevent breakage and egg eating.',
  },
]

const LAYERS_WEIGHTS = [
  36, 75, 130, 200, 285, 380, 480, 585, 690, 795, 900, 1000, 1100, 1190, 1280,
  1360, 1440,
]

const LAYERS_MILESTONES: MilestoneItem[] = [
  {
    id: 'lm1',
    day: 1,
    title: 'Anti-Stress + Multivitamins',
    desc: 'Glucose & vitamins for chick recovery.',
  },
  {
    id: 'lm2',
    day: 7,
    title: '1st Gumboro (IBD) Vaccine',
    desc: 'Administer via chlorine-free drinking water.',
  },
  {
    id: 'lm3',
    day: 14,
    title: '1st Lasota (Newcastle) Vaccine',
    desc: 'Primary Newcastle immunization.',
  },
  {
    id: 'lm4',
    day: 21,
    title: '2nd Gumboro Booster',
    desc: 'Second IBD booster.',
  },
  {
    id: 'lm5',
    day: 28,
    title: '2nd Lasota Booster',
    desc: 'Newcastle booster dose.',
  },
  {
    id: 'lm6',
    day: 42,
    title: 'Fowl Pox + Fowl Typhoid Vaccine',
    desc: 'Wing-web Fowl Pox & intramuscular Typhoid protection.',
  },
  {
    id: 'lm7',
    day: 56,
    title: 'Komarov (NDV) + Deworming',
    desc: 'Long-lasting Newcastle immunity + broad-spectrum dewormer.',
  },
  {
    id: 'lm8',
    day: 112,
    title: 'EDS-76 + NDV Oil Emulsion (Point of Lay)',
    desc: 'Protects against Egg Drop Syndrome prior to week 18.',
  },
]

export function LayersBatchView(props: {
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
  triggerToast: (
    type: 'error' | 'warning' | 'info',
    title: string,
    msg: string,
  ) => void
}) {
  const [crates, setCrates] = useState('')
  const [loose, setLoose] = useState('')
  const [cracked, setCracked] = useState('')

  const eggLogs = props.activeBatch.eggLogs || []
  const latestLog = eggLogs[0]
  const latestTotalEggs = latestLog
    ? latestLog.cratesCollected * 30 + latestLog.looseEggs
    : 0
  const henDayPct =
    props.alive > 0 && latestTotalEggs > 0
      ? ((latestTotalEggs / props.alive) * 100).toFixed(1)
      : '0.0'

  const handleLogEggs = () => {
    const c = parseInt(crates, 10) || 0
    const l = parseInt(loose, 10) || 0
    const cr = parseInt(cracked, 10) || 0
    if (c === 0 && l === 0) return

    props.updateActiveBatch((b) => {
      b.eggLogs = [
        {
          id: 'egg_' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          cratesCollected: c,
          looseEggs: l,
          crackedEggs: cr,
        },
        ...(b.eggLogs || []),
      ]
      return b
    })
    setCrates('')
    setLoose('')
    setCracked('')
    props.triggerToast(
      'info',
      'Egg Collection Recorded',
      `Logged ${c} crate(s) + ${l} eggs (${c * 30 + l} total eggs).`,
    )
  }

  const layersEggProductionPanel = (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Egg className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Egg Production & Hen-Day % Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest Hen-Day Production:{' '}
              <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                {henDayPct}%
              </strong>{' '}
              ({latestTotalEggs} eggs / {props.alive} hens)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min="0"
            value={crates}
            onChange={(e) => setCrates(e.target.value)}
            placeholder="Crates (30s)"
            className="w-28 h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
          />
          <input
            type="number"
            min="0"
            max="29"
            value={loose}
            onChange={(e) => setLoose(e.target.value)}
            placeholder="Loose"
            className="w-20 h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
          />
          <input
            type="number"
            min="0"
            value={cracked}
            onChange={(e) => setCracked(e.target.value)}
            placeholder="Cracked"
            className="w-20 h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleLogEggs}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Record Pick
          </button>
        </div>
      </div>

      {eggLogs.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Crates (30s)</th>
                <th className="py-2.5 px-4">Loose</th>
                <th className="py-2.5 px-4">Cracked</th>
                <th className="py-2.5 px-4">Total Eggs</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {eggLogs.slice(0, 7).map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 px-4 font-mono">{log.date}</td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {log.cratesCollected}
                  </td>
                  <td className="py-2.5 px-4 font-mono">{log.looseEggs}</td>
                  <td className="py-2.5 px-4 font-mono text-rose-500">
                    {log.crackedEggs}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">
                    {log.cratesCollected * 30 + log.looseEggs}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() =>
                        props.updateActiveBatch((b) => {
                          b.eggLogs = (b.eggLogs || []).filter(
                            (x) => x.id !== log.id,
                          )
                          return b
                        })
                      }
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )

  return (
    <PoultryOperationsEngine
      {...props}
      weeklyGuide={LAYERS_GUIDE}
      standardWeights={LAYERS_WEIGHTS}
      milestones={LAYERS_MILESTONES}
      breedDisplayName="ISA Brown Layer"
      extraTabContent={layersEggProductionPanel}
    />
  )
}
