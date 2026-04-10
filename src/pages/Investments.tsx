import { LineChart } from 'lucide-react'

export default function InvestmentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-bold mb-1">Investimentos</h1>
        <p className="text-text-muted text-[13px]">Área reservada para acompanhar sua carteira.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <LineChart size={40} className="mx-auto mb-3 opacity-40 text-purple" />
        <p className="font-medium">Módulo de investimentos em construção</p>
        <p className="text-sm mt-1">Aqui você poderá visualizar aportes, rentabilidade e evolução patrimonial.</p>
      </div>
    </div>
  )
}
