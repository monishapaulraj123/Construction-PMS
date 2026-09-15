import { useMemo, useState } from 'react'
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { payments as initialPayments, projects, services } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function Payments() {
  const [paymentList, setPaymentList] = useState(initialPayments)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const filtered = useMemo(
    () =>
      paymentList.filter(
        (p) =>
          (!search ||
            p.payment_number.toLowerCase().includes(search.toLowerCase()) ||
            p.project_name.toLowerCase().includes(search.toLowerCase()) ||
            p.party_name.toLowerCase().includes(search.toLowerCase())) &&
          (!typeFilter || p.payment_type === typeFilter)
      ),
    [paymentList, search, typeFilter]
  )

  const totalIncome = useMemo(
    () => paymentList.filter((p) => p.payment_type === 'Income').reduce((sum, p) => sum + (p.amount || 0), 0),
    [paymentList]
  )
  const totalExpense = useMemo(
    () => paymentList.filter((p) => p.payment_type === 'Expense').reduce((sum, p) => sum + (p.amount || 0), 0),
    [paymentList]
  )
  const netBalance = totalIncome - totalExpense

  function openAdd() {
    setEditing(null)
    setForm({ payment_type: 'Income', status: 'Received', payment_method: 'Bank Transfer (NEFT)', amount: 0 })
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm(row)
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (editing) {
      setPaymentList((rs) => rs.map((r) => (r.payment_id === editing.payment_id ? { ...r, ...form } : r)))
      showToast('Payment record updated')
    } else {
      const newId = Math.max(0, ...paymentList.map((r) => r.payment_id)) + 1
      setPaymentList((rs) => [
        {
          ...form,
          payment_id: newId,
          payment_number: form.payment_number || `PAY-2026-${String(newId).padStart(3, '0')}`,
          status: form.status || (form.payment_type === 'Income' ? 'Received' : 'Paid'),
        },
        ...rs,
      ])
      showToast('Payment voucher recorded')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    setPaymentList((rs) => rs.filter((r) => r.payment_id !== deleteTarget.payment_id))
    showToast('Payment record removed')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownLeft size={22} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>Total Income Received</span>
            <h3 style={{ fontSize: '1.3rem', color: '#15803d', fontWeight: 700 }}>{formatCurrencyINR(totalIncome)}</h3>
          </div>
        </div>

        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={22} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>Total Expenses Paid</span>
            <h3 style={{ fontSize: '1.3rem', color: '#b91c1c', fontWeight: 700 }}>{formatCurrencyINR(totalExpense)}</h3>
          </div>
        </div>

        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--gold-050)', color: 'var(--forest-900)', border: '1px solid var(--gold-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={22} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>Net Cash Flow Balance</span>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--forest-900)', fontWeight: 700 }}>{formatCurrencyINR(netBalance)}</h3>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar placeholder="Search payments by voucher no, project or party..." value={search} onChange={setSearch} />
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Voucher Types</option>
          <option value="Income">Income Vouchers</option>
          <option value="Expense">Expense Vouchers</option>
        </select>
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Record Payment
        </PrimaryButton>
      </div>

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
          { key: 'amount', label: 'Amount', render: (r) => <strong style={{ color: r.payment_type === 'Income' ? '#15803d' : 'var(--ink-900)' }}>{formatCurrencyINR(r.amount)}</strong> },
          { key: 'payment_date', label: 'Payment Date', render: (r) => formatDate(r.payment_date) },
          { key: 'payment_method', label: 'Method' },
          { key: 'reference_number', label: 'Ref / Cheque No.' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'Received' || r.status === 'Paid' ? 'Active' : 'Pending'} /> },
        ]}
        rows={filtered}
        keyField="payment_id"
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Payment Voucher' : 'Record Payment Voucher'}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Record Payment'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Voucher Number" required value={form.payment_number || ''} onChange={(e) => setForm({ ...form, payment_number: e.target.value })} />
          <SelectInput
            label="Payment Category / Type"
            required
            options={['Income', 'Expense']}
            value={form.payment_type || 'Income'}
            onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
          />
          <SelectInput
            label="Associated Project"
            required
            options={projects.map((p) => p.project_name)}
            value={form.project_name || ''}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          />
          <FormInput label="Party / Client / Vendor Name" required value={form.party_name || ''} onChange={(e) => setForm({ ...form, party_name: e.target.value })} />
          <FormInput label="Amount (₹)" type="number" required value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
          <DateInput label="Payment Date" value={form.payment_date || ''} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
          <SelectInput
            label="Payment Method"
            options={['Bank Transfer (NEFT)', 'RTGS', 'Cheque', 'UPI / IMPS', 'Cash']}
            value={form.payment_method || 'Bank Transfer (NEFT)'}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          />
          <FormInput label="Reference / Cheque Number" value={form.reference_number || ''} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
          <FormInput label="Description & Notes" type="textarea" full value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <SelectInput
            label="Status"
            options={['Received', 'Paid', 'Pending', 'Cancelled']}
            value={form.status || 'Received'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Payment Voucher?"
        description="This action cannot be undone."
      />
    </div>
  )
}
