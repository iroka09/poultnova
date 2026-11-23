import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'

interface FooterProps {
  onOpenDrawer: () => void
  isDark: boolean
}

export function Footer({ onOpenDrawer, isDark }: FooterProps) {
  return (
    <footer className="bg-gradient-to-r from-slate-50 dark:from-slate-950 via-white dark:via-slate-900 to-slate-50 dark:to-slate-950 border-t-2 border-emerald-500/30 mt-auto shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={
                  isDark
                    ? '/poultnova-logo-dark.png'
                    : '/poultnova-logo-light.png'
                }
                alt="Poultnova Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Precision commercial poultry management software at{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                poultnova.com
              </strong>
              . Engineered for broilers, noilers, and layers—featuring automated
              feed calculations, egg production logs, live IoT biosecurity, and
              profit tracking.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Biosecurity & Farm Protocol
            </h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />{' '}
                Disinfect footbath at pen entrance daily
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />{' '}
                Scrub and sanitize bell drinkers every morning
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />{' '}
                Remove wet caked litter instantly to prevent coccidiosis
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Resources & Health
            </h4>
            <ul className="text-xs space-y-2">
              <li>
                <Link
                  to="/advisor"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Poultry Health & Treatment Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} Poultnova Poultry Systems
            (poultnova.com) • All Rights Reserved
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={onOpenDrawer}
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Switch Batch
            </button>
            <Link
              to="/advisor"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Poultry Health & Treatment Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
