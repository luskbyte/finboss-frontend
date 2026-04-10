
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Pencil, Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import StatCard from "../components/StatCard";
import { incomeApi } from "../services/api";
import { INCOME_CATEGORIES, type Income } from "../types";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const catLabel = (v: string) =>
    INCOME_CATEGORIES.find((c) => c.value === v)?.label ?? v;

type IncomePayload = Omit<Income, "id" | "created_at" | "updated_at">;

const emptyForm: IncomePayload = {
    description: "",
    amount: 0,
    category: "salary",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
};

export default function IncomePage() {
    const qc = useQueryClient();
    const [modal, setModal] = useState<"create" | "edit" | null>(null);
    const [editing, setEditing] = useState<Income | null>(null);
    const [form, setForm] = useState<IncomePayload>({ ...emptyForm });

    const { data, isLoading } = useQuery({
        queryKey: ["incomes"],
        queryFn: incomeApi.list,
    });
    const incomes = data ?? [];

    const closeModal = () => {
        setModal(null);
        setEditing(null);
        setForm({ ...emptyForm });
    };

    const createMutation = useMutation({
        mutationFn: incomeApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["incomes"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: IncomePayload }) => incomeApi.update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["incomes"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => incomeApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["incomes"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const openEdit = (income: Income) => {
        setEditing(income);
        setForm({
            description: income.description,
            amount: income.amount,
            category: income.category,
            date: (income.date ?? new Date().toISOString()).slice(0, 10),
            recurring: income.recurring,
        });
        setModal("edit");
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setModal("create");
    };

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: IncomePayload = {
            ...form,
            amount: Number(form.amount),
            date: new Date(form.date).toISOString(),
        };

        if (modal === "edit" && editing) {
            updateMutation.mutate({ id: editing.id, data: payload });
            return;
        }

        createMutation.mutate(payload);
    };

    const total = incomes.reduce((sum, income) => sum + income.amount, 0);
    const recurringCount = incomes.filter((income) => income.recurring).length;
    const monthTotal = incomes
        .filter((income) => new Date(income.date).getMonth() === new Date().getMonth())
        .reduce((sum, income) => sum + income.amount, 0);
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-[22px] font-bold mb-1">Renda & Salário</h1>
                    <p className="text-text-muted text-[13px]">
                        Gerencie suas entradas e acompanhe a evolução da sua receita.
                    </p>
                </div>
                <button
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-[13px] bg-blue text-white transition-all hover:opacity-85"
                    onClick={openCreate}
                >
                    <Plus size={15} />
                    Nova Receita
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Receita Total"
                    value={fmt(total)}
                    subtitle={`${incomes.length} lançamento(s)`}
                    icon={<TrendingUp size={18} />}
                    color="var(--green)"
                />
                <StatCard
                    title="Neste Mês"
                    value={fmt(monthTotal)}
                    subtitle="Entradas do mês atual"
                    icon={<Calendar size={18} />}
                    color="var(--blue)"
                />
                <StatCard
                    title="Recorrentes"
                    value={String(recurringCount)}
                    subtitle="Receitas automáticas"
                    icon={<Wallet size={18} />}
                    color="var(--purple)"
                />
            </div>

            <div className="bg-surface border border-border rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center text-text-muted">Carregando receitas...</div>
                ) : incomes.length === 0 ? (
                    <div className="py-14 text-center text-text-muted">
                        <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Nenhuma receita registrada</p>
                        <p className="text-sm mt-1">Comece adicionando sua primeira entrada.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface2 text-text-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Descrição</th>
                                    <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                                    <th className="px-4 py-3 text-left font-semibold">Data</th>
                                    <th className="px-4 py-3 text-left font-semibold">Recorrente</th>
                                    <th className="px-4 py-3 text-right font-semibold">Valor</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map((income) => (
                                    <tr key={income.id} className="border-t border-border">
                                        <td className="px-4 py-3 font-medium">{income.description}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-green/15 text-green">
                                                {catLabel(income.category)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-text-muted">
                                            {new Date(income.date).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className={`px-4 py-3 ${income.recurring ? "text-green" : "text-text-muted"}`}>
                                            {income.recurring ? "Sim" : "Não"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-green">
                                            {fmt(income.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-medium text-[13px] bg-transparent text-text-muted border border-border hover:bg-surface2 transition-all"
                                                    onClick={() => openEdit(income)}
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-medium text-[13px] bg-red text-white transition-all hover:opacity-85"
                                                    onClick={() => deleteMutation.mutate(income.id)}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-lg">
                                    {modal === "edit" ? "Editar receita" : "Nova receita"}
                                </h2>
                                <p className="text-sm text-text-muted">
                                    Preencha os dados da entrada financeira.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-text-muted hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-text-muted">Descrição</label>
                                <input
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-blue"
                                    placeholder="Ex: Salário mensal"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 text-text-muted">Valor</label>
                                    <input
                                        required
                                        min="0"
                                        step="0.01"
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                amount: e.target.value === "" ? 0 : Number(e.target.value),
                                            }))
                                        }
                                        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-blue"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-1 text-text-muted">Categoria</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                                        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-blue"
                                    >
                                        {INCOME_CATEGORIES.map((category) => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm mb-1 text-text-muted">Data</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                                        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-blue"
                                    />
                                </div>

                                <label className="flex items-center gap-2 rounded-lg border border-border bg-surface2 px-3 py-2 mt-6 md:mt-0">
                                    <input
                                        type="checkbox"
                                        checked={form.recurring}
                                        onChange={(e) => setForm((prev) => ({ ...prev, recurring: e.target.checked }))}
                                    />
                                    <span className="text-sm text-text-muted">Receita recorrente</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-surface2 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-blue text-white font-medium hover:opacity-90 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Salvando..." : modal === "edit" ? "Salvar alterações" : "Cadastrar receita"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}