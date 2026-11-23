export type Theme = 'dark' | 'light' | 'system'
export type PoultryType = 'broiler' | 'noiler' | 'layers'

export interface ExpenseItem {
  id: string
  item: string
  cost: number
  date: string
}

export interface BuyerOrder {
  id: string
  name: string
  phone: string
  qty: number
  paid: boolean
  productType?: 'live_birds' | 'egg_crates'
}

export interface DailyEggLog {
  id: string
  date: string
  cratesCollected: number
  looseEggs: number
  crackedEggs: number
}

export interface Batch {
  id: string
  name: string
  poultryType: PoultryType
  arrivalDate: string
  birdCount: number
  breed: string
  breedLabel: string
  targetWeeks: number
  targetWeeksLabel: string
  mortality: number
  sellingPricePerBird: number
  sellingPricePerCrate: number
  completedMilestones: Record<string, boolean>
  expenses: ExpenseItem[]
  sampleWeights: Record<number, number>
  feedBagsInStore: number
  eggLogs: DailyEggLog[]
  iot: {
    tempC: number
    humidity: number
    powerOn: boolean
    backupHeat: boolean
    ventilationOk: boolean
    lightingHours: number
  }
  buyers: BuyerOrder[]
}

export const BATCHES_QUERY_KEY = ['poultnova_batches_v1']
export const CURRENCY_QUERY_KEY = ['poultnova_currency_v1']

export function createDefaultBatch(
  index = 1,
  poultryType: PoultryType = 'broiler',
): Batch {
  const defaults = {
    broiler: {
      name: `Broiler Batch #${index}`,
      breed: 'cobb500',
      breedLabel: 'Cobb 500 (Fast Breast Yield)',
      targetWeeks: 6,
      targetWeeksLabel: '6 Weeks (42 Days)',
      sellingPricePerBird: 8500,
      sellingPricePerCrate: 0,
      chickLabel: 'Day-Old Broiler Chicks (50 pcs)',
      feedLabel: 'Broiler Starter Feed (2 bags)',
    },
    noiler: {
      name: `Noiler Batch #${index}`,
      breed: 'amo_noiler',
      breedLabel: 'Amo Noiler (Dual-Purpose Hardy)',
      targetWeeks: 14,
      targetWeeksLabel: '14 Weeks (98 Days)',
      sellingPricePerBird: 7500,
      sellingPricePerCrate: 4800,
      chickLabel: 'Day-Old Noiler Chicks (50 pcs)',
      feedLabel: 'Chick & Duck Mash (2 bags)',
    },
    layers: {
      name: `Layer Flock #${index}`,
      breed: 'isa_brown',
      breedLabel: 'ISA Brown (High Egg Yield)',
      targetWeeks: 72,
      targetWeeksLabel: '72 Weeks (Full Lay Cycle)',
      sellingPricePerBird: 5500,
      sellingPricePerCrate: 5200,
      chickLabel: 'Day-Old Pullet Chicks (50 pcs)',
      feedLabel: 'Chick Mash Starter (2 bags)',
    },
  }[poultryType]

  return {
    id: 'batch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: defaults.name,
    poultryType,
    arrivalDate: '',
    birdCount: 50,
    breed: defaults.breed,
    breedLabel: defaults.breedLabel,
    targetWeeks: defaults.targetWeeks,
    targetWeeksLabel: defaults.targetWeeksLabel,
    mortality: 0,
    sellingPricePerBird: defaults.sellingPricePerBird,
    sellingPricePerCrate: defaults.sellingPricePerCrate,
    completedMilestones: {},
    expenses: [
      {
        id: 'ex_1_' + Math.random().toString(36).slice(2, 5),
        item: defaults.chickLabel,
        cost: 47500,
        date: new Date().toISOString().slice(0, 10),
      },
      {
        id: 'ex_2_' + Math.random().toString(36).slice(2, 5),
        item: defaults.feedLabel,
        cost: 42000,
        date: new Date().toISOString().slice(0, 10),
      },
      {
        id: 'ex_3_' + Math.random().toString(36).slice(2, 5),
        item: 'Vaccines & Anti-Stress',
        cost: 6500,
        date: new Date().toISOString().slice(0, 10),
      },
    ],
    sampleWeights: {},
    feedBagsInStore: 4,
    eggLogs: [],
    iot: {
      tempC: 32.5,
      humidity: 60,
      powerOn: true,
      backupHeat: true,
      ventilationOk: true,
      lightingHours: 16,
    },
    buyers: [],
  }
}
