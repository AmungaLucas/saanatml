'use client'

interface AdPlaceholderProps {
  variant?: 'banner' | 'sidebar' | 'in-feed'
  className?: string
}

export function AdPlaceholder({ variant = 'banner', className = '' }: AdPlaceholderProps) {
  const configs = {
    banner: {
      width: 'w-full',
      height: 'h-[90px]',
      label: 'Advertisement',
      maxWidth: 'max-w-[728px]',
    },
    sidebar: {
      width: 'w-[300px]',
      height: 'h-[250px]',
      label: 'Advertisement',
      maxWidth: '',
    },
    'in-feed': {
      width: 'w-full',
      height: 'h-[90px]',
      label: 'Sponsored',
      maxWidth: 'max-w-[728px]',
    },
  }

  const config = configs[variant]

  return (
    <div className={`${config.width} ${config.maxWidth} mx-auto ${className}`}>
      <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
        {config.label}
      </span>
      <div
        className={`${config.height} w-full border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20`}
      >
        <span className="text-xs text-muted-foreground/50 font-mono">Ad Space</span>
      </div>
    </div>
  )
}
