import React from 'react';
import { QuickActionsCard } from './QuickActionsCard';
import { useNavigate } from 'react-router-dom';

/**
 * Ejemplo de uso del componente QuickActionsCard
 *
 * Este componente muestra 3 botones de acción rápida con iconos, labels y sublabels.
 * Incluye efectos hover con framer-motion y se integra con DetectiveCard.
 */
export const QuickActionsCardExample: React.FC = () => {
  const navigate = useNavigate();

  // Ejemplo 1: Uso básico con handlers simples
  const handleContinueCase = () => {
    console.log('Continuando caso...');
    navigate('/cases/current');
  };

  const handleViewProgress = () => {
    console.log('Viendo progreso...');
    navigate('/progress');
  };

  const handleDailyChallenge = () => {
    console.log('Iniciando reto diario...');
    navigate('/challenges/daily');
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Ejemplos de QuickActionsCard</h1>

      {/* Ejemplo 1: Uso básico */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">1. Uso Básico</h2>
        <QuickActionsCard
          onContinueCase={handleContinueCase}
          onViewProgress={handleViewProgress}
          onDailyChallenge={handleDailyChallenge}
        />
      </section>

      {/* Ejemplo 2: Con información personalizada */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">2. Con Datos Personalizados</h2>
        <QuickActionsCard
          onContinueCase={handleContinueCase}
          onViewProgress={handleViewProgress}
          onDailyChallenge={handleDailyChallenge}
          currentCaseTitle="El Misterio de la Biblioteca"
          completionPercentage={75}
          challengeAvailable={true}
        />
      </section>

      {/* Ejemplo 3: Reto diario completado */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">3. Reto Diario Completado</h2>
        <QuickActionsCard
          onContinueCase={handleContinueCase}
          onViewProgress={handleViewProgress}
          onDailyChallenge={handleDailyChallenge}
          currentCaseTitle="Detective Novato"
          completionPercentage={45}
          challengeAvailable={false}
        />
      </section>

      {/* Ejemplo 4: Integración con estado real */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">4. Con Estado del Usuario</h2>
        <QuickActionsCardWithState />
      </section>
    </div>
  );
};

/**
 * Ejemplo con estado real del usuario
 */
const QuickActionsCardWithState: React.FC = () => {
  const navigate = useNavigate();
  const [userProgress] = React.useState({
    currentCase: 'El Enigma del Parque',
    completionPercentage: 60,
    hasCompletedDailyChallenge: false,
  });

  const handleContinueCase = () => {
    // Lógica para continuar el caso actual
    navigate('/cases/current');
  };

  const handleViewProgress = () => {
    // Lógica para ver el progreso del usuario
    navigate('/progress');
  };

  const handleDailyChallenge = () => {
    if (!userProgress.hasCompletedDailyChallenge) {
      // Lógica para iniciar el reto diario
      navigate('/challenges/daily');
    }
  };

  return (
    <QuickActionsCard
      onContinueCase={handleContinueCase}
      onViewProgress={handleViewProgress}
      onDailyChallenge={handleDailyChallenge}
      currentCaseTitle={userProgress.currentCase}
      completionPercentage={userProgress.completionPercentage}
      challengeAvailable={!userProgress.hasCompletedDailyChallenge}
    />
  );
};

/**
 * Ejemplo de integración con un dashboard completo
 */
export const DashboardWithQuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Dashboard del Detective</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="space-y-6 lg:col-span-2">
            {/* Otros componentes del dashboard */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Estadísticas</h2>
              <p className="text-gray-600">Aquí van las estadísticas...</p>
            </div>
          </div>

          {/* Sidebar con Quick Actions */}
          <div className="space-y-6">
            <QuickActionsCard
              onContinueCase={() => navigate('/cases/current')}
              onViewProgress={() => navigate('/progress')}
              onDailyChallenge={() => navigate('/challenges/daily')}
              currentCaseTitle="El Caso del Código Secreto"
              completionPercentage={80}
              challengeAvailable={true}
            />

            {/* Otros widgets del sidebar */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Misiones</h2>
              <p className="text-gray-600">Lista de misiones...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCardExample;
