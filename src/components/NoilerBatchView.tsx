import { useState } from 'react'
import { Egg, Plus } from 'lucide-react'
import {
  PoultryOperationsEngine,
  type WeeklyBenchmark,
  type MilestoneItem,
} from './PoultryOperationsEngine'
import type { Batch } from './types'

const NOILER_GUIDE: WeeklyBenchmark[] = [
  {
    week: 0,
    temp: '32–34°C',
    tempNote: 'Brooder heat required',
    feed: 'Chick & Duck Mash',
    gPerBird: 18,
    stage: 'Week 1 • Noiler Brooding',
    tip: 'Provide glucose + multivitamins on arrival. Noilers are hardy but require strict warmth in week 1.',
  },
  {
    week: 1,
    temp: '29–31°C',
    tempNote: 'Step down heat gradually',
    feed: 'Chick & Duck Mash',
    gPerBird: 32,
    stage: 'Week 2 • Early Immunity',
    tip: 'Keep litter dry and ensure clean drinking water at all times.',
  },
  {
    week: 2,
    temp: '26–28°C',
    tempNote: 'Night warmth only',
    feed: 'Chick & Duck Mash',
    gPerBird: 45,
    stage: 'Week 3 • Feathering',
    tip: 'Introduce perches early if raising dual-purpose birds for semi-intensive housing.',
  },
  {
    week: 3,
    temp: '23–25°C',
    tempNote: 'Ambient temperature',
    feed: 'Chick → Grower Mash',
    gPerBird: 58,
    stage: 'Week 4 • Transition Stage',
    tip: 'Gradually transition from Chick Mash to Grower Mash over 4 days.',
  },
  {
    week: 4,
    temp: '20–24°C',
    tempNote: 'Ambient / Free-range ready',
    feed: 'Grower Mash',
    gPerBird: 70,
    stage: 'Weeks 5–8 • Frame & Muscle Build',
    tip: 'Noilers forage well. Supplement commercial feed with greens/forage to lower feed cost per bird.',
  },
  {
    week: 8,
    temp: '20–25°C',
    tempNote: 'Ambient temperature',
    feed: 'Grower / Finisher Mash',
    gPerBird: 95,
    stage: 'Weeks 9–12 • Pre-Market Weight',
    tip: 'Administer routine dewormer if birds have outdoor run access.',
  },
  {
    week: 12,
    temp: '20–25°C',
    tempNote: 'Ambient temperature',
    feed: 'Finisher / Layer Transition',
    gPerBird: 115,
    stage: 'Week 13+ • Market / Dual-Purpose Lay',
    tip: 'Cockerels reach prime table weight (1.8kg–2.4kg); hens can be retained for hardy egg production.',
  },
]

const NOILER_WEIGHTS = [
  38, 110, 230, 390, 580, 790, 1020, 1260, 1510, 1750, 1980, 2190, 2380, 2550,
  2700, 2820, 2920,
]

const NOILER_MILESTONES: MilestoneItem[] = [
  {
    id: 'nm1',
    day: 1,
    title: 'Anti-Stress + Multivitamins',
    desc: 'Glucose & vitamins for first 3–5 days.',
  },
  {
    id: 'nm2',
    day: 7,
    title: '1st Gumboro (IBD) Vaccine',
    desc: 'Administer via chlorine-free drinking water.',
  },
  {
    id: 'nm3',
    day: 14,
    title: '1st Lasota (Newcastle) Vaccine',
    desc: 'Protects against Newcastle viral outbreak.',
  },
  {
    id: 'nm4',
    day: 21,
    title: '2nd Gumboro Booster',
    desc: 'Second IBD booster dose.',
  },
  {
    id: 'nm5',
    day: 28,
    title: '2nd Lasota Booster',
    desc: 'Newcastle booster dose.',
  },
  {
    id: 'nm6',
    day: 42,
    title: 'Fowl Pox Vaccine (Wing Web)',
    desc: 'Essential for hardy dual-purpose & semi-intensive flocks.',
  },
  {
    id: 'nm7',
    day: 56,
    title: 'Broad-Spectrum Deworming',
    desc: 'Piperazine / Levamisole dewormer in drinking water.',
  },
]

export function NoilerBatchView(props: {
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

  const handleLogEggs = () => {
    const c = parseInt(crates, 10) || 0
    const l = parseInt(loose, 10) || 0
    if (c === 0 && l === 0) return
    props.updateActiveBatch((b) => {
      b.eggLogs = [
        {
          id: 'egg_' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          cratesCollected: c,
          looseEggs: l,
          crackedEggs: 0,
        },
        ...(b.eggLogs || []),
      ]
      return b
    })
    setCrates('')
    setLoose('')
    props.triggerToast(
      'info',
      'Noiler Eggs Logged',
      `Recorded ${c} crate(s) and ${l} loose egg(s).`,
    )
  }

  const dualPurposeEggWidget = (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
          <Egg className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Dual-Purpose Egg Collection (Noiler Hens)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total Logged:{' '}
            <strong className="font-mono text-emerald-600">
              {(props.activeBatch.eggLogs || []).reduce(
                (s, x) => s + x.cratesCollected,
                0,
              )}{' '}
              crates
            </strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
        <button
          type="button"
          onClick={handleLogEggs}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Log Eggs
        </button>
      </div>
    </section>
  )

  return (
    <PoultryOperationsEngine
      {...props}
      weeklyGuide={NOILER_GUIDE}
      standardWeights={NOILER_WEIGHTS}
      milestones={NOILER_MILESTONES}
      breedDisplayName="Amo Noiler"
      extraTabContent={dualPurposeEggWidget}
    />
  )
}
