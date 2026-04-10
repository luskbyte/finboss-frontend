interface StatCardProps {
    title: string
    value: string
    subtitle?: string
    color?: string
    icon?: React.ReactNode
}

const colorClasses: Record<string, string> = {
    'var(--green)': 'text-green',
    'var(--red)': 'text-red',
    'var(--blue)': 'text-blue',
    'var(--purple)': 'text-purple',
    'var(--yellow)': 'text-yellow',
}

export default function StatCard({ title, value, subtitle, color = 'var(--blue)', icon }: StatCardProps) {
    const colorClass = colorClasses[color] || 'text-blue'
    
    return (
        <div className="bg-surface border border-border rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    {title}
                </span>
                {icon && <span className={colorClass}>{icon}</span>}
            </div>
            <div className={`text-[26px] font-bold ${colorClass}`}>{value}</div>
            {subtitle && <div className="text-xs text-text-muted">{subtitle}</div>}
        </div>
    )
}