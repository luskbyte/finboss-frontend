import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import { LineChart, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend } from 'recharts';

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#10b981', '#8b5cf6'];

const categoryLabels: Record<string, string> = {
    salary: 'Salário',
    freelance: 'Freelance',
    bonus: 'Bônus',
    dividend: 'Dividendos',
    housing: 'Moradia',
    food: 'Alimentação',
    transport: 'Transporte',
    health: 'Saúde',
    education: 'Educação',
    entertainment: 'Lazer',
    clothing: 'Vestuário',
    other: 'Outro',
}

export default function Dashboard() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardApi.getSummary(new Date().getFullYear()),
    })

    if (isLoading) {
        return <div className="text-text-muted">Carregando...</div>
    }

    if (isError) {
        return (
            <div className="rounded-xl border border-border bg-surface p-5 text-sm text-text-muted">
                Não foi possível carregar o dashboard agora.
            </div>
        )
    }

    if (!data) {
        return (
            <div className="rounded-xl border border-border bg-surface p-5 text-sm text-text-muted">
                Nenhum dado disponível para o dashboard.
            </div>
        )
    }

    const expensePie = Object.entries(data.expense_by_category || {}).map(([k, v], i) => ({
        name: categoryLabels[k] ?? k,
        value: v,
        fill: COLORS[i % COLORS.length],
    }))

    const sortedMonthly = data.monthly_balance || []

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[22px] font-bold mb-1">Dashboard</h1>
                <p className="text-text-muted text-[13px]">{new Date().getFullYear()}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Receita Total"
                    value={fmt(data.total_income)}
                    icon={<TrendingUp size={18} />}
                    color="var(--green)"
                />
                <StatCard
                    title="Despesa Total"
                    value={fmt(data.total_expenses)}
                    icon={<TrendingDown size={18} />}
                    color="var(--red)"
                />
                <StatCard
                    title="Saldo"
                    value={fmt(data.balance)}
                    icon={<Wallet size={18} />}
                    color={data.balance >= 0 ? 'var(--green)' : 'var(--red)'}
                />
                <StatCard
                    title="Valor Investido"
                    value={fmt(data.total_invested)}
                    subtitle={`${data.portfolio_return >= 0 ? '+' : ''}${data.portfolio_return.toFixed(2)}% de retorno`}
                    icon={<LineChart size={18} />}
                    color="var(--purple)"
                />    
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-4">
                <div className="bg-surface border border-border rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <h2 className="text-sm font-semibold mb-5">Receita x Despesa por Mês</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={sortedMonthly} barGap={4}>
                            <XAxis dataKey="month" tick={{ fill: "#7c859e", fontSize: 11 }} />
                            <YAxis tick={{ fill: "#7c859e", fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}`} />
                            <Tooltip 
                                contentStyle={{background: "#22263a", border: "1px solid #2a2f45", borderRadius: 8 }}
                                formatter={(v) => fmt(Number(v))} 
                            />
                            <Bar dataKey="income" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />

                            <Bar dataKey="expenses" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-surface border border-border rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <h2 className="text-sm font-semibold mb-5">Gastos por Categoria</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} />
                            <Tooltip 
                                contentStyle={{background: "#22263a", border: "1px solid #2a2f45", borderRadius: 8 }}
                                formatter={(v) => fmt(Number(v))} 
                            />
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

