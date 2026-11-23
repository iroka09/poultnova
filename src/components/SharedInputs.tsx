import { useState, useEffect, useRef } from 'react'

export function AutoGrowTextarea({
  value,
  onChange,
  className = '',
  ariaLabel,
  placeholder,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  ariaLabel?: string
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const resize = () => {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      className={`block w-full resize-none overflow-hidden ${className}`}
    />
  )
}

export function FormattedCurrencyInput({
  value,
  onChange,
  ariaLabel,
  placeholder = '0',
  className = '',
}: {
  value: number
  onChange: (val: number) => void
  ariaLabel?: string
  placeholder?: string
  className?: string
}) {
  const formatDisplay = (num: number) => {
    if (!num && num !== 0) return ''
    return num === 0 ? '' : num.toLocaleString('en-US')
  }

  const [display, setDisplay] = useState<string>(() => formatDisplay(value))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setDisplay(formatDisplay(value))
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '').replace(/[^\d.]/g, '')
    if (raw === '') {
      setDisplay('')
      onChange(0)
      return
    }
    const parts = raw.split('.')
    const cleaned =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : raw

    const numeric = parseFloat(cleaned)
    if (!isNaN(numeric)) {
      const intFormatted = parseInt(parts[0] || '0', 10).toLocaleString('en-US')
      const formatted =
        parts.length > 1 ? `${intFormatted}.${parts[1]}` : intFormatted
      setDisplay(formatted)
      onChange(numeric)
    }
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={display}
      onFocus={() => {
        setIsFocused(true)
        if (value === 0) setDisplay('')
      }}
      onBlur={() => {
        setIsFocused(false)
        setDisplay(formatDisplay(value))
      }}
      onChange={handleChange}
      className={className}
    />
  )
}
