import { FileText, Download, ShieldCheck } from 'lucide-react'
import DataTable from '../../components/DataTable'
import { SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'

export default function ClientDocuments() {
  const { properties, transactions, currentUser } = useApp()

  // Generate document records from client's properties and transactions
  const clientDocs = []

  properties
    .filter((p) => p.seller_id === currentUser?.user_id || p.seller_email === currentUser?.email)
    .forEach((p) => {
      if (p.document_reference) {
        clientDocs.push({
          id: `DOC-P-${p.property_id}`,
          name: `Property Title Deed (${p.survey_number})`,
          property: p.property_name,
          doc_ref: p.document_reference,
          type: 'Encumbrance / Title Deed',
          status: p.verification_status || 'Verified',
        })
      }
    })

  transactions
    .filter(
      (t) =>
        t.buyer_id === currentUser?.user_id ||
        t.seller_id === currentUser?.user_id ||
        t.buyer_name === currentUser?.name ||
        t.seller_name === currentUser?.name
    )
    .forEach((t) => {
      if (t.document_reference) {
        clientDocs.push({
          id: `DOC-T-${t.transaction_id}`,
          name: `Registered Sale Agreement / Receipt`,
          property: t.property_name,
          doc_ref: t.document_reference,
          type: 'Sale Deed & Advance Receipt',
          status: 'Approved',
        })
      }
    })

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Documents</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Access verified property encumbrance certificates (EC), DTCP title deeds, and sale agreements.
          </p>
        </div>
      </div>

      <div className="card">
        {clientDocs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-500)' }}>
            No legal documents uploaded or generated yet.
          </div>
        ) : (
          <DataTable
            columns={[
              { header: 'Document Title', accessor: 'name' },
              { header: 'Associated Property', accessor: 'property' },
              { header: 'Reference No.', accessor: 'doc_ref' },
              { header: 'Category', accessor: 'type' },
              { header: 'Verification', accessor: 'status' },
              {
                header: 'Action',
                accessor: (d) => (
                  <SecondaryButton
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => alert(`Downloading verified document ${d.doc_ref}...`)}
                  >
                    <Download size={14} style={{ marginRight: 4 }} /> Download
                  </SecondaryButton>
                ),
              },
            ]}
            data={clientDocs}
          />
        )}
      </div>
    </div>
  )
}
