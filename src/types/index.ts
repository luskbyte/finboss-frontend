export interface Income {
    id: number
    created_at: string
    updated_at: string
    description: string
    amount: number
    category: string
    date: string
    recurring: boolean
}

export interface Expense {
    id: number
    created_at: string
    updated_at: string
    description: string
    amount: number
    category: string
    date: string
    recurring: boolean
}

export interface Investment {
    id: number
    created_at: string
    updated_at: string
    name: string
    ticker: string
    type: string
    quantity: number
    buy_price: number
    current_price: number
    buy_date: string
}

export interface MonthlyBalance {
    month: string
    income: number
    expenses: number
    balance: number
}

export interface DashboardSummary {
    total_income: number
    total_expenses: number
    balance: number
    total_invested: number
    portfolio_value: number
    portfolio_return: number
    income_by_category: Record<string, number>
    expenses_by_category: Record<string, number>
    monthly_balance: MonthlyBalance[]
}

export const INCOME_CATEGORIES = [
    { value: 'salary', label: 'salário' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'bonus', label: 'Bônus' },
    { value: 'dividend', label: 'Dividendos' },
    { value: 'other', label: 'Outros' },
]

export const EXPENSE_CATEGORIES = [
    { value: 'housing', label: 'Moradia' },
    { value: 'food', label: 'Alimentação' },
    { value: 'transport', label: 'Transporte' },
    { value: 'health', label: 'Saúde' },
    { value: 'education', label: 'Educação' },
    { value: 'entertainment', label: 'Lazer' },
    { value: 'clothing', label: 'Vestuário' },
    { value: 'other', label: 'Outros' },
]

export const INVESTMENT_TYPES = [
    { value: 'stock', label: 'Ação' },
    { value: 'fixed_income', label: 'Renda Fixa' },
    { value: 'mutual_fund', label: 'Fundo de Investimento' },
    { value: 'crypto', label: 'Criptomoeda' },
    { value: 'real_estate', label: 'Imobiliária' },
    { value: 'other', label: 'Outros' },
]