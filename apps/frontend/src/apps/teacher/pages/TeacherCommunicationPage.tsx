/**
 * TeacherCommunicationPage - Página de Comunicación
 *
 * Portal completo de comunicación para profesores con:
 * - Bandeja de entrada de mensajes
 * - Conversaciones agrupadas
 * - Anuncios a clases
 * - Feedback privado a estudiantes
 * - Filtros y búsqueda
 * - Paginación
 *
 * ESTADO: HABILITADO (2025-12-18)
 * Funcionalidad completa disponible.
 *
 * @module apps/teacher/pages/TeacherCommunicationPage
 */

import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTeacherMessages } from '../hooks/useTeacherMessages';
import { useClassrooms } from '../hooks/useClassrooms';
import { MessagesList } from '../components/communication/MessagesList';
import { MessageComposer } from '../components/communication/MessageComposer';
import { ConversationsList } from '../components/communication/ConversationsList';
import { AnnouncementForm } from '../components/communication/AnnouncementForm';
import { FeedbackForm } from '../components/communication/FeedbackForm';
import { MessageFilters } from '../components/communication/MessageFilters';
import { DetectiveCard } from '../../../shared/components/base/DetectiveCard';
import { DetectiveButton } from '../../../shared/components/base/DetectiveButton';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { UnderConstruction } from '@shared/components/UnderConstruction';
import { Message } from '../../../services/api/teacher/teacherMessagesApi';
import { classroomsApi } from '../../../services/api/teacher/classroomsApi';

// ============================================================================
// FEATURE FLAG - Habilitado 2025-12-18
// ============================================================================
const SHOW_UNDER_CONSTRUCTION = false;

// ============================================================================
// TYPES
// ============================================================================

type ActiveTab = 'inbox' | 'conversations' | 'announcements' | 'feedback';

interface Tab {
  id: ActiveTab;
  label: string;
  icon?: string;
}

