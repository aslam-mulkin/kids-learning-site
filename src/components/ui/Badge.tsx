
import React from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-block rounded-full bg-slate-200 px-2 py-1 text-xs', className)} {...props} />
}
