
import React from 'react'
import { cn } from '@/lib/utils'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'outline'|'ghost' }
export function Button({ className, variant='default', ...props }: Props) {
  const base = 'px-4 py-2 rounded-2xl text-sm font-medium transition shadow-sm'
  const styles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50',
    ghost: 'hover:bg-slate-100'
  }[variant]
  return <button className={cn(base, styles, className)} {...props} />
}
