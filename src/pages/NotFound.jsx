import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { PrimaryButton } from '../components/Buttons'

export default function NotFound() {
  return (
    <div className="card card-pad">
      <EmptyState title="Page not found" description="The page you're looking for doesn't exist or has moved." />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <Link to="/">
          <PrimaryButton>Back to Dashboard</PrimaryButton>
        </Link>
      </div>
    </div>
  )
}
