import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Upload, ShieldCheck, CheckCircle2 } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { FormInput, SelectInput } from '../../components/FormInputs'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function SellPropertyForm() {
  const { sellRequests, submitSellProperty, currentUser } = useApp()
  const [openAddModal, setOpenAddModal] = useState(false)
  const [form, setForm] = useState({
    unit: 'Sq. Ft',
    state: 'Tamil Nadu',
    seller_name: currentUser.name || 'Santhosh Landowner',
    seller_phone: '9841029384',
    seller_email: currentUser.email,
  })
  const showToast = useToast()

  const mySellRequests = sellRequests.filter((s) => s.seller_name?.includes('Santhosh') || s.seller_email === currentUser.email)

  function handleSubmit(e) {
    e.preventDefault()
    const rate = Number(form.expected_rate || 0)
    const area = Number(form.area || 0)

    submitSellProperty({
      property_name: form.property_name,
      property_type: form.property_type || 'Residential Plot',
      survey_number: form.survey_number,
      location: form.location,
      district: form.district,
      state: form.state || 'Tamil Nadu',
      pincode: form.pincode,
      area,
      unit: form.unit || 'Sq. Ft',
      expected_rate: rate,
      expected_total: area * rate,
      seller_name: form.seller_name,
      seller_phone: form.seller_phone,
      seller_email: form.seller_email,
      document_url: form.document_url || 'DOC-SUBMITTED-2026',
    })

    showToast('Land plot submitted for company verification!')
    setOpenAddModal(false)
  }

  return (
    <div>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={PlusCircle} onClick={() => setOpenAddModal(true)}>
          Submit Land / Property for Sale
        </PrimaryButton>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>My Property Submissions</h3>
        <DataTable
          columns={[
            { header: 'Request Code', accessor: 'request_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Survey No', accessor: 'survey_number' },
            { header: 'Location', accessor: 'location' },
            { header: 'Area', accessor: (s) => `${s.area} ${s.unit}` },
            { header: 'Expected Total', accessor: (s) => formatCurrencyINR(s.expected_total) },
            { header: 'Submitted Date', accessor: (s) => formatDate(s.submitted_date) },
            { header: 'Verification Status', accessor: (s) => <StatusBadge status={s.status} /> },
          ]}
          data={mySellRequests}
        />
      </div>

      {/* Submission Modal */}
      {openAddModal && (
        <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} title="Submit Plot / Property for Sale" maxWidth={620}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput
                  label="Property Name / Title"
                  required
                  placeholder="e.g. Coimbatore Airport Highway Land Parcel"
                  value={form.property_name || ''}
                  onChange={(v) => setForm((s) => ({ ...s, property_name: v }))}
                />
              </div>
              <SelectInput
                label="Property Type"
                options={['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Site']}
                value={form.property_type || 'Residential Plot'}
                onChange={(v) => setForm((s) => ({ ...s, property_type: v }))}
              />
              <FormInput
                label="Survey Number"
                required
                placeholder="e.g. SY-308/1B"
                value={form.survey_number || ''}
                onChange={(v) => setForm((s) => ({ ...s, survey_number: v }))}
              />
              <FormInput
                label="Location / Area"
                required
                placeholder="Avinashi Road, Kalapatti"
                value={form.location || ''}
                onChange={(v) => setForm((s) => ({ ...s, location: v }))}
              />
              <FormInput
                label="District"
                required
                placeholder="Coimbatore"
                value={form.district || ''}
                onChange={(v) => setForm((s) => ({ ...s, district: v }))}
              />
              <FormInput
                label="State"
                required
                value={form.state || 'Tamil Nadu'}
                onChange={(v) => setForm((s) => ({ ...s, state: v }))}
              />
              <FormInput
                label="Pincode"
                required
                placeholder="641014"
                value={form.pincode || ''}
                onChange={(v) => setForm((s) => ({ ...s, pincode: v }))}
              />
              <FormInput
                label="Plot Area Size"
                type="number"
                required
                placeholder="2400"
                value={form.area || ''}
                onChange={(v) => setForm((s) => ({ ...s, area: v }))}
              />
              <SelectInput
                label="Unit of Measure"
                options={['Sq. Ft', 'Acres', 'Cents', 'Grounds']}
                value={form.unit || 'Sq. Ft'}
                onChange={(v) => setForm((s) => ({ ...s, unit: v }))}
              />
              <FormInput
                label="Expected Rate per Unit (₹)"
                type="number"
                required
                placeholder="5000"
                value={form.expected_rate || ''}
                onChange={(v) => setForm((s) => ({ ...s, expected_rate: v }))}
              />
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput
                  label="Document Reference / File Upload Note"
                  placeholder="Parent Deed No. DOC-CBE-2025-5510, EC 30 Yrs Certificate attached"
                  value={form.document_url || ''}
                  onChange={(v) => setForm((s) => ({ ...s, document_url: v }))}
                />
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <SecondaryButton onClick={() => setOpenAddModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" icon={Upload}>
                Submit for Verification
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
