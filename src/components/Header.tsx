import { Link } from '@tanstack/react-router'
import { Menu, Stethoscope } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BATCHES_QUERY_KEY, type Batch } from './types'

interface HeaderProps {
  onOpenDrawer: () => void
  isDark: boolean
  activeBatch: Batch
}

export function Header({ onOpenDrawer, isDark, activeBatch }: HeaderProps) {
  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: BATCHES_QUERY_KEY,
    enabled: false,
  })

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            aria-label="Open Batch Drawer"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-800 dark:text-slate-200 transition-colors relative"
          >
            <Menu className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
              {batches.length || 1}
            </span>
          </button>

          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center">
              <img
                src={
                  isDark
                    ? '/poultnova-logo-dark.png'
                    : '/poultnova-logo-light.png'
                }
                alt="Poultnova Logo"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-2.5">
              <div className="flex items-center gap-1.5">
                <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {activeBatch.poultryType.toUpperCase()} ERP
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px] sm:max-w-[220px]">
                {activeBatch.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/advisor"
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Health Advisor</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>poultnova.com</span>
          </div>
        </div>
      </div>
    </header>
  )
}
