
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Income } from "../types";
import { INCOME_CATEGORIES } from "../types";
import { incomeApi } from "../services/api";
import { Divide, Plus, TrendingUp, Pencil, Trash2 } from "lucide-react";

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const catLabel = (v: string) =>
    INCOME_CATEGORIES.find(c => c.value === v)?.label ?? v

const emptyForm = {
    description: '',
    amount: 0,
    category: 'salary',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
}

export default function IncomePage() {
    const qc = useQueryClient()
    const [modal, setModal] = useState<'create' | 'edit' | null>(null)
    const [editing, setEditing] = useState<Income | null>(null)
    const [form, setForm] = useState(emptyForm)

    const { data = [], isLoading } = useQuery({
        queryKey: ['incomes'],
        queryFn: incomeApi.list,
    })

    const createMutation = useMutation({
        mutationFn: incomeApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['incomes']});
            qc.invalidateQueries({ queryKey: ['dashboard']});
            setModal(null);
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<Income> }) => incomeApi.update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['incomes']});
            qc.invalidateQueries({ queryKey: ['dashboard']});
            setModal(null);
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => incomeApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['incomes']});
            qc.invalidateQueries({ queryKey: ['dashboard']});
        }
    })

    const openEdit = (income: Income) => {
        setEditing(income);
        setForm({
            description: income.description,
            amount: income.amount,
            category: income.category,
            date: income.date,
            recurring: income.recurring,
        });
        setModal('edit');
    }

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModal('create');
    }

    const handleSubmit = () => (e: React.SyntheticEvent) => {
        e.preventDefault();
        const payload = { ...form, amount: Number(form.amount), date: new Date(form.date).toISOString() }
        if (modal === 'edit' && editing) {
            updateMutation.mutate({ id: editing.id, data: payload });
        } else {
            createMutation.mutate(payload as any);
        }
    }

    const total = data.reduce((s, i) => s + i.amount, 0 );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[22px] font-bold mb-1">Renda & Salário</h1>
                    <p className="text-text-muted text-[13px]">
                        Total: <span className="text-green font-semibold">{fmt(total)}</span>
                    </p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-[13px] bg-blue text-white transition-all hover:opacity-85" onClick={openCreate}>
                    <Plus size={15}/> Nova Receita
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] p-0">
                {isLoading ? (
                    <div className="p-10 text-center text-text-muted">Carregando...</div>
                ) : data.length === 0 ? (
                    <div className="py-15 text-center text-text-muted">
                        <TrendingUp size={40} className="mx-auto mb-3 opacity-30"/>
                        Nenhuma receita registrada
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Data</th>
                                <th>Recorrente</th>
                                <th className="text-right">Valor</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(income => (
                                <tr key={income.id}>
                                    <td className="font-medium">{income.description}</td>
                                    <td>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-green/15 text-green">
                                        {catLabel(income.category)}
                                        </span>
                                    </td>
                                    <td className="text-text-muted">
                                        {new Date(income.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className={income.recurring ? "text-green" : "text-text-muted"}>
                                        {income.recurring ? "Sim" : "Não"}
                                    </td>
                                    <td className="text-right font-semibold text-green">
                                        {fmt(income.amount)}
                                    </td>
                                    <td>
                                        <div className="flex gap-2 justify-end">
                                            <button className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-medium text-[13px] bg-transparent text-text-muted border border-border hover:bg-surface2 transition-all" onClick={() => openEdit(income)}>
                                                <Pencil size={13} />
                                            </button>
                                            <button className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-medium text-[13px] bg-red text-white transition-all hover:opacity-85" onClick={() => deleteMutation.mutate(income.id)}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <div>}
        </div>
    )

}