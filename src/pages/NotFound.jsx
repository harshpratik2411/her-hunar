import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui.jsx';
import { IconSearch } from '../components/icons.jsx';

export default function NotFound() {
  return (
    <div className="shell py-20">
      <EmptyState
        className="mx-auto max-w-xl"
        icon={<IconSearch size={24} />}
        title="Page not found"
        description="The page you were looking for does not exist. It may have been a public profile link that this browser has no data for."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/" className="btn-primary">
              Go home
            </Link>
            <Link to="/discover" className="btn-outline">
              Discover talent
            </Link>
          </div>
        }
      />
    </div>
  );
}
