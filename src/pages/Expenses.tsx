import { TrendingDown } from 'lucide-react'

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-bold mb-1">Despesas</h1>
        <p className="text-text-muted text-[13px]">Tela em preparação para o controle de gastos.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <TrendingDown size={40} className="mx-auto mb-3 opacity-40 text-red" />
        <p className="font-medium">Módulo de despesas em construção</p>
        <p className="text-sm mt-1">Em breve você poderá cadastrar e acompanhar seus gastos aqui.</p>
      </div>
    </div>
  )
}
