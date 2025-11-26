import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-detective-bg to-detective-bg-secondary p-4">
      <DetectiveCard hoverable={false} className="max-w-lg text-center">
        <div className="mb-4 text-9xl">🕵️</div>
        <h1 className="mb-4 text-6xl font-bold text-detective-orange">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-detective-text">Página No Encontrada</h2>
        <p className="mb-8 text-detective-text-secondary">
          Lo sentimos, la página que buscas no existe o ha sido movida. Nuestros mejores detectives
          no pudieron encontrarla.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <DetectiveButton
            variant="primary"
            icon={<Home className="h-5 w-5" />}
            onClick={() => navigate('/dashboard')}
          >
            Ir al Dashboard
          </DetectiveButton>
          <DetectiveButton
            variant="blue"
            icon={<Search className="h-5 w-5" />}
            onClick={() => navigate(-1)}
          >
            Volver Atrás
          </DetectiveButton>
        </div>
      </DetectiveCard>
    </div>
  );
}
