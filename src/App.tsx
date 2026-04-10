import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import IncomePage from './pages/Income'
import ExpensesPage from './pages/Expenses'
import InvestmentsPage from './pages/Investments'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
      </Routes>
    </Layout>
  )
}