import { useMemo, useState } from 'react'
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Download, FileSpreadsheet, AlertTriangle, Filter } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'
import { useToast } from '../components/ToastContext'
import { filterPayments, calculateRealizedFinancials, calculateProjectFinancials } from '../utils/financialCalculations'
import { generateFinancialPDFReport } from '../utils/pdfReportGenerator'
import { exportFinancialsToCSV } from '../utils/excelReportGenerator'

export default function Payments() {
  const { payments, projects, addPayment, updatePayment, deletePayment } = useApp()
  const { t } = useTranslation()
  const showToast = useToast()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('All Time')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Filtered Payments list based on dynamic search & filters
  const filtered = useMemo(
    () =>
      filterPayments(payments, {
        search,
        typeFilter,
        projectFilter,
        statusFilter,
        dateRangeFilter,
      }),
    [payments, search, typeFilter, projectFilter, statusFilter, dateRangeFilter]
  )

  // Realized Financial Summary (Dynamic based on filtered transactions)
  const financialSummary = useMemo(() => calculateRealizedFinancials(filtered), [filtered])

  // Selected Project Financial Details (if a single project is selected)
  const selectedProjectInfo = useMemo(() => {
    if (!projectFilter) return null
    const found = projects.find((p) => p.project_name === projectFilter || String(p.project_id) === String(projectFilter))
    if (!found) return null
    return calculateProjectFinancials(found, payments)
  }, [projects, payments, projectFilter])

  function openAdd() {
    setEditing(null)
    const nextNum = `PAY-2026-${Math.floor(100 + Math.random() * 900)}`
    setForm({
      payment_number: nextNum,
      payment_type: 'Income',
      party_type: 'Client',
      party_name: '',
      category: 'Milestone Payment',
      status: 'Received',
      payment_method: 'Bank Transfer (NEFT)',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      project_name: projects[0]?.project_name || '',
      reference_number: '',
      receipt_ref: '',
      description: '',
    })
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({
      ...row,
      party_type: row.party_type || (row.payment_type === 'Income' ? 'Client' : 'Supplier'),
      category: row.category || (row.payment_type === 'Income' ? 'Milestone Payment' : 'Material Purchase'),
    })
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) {
      showToast('Please enter a valid amount')
      return
    }

    const proj = projects.find((p) => p.project_name === form.project_name)
    const payload = {
      ...form,
      amount: Number(form.amount),
      project_id: proj ? proj.project_id : (form.project_id || 1),
    }

    if (editing) {
      updatePayment(editing.payment_id, payload)
      showToast(t('action_successful', 'Payment record updated successfully'))
    } else {
      addPayment(payload)
      showToast(t('action_successful', 'Payment voucher recorded successfully'))
    }
    setModalOpen(false)
  }

  function handleDelete() {
    if (deleteTarget) {
      deletePayment(deleteTarget.payment_id)
      showToast('Payment record removed')
      setDeleteTarget(null)
    }
  }

  function handleExportPDF() {
    generateFinancialPDFReport(financialSummary, filtered, {
      projectFilter,
      dateRangeFilter,
    })
    showToast('Financial PDF Report generated')
  }

  function handleExportExcel() {
    exportFinancialsToCSV(financialSummary, filtered, projectFilter ? `Financials_${projectFilter}` : 'Payment_Financial_Report')
    showToast('Financial CSV/Excel Report downloaded')
  }

  return (
    <div className="animate-fade-slide">
      {/* 4 Top Financial Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {/* 1. Total Income Received */}
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowDownLeft size={22} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>{t('income', 'Total Income Received')}</span>
            <h3 style={{ fontSize: '1.3rem', color: '#15803d', fontWeight: 700, margin: 0 }}>{formatCurrencyINR(financialSummary.totalIncome)}</h3>
          </div>
        </div>

        {/* 2. Total Expenses Paid */}
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowUpRight size={22} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>{t('expense', 'Total Expenses Paid')}</span>
            <h3 style={{ fontSize: '1.3rem', color: '#b91c1c', fontWeight: 700, margin: 0 }}>{formatCurrencyINR(financialSummary.totalExpense)}</h3>
          </div>
        </div>

        {/* 3. Net Cash Flow Balance */}
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--gold-050)', color: 'var(--forest-900)', border: '1px solid var(--gold-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wallet size={22} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>{t('net_balance', 'Net Cash Flow Balance')}</span>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--forest-900)', fontWeight: 700, margin: 0 }}>{formatCurrencyINR(financialSummary.netCashFlow)}</h3>
          </div>
        </div>

        {/* 4. Net Profit & Profit Margin (%) */}
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(47, 93, 80, 0.1)', color: '#2F5D50', border: '1px solid rgba(47, 93, 80, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={22} />
          </div>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>{t('net_profit', 'Net Profit')}</span>
              {financialSummary.totalIncome > 0 && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: financialSummary.profitMargin >= 0 ? '#dcfce7' : '#fee2e2', color: financialSummary.profitMargin >= 0 ? '#15803d' : '#b91c1c' }}>
                  {financialSummary.profitMargin.toFixed(1)}% Margin
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.3rem', color: financialSummary.netProfit >= 0 ? '#15803d' : '#b91c1c', fontWeight: 700, margin: 0 }}>{formatCurrencyINR(financialSummary.netProfit)}</h3>
          </div>
        </div>
      </div>

      {/* Selected Project Financial Summary Overview Card */}
      {selectedProjectInfo && (
        <div className="card card-pad" style={{ marginBottom: 20, borderLeft: selectedProjectInfo.isBudgetExceeded ? '4px solid #b91c1c' : '4px solid var(--forest-700)', background: 'var(--cream-050)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--forest-900)', margin: 0 }}>
                {selectedProjectInfo.projectName} — {t('project_financial_summary', 'Project Financial Overview')}
              </h4>
              {selectedProjectInfo.isBudgetExceeded && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 12, fontSize: '0.74rem', fontWeight: 700 }}>
                  <AlertTriangle size={14} /> {t('budget_exceeded', 'Budget Exceeded')}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>
              {t('budget_utilization', 'Budget Utilization')}: <strong>{selectedProjectInfo.budgetUtilization.toFixed(1)}%</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, paddingTop: 10, borderTop: '1px solid var(--line-200)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>{t('estimated_cost', 'Estimated Budget')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-900)' }}>{formatCurrencyINR(selectedProjectInfo.estimatedBudget)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>{t('actual_cost', 'Actual Expense')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#b91c1c' }}>{formatCurrencyINR(selectedProjectInfo.actualExpense)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>{t('budget_remaining', 'Budget Remaining')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedProjectInfo.budgetRemaining >= 0 ? '#15803d' : '#b91c1c' }}>
                {formatCurrencyINR(selectedProjectInfo.budgetRemaining)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>{t('income', 'Total Realized Income')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d' }}>{formatCurrencyINR(selectedProjectInfo.totalIncome)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>{t('net_profit', 'Project Net Profit')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedProjectInfo.netProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                {formatCurrencyINR(selectedProjectInfo.netProfit)} ({selectedProjectInfo.profitMargin.toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
        <SearchBar placeholder={t('search_placeholder', 'Search by voucher no, project, party...')} value={search} onChange={setSearch} />
        
        {/* Project Selector Filter */}
        <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="">{t('filter', 'All Projects')}</option>
          {projects.map((p) => (
            <option key={p.project_id} value={p.project_name}>
              {p.project_name}
            </option>
          ))}
        </select>

        {/* Voucher Type Filter */}
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">{t('filter', 'All Voucher Types')}</option>
          <option value="Income">Income Vouchers</option>
          <option value="Expense">Expense Vouchers</option>
        </select>

        {/* Status Filter */}
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t('filter', 'All Statuses')}</option>
          <option value="Realized">Realized / Paid / Received</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Date Range Filter */}
        <select className="filter-select" value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}>
          <option value="All Time">{t('all_time', 'All Time')}</option>
          <option value="Today">{t('today', 'Today')}</option>
          <option value="This Week">{t('this_week', 'This Week')}</option>
          <option value="This Month">{t('this_month', 'This Month')}</option>
          <option value="This Year">{t('this_year', 'This Year')}</option>
        </select>

        <div style={{ flex: 1 }} />

        {/* Export Buttons */}
        <SecondaryButton icon={Download} onClick={handleExportPDF} title="Print/Export PDF Report">
          {t('export_pdf', 'PDF')}
        </SecondaryButton>

        <SecondaryButton icon={FileSpreadsheet} onClick={handleExportExcel} title="Download CSV/Excel Report">
          {t('export_excel', 'CSV')}
        </SecondaryButton>

        <PrimaryButton icon={Plus} onClick={openAdd}>
          + {t('add_payment', 'Record Payment')}
        </PrimaryButton>
      </div>

      {/* Payments DataTable */}
      <DataTable
        columns={[
          { key: 'payment_number', label: 'Voucher No.' },
          {
            key: 'payment_type',
            label: 'Type',
            render: (r) => (
              <span style={{ padding: '3px 9px', borderRadius: 12, fontSize: '0.74rem', fontWeight: 700, background: r.payment_type === 'Income' ? '#dcfce7' : '#fee2e2', color: r.payment_type === 'Income' ? '#15803d' : '#b91c1c' }}>
                {r.payment_type}
              </span>
            ),
          },
          { key: 'project_name', label: 'Project', render: (r) => <span className="cell-primary">{r.project_name}</span> },
          { key: 'party_name', label: 'Party / Client / Supplier' },
          { key: 'category', label: 'Category', render: (r) => <span style={{ fontSize: '0.8rem', color: 'var(--ink-700)' }}>{r.category || r.payment_type}</span> },
          { key: 'amount', label: 'Amount', render: (r) => <strong style={{ color: r.payment_type === 'Income' ? '#15803d' : 'var(--ink-900)' }}>{formatCurrencyINR(r.amount)}</strong> },
          { key: 'payment_date', label: 'Payment Date', render: (r) => formatDate(r.payment_date) },
          { key: 'payment_method', label: 'Method' },
          { key: 'reference_number', label: 'Ref / Cheque No.' },
          {
            key: 'status',
            label: 'Status',
            render: (r) => {
              const statusStr = r.status || 'Received'
              const badgeType = (statusStr === 'Received' || statusStr === 'Paid' || statusStr === 'Completed' || statusStr === 'Active') ? 'Active' : statusStr === 'Pending' ? 'Pending' : 'Inactive'
              return <StatusBadge status={badgeType} label={statusStr} />
            },
          },
        ]}
        rows={filtered}
        keyField="payment_id"
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {/* Record / Edit Payment Voucher Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Payment Voucher' : 'Record Payment Voucher'}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>{t('cancel', 'Cancel')}</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? t('save_changes', 'Save Changes') : t('submit', 'Record Payment')}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Voucher Number" required value={form.payment_number || ''} onChange={(e) => setForm({ ...form, payment_number: e.target.value })} />
          
          <SelectInput
            label="Payment Type"
            required
            options={['Income', 'Expense']}
            value={form.payment_type || 'Income'}
            onChange={(e) => {
              const pType = e.target.value
              setForm({
                ...form,
                payment_type: pType,
                party_type: pType === 'Income' ? 'Client' : 'Supplier',
                category: pType === 'Income' ? 'Milestone Payment' : 'Material Purchase',
                status: pType === 'Income' ? 'Received' : 'Paid',
              })
            }}
          />

          <SelectInput
            label="Associated Project"
            required
            options={projects.map((p) => p.project_name)}
            value={form.project_name || ''}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          />

          <SelectInput
            label="Party Type"
            options={['Client', 'Supplier', 'Subcontractor', 'Employee / Labour', 'Other']}
            value={form.party_type || 'Client'}
            onChange={(e) => setForm({ ...form, party_type: e.target.value })}
          />

          <FormInput label="Party / Client / Vendor Name" required value={form.party_name || ''} onChange={(e) => setForm({ ...form, party_name: e.target.value })} />
          
          <SelectInput
            label="Category"
            options={
              form.payment_type === 'Income'
                ? ['Client Advance', 'Milestone Payment', 'Stage Payment', 'Final Payment', 'Other Income']
                : ['Material Purchase', 'Labour Payment', 'Supplier Payment', 'Service Payment', 'Equipment Expense', 'Transportation', 'Other Expense']
            }
            value={form.category || (form.payment_type === 'Income' ? 'Milestone Payment' : 'Material Purchase')}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <FormInput label="Amount (₹)" type="number" required value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
          <DateInput label="Payment Date" value={form.payment_date || ''} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
          
          <SelectInput
            label="Payment Method"
            options={['Bank Transfer (NEFT)', 'RTGS', 'Cheque', 'UPI / IMPS', 'Cash']}
            value={form.payment_method || 'Bank Transfer (NEFT)'}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          />

          <FormInput label="Reference / Cheque Number" value={form.reference_number || ''} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
          <FormInput label="Invoice / Receipt Ref No." value={form.receipt_ref || ''} onChange={(e) => setForm({ ...form, receipt_ref: e.target.value })} />
          
          <SelectInput
            label="Status"
            options={form.payment_type === 'Income' ? ['Received', 'Pending', 'Cancelled'] : ['Paid', 'Pending', 'Cancelled']}
            value={form.status || (form.payment_type === 'Income' ? 'Received' : 'Paid')}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />

          <FormInput label="Description & Notes" type="textarea" full value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Payment Voucher?"
        description="This action will remove the voucher from financial calculations."
      />
    </div>
  )
}