const TABS: Tab[] = [
  { id: 'inbox', label: 'Bandeja de Entrada' },
  { id: 'conversations', label: 'Conversaciones' },
  { id: 'announcements', label: 'Anuncios a Clases' },
  { id: 'feedback', label: 'Feedback a Estudiantes' },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Página principal de comunicación del portal Teacher
 *
 * @example
 * Route: /teacher/communication
 */
export default function TeacherCommunicationPage() {
  const { user, logout } = useAuth();

  // ============================================================================
  // HOOKS
  // ============================================================================

  // Hook de mensajería
  const {
    messages,
    conversations,
    total,
    unreadCount,
    loading,
    error,
    filters,
    pagination,
    sendMessage,
    sendAnnouncement,
    sendFeedback,
    markAsRead,
    updateFilters,
    nextPage,
    prevPage,
    refresh,
  } = useTeacherMessages();

  // Hook de clases (para selectores dinámicos)
  const { classrooms, loading: loadingClassrooms } = useClassrooms();

  // ============================================================================
  // STATE LOCAL
  // ============================================================================

  const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  /**
   * Handler para obtener estudiantes de una clase (usado en FeedbackForm)
   */
  const handleGetStudents = async (classroomId: string) => {
    const response = await classroomsApi.getClassroomStudents(classroomId);
    return response.data;
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading && messages.length === 0) {
    return (
      <TeacherLayout user={user ?? undefined} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-detective-orange"></div>
          <span className="ml-3">Cargando mensajes...</span>
        </div>
      </TeacherLayout>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <TeacherLayout user={user ?? undefined} onLogout={handleLogout}>
        <DetectiveCard>
          <div className="p-4 text-red-600">
            <p>Error al cargar mensajes: {error.message}</p>
            <DetectiveButton onClick={refresh} className="mt-2">
              Reintentar
            </DetectiveButton>
          </div>
        </DetectiveCard>
      </TeacherLayout>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // ============================================================================
  // FEATURE FLAG CHECK - Under Construction
  // ============================================================================

  if (SHOW_UNDER_CONSTRUCTION) {
    return (
      <TeacherLayout user={user ?? undefined} onLogout={handleLogout}>
        <UnderConstruction
          title="Comunicación"
          description="El módulo de comunicación está en desarrollo. Pronto podrás enviar mensajes, anuncios y feedback a tus estudiantes."
          upcomingFeatures={[
            'Bandeja de entrada de mensajes',
            'Conversaciones agrupadas por estudiante',
            'Anuncios a clases completas',
            'Feedback privado a estudiantes',
            'Filtros y búsqueda avanzada',
            'Historial de comunicaciones',
          ]}
        />
      </TeacherLayout>
    );
  }

  // ============================================================================
  // MAIN RENDER - Funcionalidad completa (cuando SHOW_UNDER_CONSTRUCTION = false)
  // ============================================================================

  return (
    <TeacherLayout user={user ?? undefined} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Comunicación</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="rounded-full bg-detective-orange px-3 py-1 text-sm font-semibold text-white">
                {unreadCount} no leídos
              </span>
            )}
            <DetectiveButton onClick={() => setShowComposer(!showComposer)}>
              {showComposer ? 'Cancelar' : 'Nuevo Mensaje'}
            </DetectiveButton>
          </div>
        </div>

        {/* COMPOSER (CONDICIONAL) */}
        {showComposer && (
          <MessageComposer
            onSend={async (data) => {
              await sendMessage(data);
              setShowComposer(false);
              return Promise.resolve();
            }}
            onCancel={() => setShowComposer(false)}
          />
        )}

        {/* CUSTOM TABS */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* Tabs Header */}
          <div className="flex overflow-x-auto border-b border-gray-200">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'border-b-2 border-detective-orange bg-detective-orange text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {tab.label}
                  {tab.id === 'inbox' && unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-white px-2 py-1 text-xs text-detective-orange">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tabs Content */}
          <div className="p-6">
            {/* TAB: BANDEJA DE ENTRADA */}
            {activeTab === 'inbox' && (
              <div className="space-y-4">
                <MessageFilters
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onRefresh={refresh}
                />

                <MessagesList
                  messages={messages}
                  onMessageClick={handleMessageClick}
                  onMarkAsRead={markAsRead}
                />

                {/* PAGINACIÓN */}
                {total > pagination.limit && (
                  <DetectiveCard>
                    <div className="flex items-center justify-between p-4">
                      <p className="text-sm text-gray-600">
                        Mostrando {pagination.offset + 1} -{' '}
                        {Math.min(pagination.offset + pagination.limit, total)} de {total}
                      </p>
                      <div className="flex gap-2">
                        <DetectiveButton
                          size="sm"
                          onClick={prevPage}
                          disabled={pagination.offset === 0}
                        >
                          Anterior
                        </DetectiveButton>
                        <DetectiveButton
                          size="sm"
                          onClick={nextPage}
                          disabled={pagination.offset + pagination.limit >= total}
                        >
                          Siguiente
                        </DetectiveButton>
                      </div>
                    </div>
                  </DetectiveCard>
                )}
              </div>
            )}

            {/* TAB: CONVERSACIONES */}
            {activeTab === 'conversations' && (
              <ConversationsList
                conversations={conversations}
                onConversationClick={(conv) => {
                  // Filtrar por nombre de usuario en la bandeja de entrada
                  updateFilters({ search: conv.other_user_name });
                  setActiveTab('inbox');
                }}
              />
            )}

            {/* TAB: ANUNCIOS */}
            {activeTab === 'announcements' && (
              <AnnouncementForm
                classrooms={classrooms}
                loadingClassrooms={loadingClassrooms}
                onSend={async (classroomId: string, subject: string, content: string) => {
                  await sendAnnouncement(classroomId, subject, content);
                }}
              />
            )}

            {/* TAB: FEEDBACK */}
            {activeTab === 'feedback' && (
              <FeedbackForm
                classrooms={classrooms}
                loadingClassrooms={loadingClassrooms}
                onGetStudents={handleGetStudents}
                onSend={async (studentId: string, content: string) => {
                  await sendFeedback(studentId, content);
                }}
              />
            )}
          </div>
        </div>

        {/* MODAL DE DETALLE DE MENSAJE */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <DetectiveCard className="max-h-[80vh] w-full max-w-2xl overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-xl font-bold">{selectedMessage.subject}</h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Metadata */}
                <p className="mb-4 text-sm text-gray-600">
                  De: {selectedMessage.sender_name} |{' '}
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>

                {/* Contenido */}
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                {/* Destinatarios */}
                {selectedMessage.recipients.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-sm font-medium">Destinatarios:</p>
                    <ul className="text-sm text-gray-600">
                      {selectedMessage.recipients.map((r) => (
                        <li key={r.user_id}>
                          {r.user_name} {r.is_read && '(leído)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata adicional */}
                {selectedMessage.classroom_name && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Clase: <strong>{selectedMessage.classroom_name}</strong>
                    </p>
                  </div>
                )}
              </div>
            </DetectiveCard>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
