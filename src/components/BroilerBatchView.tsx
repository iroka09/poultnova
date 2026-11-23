import { useState } from 'react'
import { Scale } from 'lucide-react'
import {
  PoultryOperationsEngine,
  type WeeklyBenchmark,
  type MilestoneItem,
} from './PoultryOperationsEngine'
import type { Batch } from './types'

const BROILER_GUIDE: WeeklyBenchmark[] = [
  {
    week: 0,
    temp: '32–34°C',
    tempNote: 'High heat needed 24/7',
    feed: 'Broiler Super Starter',
    gPerBird: 22,
    stage: 'Week 1 • Critical Brooding',
    tip: 'Chicks cannot regulate body temperature yet. Keep brooder warm and draft-free; give glucose + vitamins on arrival.',
  },
  {
    week: 1,
    temp: '29–31°C',
    tempNote: 'Reduce heat by ~2–3°C',
    feed: 'Broiler Starter Crumbs',
    gPerBird: 45,
    stage: 'Week 2 • Early Growth',
    tip: "Raise feeder and drinker heights slightly to match chick backs so they don't waste feed or wet the litter.",
  },
  {
    week: 2,
    temp: '26–28°C',
    tempNote: 'Moderate warmth at night',
    feed: 'Broiler Starter',
    gPerBird: 75,
    stage: 'Week 3 • Feathering Stage',
    tip: 'Ensure strong ventilation to clear ammonia buildup while preventing cold wind directly hitting the birds.',
  },
  {
    week: 3,
    temp: '23–25°C',
    tempNote: 'Room temp (heat off in day)',
    feed: 'Starter → Grower Mix',
    gPerBird: 105,
    stage: 'Week 4 • Rapid Frame Growth',
    tip: 'Transition gradually from Starter to Finisher over 3 days (75/25, 50/50, 25/75) to prevent digestive stress.',
  },
  {
    week: 4,
    temp: '20–23°C',
    tempNote: 'Ambient temperature',
    feed: 'Broiler Finisher Pellets',
    gPerBird: 135,
    stage: 'Week 5 • Muscle & Weight Gain',
    tip: 'Feed intake jumps sharply now. Ensure plenty of clean, cool drinking water—water intake is ~2x feed weight.',
  },
  {
    week: 5,
    temp: '18–22°C',
    tempNote: 'Keep pen well-ventilated',
    feed: 'Broiler Finisher Pellets',
    gPerBird: 160,
    stage: 'Week 6 • Market / Harvest Window',
    tip: 'Your flock is entering prime market weight! Confirm buyer pickups and observe drug withdrawal periods.',
  },
  {
    week: 6,
    temp: '18–22°C',
    tempNote: 'Prevent heat stress',
    feed: 'Broiler Finisher Pellets',
    gPerBird: 175,
    stage: 'Week 7 • Heavy Broiler',
    tip: 'Monitor feed conversion closely; older birds eat more per kg of weight gained. Avoid overcrowding.',
  },
  {
    week: 7,
    temp: '18–22°C',
    tempNote: 'Prevent heat stress',
    feed: 'Broiler Finisher Pellets',
    gPerBird: 185,
    stage: 'Week 8+ • Jumbo / Mature',
    tip: 'Watch out for heat stress and leg weakness in heavy birds. Harvest soon for optimal profit margin.',
  },
]

const BROILER_BREED_WEIGHTS: Record<string, number[]> = {
  cobb500: [
    42, 185, 465, 940, 1560, 2240, 2910, 3520, 4050, 4500, 4900, 5200, 5500,
  ],
  ross308: [
    42, 180, 450, 910, 1510, 2180, 2840, 3450, 3980, 4420, 4810, 5100, 5400,
  ],
  arbor: [
    42, 175, 440, 890, 1480, 2130, 2790, 3390, 3910, 4350, 4720, 5000, 5300,
  ],
}

const BROILER_MILESTONES: MilestoneItem[] = [
  {
    id: 'm1',
    day: 1,
    title: 'Anti-Stress + Multivitamins',
    desc: 'Glucose & vitamins in drinking water for first 3–5 days.',
  },
  {
    id: 'm2',
    day: 7,
    title: '1st Gumboro (IBD) Vaccine',
    desc: 'Administer via clean, chlorine-free drinking water.',
  },
  {
    id: 'm3',
    day: 14,
    title: '1st Lasota (Newcastle) Vaccine',
    desc: 'Boosts immunity against Newcastle disease.',
  },
  {
    id: 'm4',
    day: 21,
    title: '2nd Gumboro Booster + Coccidiosis Check',
    desc: 'Repeat Gumboro; watch droppings for blood/wet litter.',
  },
  {
    id: 'm5',
    day: 28,
    title: '2nd Lasota Booster & Finisher Switch',
    desc: 'Final viral booster + full switch to Broiler Finisher.',
  },
  {
    id: 'm6',
    day: 35,
    title: 'Plain Water Only (Withdrawal Period)',
    desc: 'Stop all antibiotics/medications 5–7 days before harvest.',
  },
]

export function BroilerBatchView(props: {
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
  const [totalBagsConsumed, setTotalBagsConsumed] = useState(12)
  const breedKey = BROILER_BREED_WEIGHTS[props.activeBatch.breed]
    ? props.activeBatch.breed
    : 'cobb500'
  const standardWeights = BROILER_BREED_WEIGHTS[breedKey]

  const latestSampleWeightG =
    Object.values(props.activeBatch.sampleWeights).pop() ||
    standardWeights[Math.min(props.weeks + 1, standardWeights.length - 1)]
  const totalLiveMeatKg = (props.alive * latestSampleWeightG) / 1000
  const totalFeedKg = totalBagsConsumed * 25
  const fcr =
    totalLiveMeatKg > 0 ? (totalFeedKg / totalLiveMeatKg).toFixed(2) : '0.00'

  const broilerHeaderControls = (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold uppercase text-slate-500">
          Broiler Strain:
        </label>
        <select
          value={breedKey}
          onChange={(e) =>
            props.updateActiveBatch((b) => ({ ...b, breed: e.target.value }))
          }
          className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
        >
          <option value="cobb500">Cobb 500 (Fast Breast Yield)</option>
          <option value="ross308">Ross 308 (High FCR Efficiency)</option>
          <option value="arbor">Arbor Acres Plus</option>
        </select>
      </div>

      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
        <Scale className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-slate-500">Bags Fed:</span>
        <input
          type="number"
          min="1"
          value={totalBagsConsumed}
          onChange={(e) =>
            setTotalBagsConsumed(parseFloat(e.target.value) || 0)
          }
          className="w-14 bg-transparent font-mono font-bold text-xs text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-700 text-center"
        />
        <span className="text-xs text-slate-500">Live FCR:</span>
        <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          {fcr}
        </span>
      </div>
    </div>
  )

  return (
    <PoultryOperationsEngine
      {...props}
      weeklyGuide={BROILER_GUIDE}
      standardWeights={standardWeights}
      milestones={BROILER_MILESTONES}
      breedDisplayName={breedKey.toUpperCase()}
      extraTopBanner={broilerHeaderControls}
    />
  )
}
