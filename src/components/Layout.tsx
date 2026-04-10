import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, LineChart } from "lucide-react";

const nav = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/income", icon: TrendingUp, label: "Renda" },
    { to: "/expenses", icon: TrendingDown, label: "Gastos" },
    { to: "/investments", icon: LineChart, label: "Investimentos" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-55 bg- surface border-r border-border flex flex-col py-6 fixed h-screen">
                <div className="px-5 pb-7 border-b border-border mb-2">
                    <div className="text-xl font-bold text-blue">FinBoss</div>
                    <div className="text-[11px] text-text-muted mt-0.5">Gestão Financeira</div>
                </div>
                <nav className="px-3 py-2">
                    {nav.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all ${
                                    isActive
                                        ? "bg-blue text-white"
                                        : "text-text-muted hover:bg-surface2"
                                }`
                            }
                        >
                            <Icon size={16} />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="ml-55 flex-1 px-8 py-7 max-w-full">
                {children}
            </main>
        </div>
    )
}