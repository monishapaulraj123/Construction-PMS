import { useMemo } from 'react'
import { Building, MapPin } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR } from '../../utils/format'

export default function MySellerProperties() {
  const { properties, currentUser } = useApp()

  const myProps = useMemo(() => {
    return properties.filter((p) => p.seller_name.includes('Santhosh') || p.seller_email === currentUser.email)
  }, [properties, currentUser])

  return (
    <div>
      <div className="card">
        <DataTable
          columns={[
            { header: 'Property Code', accessor: 'property_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Survey No', accessor: 'survey_number' },
            { header: 'Location', accessor: 'location' },
            { header: 'Area', accessor: (p) => `${p.area} ${p.unit}` },
            { header: 'Total Value', accessor: (p) => formatCurrencyINR(p.total_amount) },
            { header: 'Verification Status', accessor: (p) => <StatusBadge status={p.verification_status || p.status} /> },
            { header: 'Publication Status', accessor: (p) => <StatusBadge status={p.publication_status} /> },
          ]}
          data={myProps}
        />
      </div>
    </div>
  )
}
