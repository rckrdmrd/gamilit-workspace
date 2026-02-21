/**
 * DeviceManagementSection
 *
 * Section component for managing push notification devices
 * Allows users to view, edit, and delete registered devices
 *
 * @version 1.0 (2025-01-13) - Initial implementation for FE-054
 */

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';

// Device type icons
const DEVICE_TYPE_ICONS: Record<string, string> = {
  ios: '📱',
  android: '🤖',
  web: '🌐',
};

// Device type labels
const DEVICE_TYPE_LABELS: Record<string, string> = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
};

export const DeviceManagementSection: React.FC = () => {
  const { devices, devicesLoading, fetchDevices, updateDeviceName, deleteDevice } =
    useNotificationsStore();

  const {
    isSupported,
    permissionStatus,
    isRegistering,
    error: pushError,
    enablePushNotifications,
  } = usePushNotifications();

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showRegisterInfo, setShowRegisterInfo] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; deviceId: string | null; deviceName: string }>({
    open: false,
    deviceId: null,
    deviceName: '',
  });

  // Load devices on mount
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Handle register device
  const handleRegisterDevice = async () => {
    const success = await enablePushNotifications();
    if (success) {
      // Reload devices to show the new one
      await fetchDevices();
    }
  };

  // Start editing device name
  const handleStartEdit = (deviceId: string, currentName: string) => {
    setEditingDeviceId(deviceId);
    setEditedName(currentName || '');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDeviceId(null);
    setEditedName('');
  };

  // Save edited device name
  const handleSaveEdit = async (deviceId: string) => {
    if (!editedName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    setIsUpdating(true);

    try {
      await updateDeviceName(deviceId, editedName.trim());
      setEditingDeviceId(null);
      setEditedName('');
      toast.success('Nombre actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el nombre');
      console.error('Error updating device name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete device — opens confirm dialog
  const handleDeleteDevice = useCallback((deviceId: string, deviceName: string) => {
    setDeleteConfirm({ open: true, deviceId, deviceName: deviceName || 'Sin nombre' });
  }, []);

  // Confirmed delete
  const handleConfirmDelete = useCallback(async () => {
    const { deviceId } = deleteConfirm;
    if (!deviceId) return;

    setDeleteConfirm({ open: false, deviceId: null, deviceName: '' });
    setIsDeleting(deviceId);

    try {
      await deleteDevice(deviceId);
      toast.success('Dispositivo eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el dispositivo');
      console.error('Error deleting device:', error);
    } finally {
      setIsDeleting(null);
    }
  }, [deleteConfirm, deleteDevice]);

  // Format last used date
  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return 'Nunca usado';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (devicesLoading && devices.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando dispositivos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Dispositivos Registrados</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Gestiona los dispositivos que pueden recibir notificaciones push
        </p>
      </div>

      {/* Push Status Info */}
      {!isSupported && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: '#c62828',
          }}
        >
          ⚠️ Tu navegador no soporta notificaciones push
        </div>
      )}


      {pushError && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: '#c62828',
          }}
        >
          ❌ {pushError}
        </div>
      )}

      {permissionStatus === 'denied' && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fff3e0',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: '#e65100',
          }}
        >
          ⚠️ Has bloqueado las notificaciones. Para activarlas, ve a la configuración de tu navegador
          y permite las notificaciones para este sitio.
        </div>
      )}

      {/* Devices List */}
      {devices.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
          <h3>No tienes dispositivos registrados</h3>
          <p style={{ color: '#666', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Registra este dispositivo para recibir notificaciones push en tu navegador
          </p>

          {isSupported && permissionStatus !== 'denied' && (
            <button
              onClick={handleRegisterDevice}
              disabled={isRegistering}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isRegistering ? '#9e9e9e' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRegistering ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
              {isRegistering ? '⏳ Registrando...' : '🔔 Activar Notificaciones Push'}
            </button>
          )}

          <button
            onClick={() => setShowRegisterInfo(!showRegisterInfo)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginLeft: isSupported ? '0.5rem' : '0',
            }}
          >
            ℹ️ ¿Qué son las notificaciones push?
          </button>

          {showRegisterInfo && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                textAlign: 'left',
              }}
            >
              <h4>📱 Notificaciones Push</h4>
              <p style={{ marginTop: '1rem', color: '#666' }}>
                <strong>¿Qué son las notificaciones push?</strong>
                <br />
                Son notificaciones que recibes en tu navegador o dispositivo móvil, incluso cuando
                no estás usando la aplicación activamente.
              </p>
              <p style={{ marginTop: '1rem', color: '#666' }}>
                <strong>¿Qué recibirás?</strong>
                <br />
                • Nuevos logros desbloqueados
                <br />
                • Promociones de rango
                <br />
                • Misiones completadas
                <br />
                • Solicitudes de amistad
                <br />
                • Tareas asignadas por profesores
                <br />
                • Y más...
              </p>
              <p style={{ marginTop: '1rem', color: '#666' }}>
                <strong>¿Es seguro?</strong>
                <br />
                Sí, usamos Web Push API nativo del navegador, un estándar seguro y confiable.
                Puedes desactivar las notificaciones en cualquier momento.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {devices.map((device) => {
            const isEditing = editingDeviceId === device.id;
            const isBeingDeleted = isDeleting === device.id;

            return (
              <div
                key={device.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  opacity: isBeingDeleted ? 0.5 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Device Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2rem' }}>
                        {DEVICE_TYPE_ICONS[device.deviceType] || '📱'}
                      </span>
                      <div>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              placeholder="Nombre del dispositivo"
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                width: '250px',
                              }}
                              autoFocus
                              disabled={isUpdating}
                            />
                            <button
                              onClick={() => handleSaveEdit(device.id)}
                              disabled={isUpdating}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                              }}
                            >
                              {isUpdating ? '...' : 'Guardar'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#757575',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ fontSize: '1.125rem' }}>
                                {device.deviceName || 'Sin nombre'}
                              </strong>
                              {device.isActive && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#4caf50',
                                    backgroundColor: '#e8f5e9',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Activo
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                              {DEVICE_TYPE_LABELS[device.deviceType] || device.deviceType}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isEditing && (
                      <div style={{ marginLeft: '3rem', fontSize: '0.875rem', color: '#666' }}>
                        <div>
                          <strong>Último uso:</strong> {formatLastUsed(device.lastUsedAt)}
                        </div>
                        <div style={{ marginTop: '0.25rem' }}>
                          <strong>Registrado:</strong>{' '}
                          {new Date(device.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#999' }}>
                          Token: {device.deviceToken.substring(0, 20)}... (oculto por seguridad)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleStartEdit(device.id, device.deviceName || '')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                        disabled={isBeingDeleted}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id, device.deviceName || '')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                        disabled={isBeingDeleted}
                      >
                        {isBeingDeleted ? '...' : '🗑️ Eliminar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register New Device Info */}
      {devices.length > 0 && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
          }}
        >
          <h4>📱 Registrar Nuevo Dispositivo</h4>
          <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
            ¿Usas varios dispositivos? Registra este navegador o dispositivo para recibir notificaciones push.
          </p>

          {isSupported && permissionStatus !== 'denied' ? (
            <button
              onClick={handleRegisterDevice}
              disabled={isRegistering}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isRegistering ? '#9e9e9e' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRegistering ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
            >
              {isRegistering ? '⏳ Registrando...' : '➕ Registrar Este Dispositivo'}
            </button>
          ) : (
            <p style={{ marginTop: '0.75rem', color: '#666', fontSize: '0.875rem' }}>
              {!isSupported && '⚠️ Tu navegador no soporta notificaciones push.'}
              {permissionStatus === 'denied' && '⚠️ Has bloqueado las notificaciones en este navegador.'}
            </p>
          )}
        </div>
      )}

      {/* Delete Device Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, deviceId: null, deviceName: '' })}
        onConfirm={handleConfirmDelete}
        title="Eliminar dispositivo"
        message={`¿Estás seguro de que quieres eliminar el dispositivo "${deleteConfirm.deviceName}"? Dejarás de recibir notificaciones push en este dispositivo.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Info Footer */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fff3e0',
          borderRadius: '8px',
          fontSize: '0.875rem',
        }}
      >
        <strong>ℹ️ Información sobre Dispositivos:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>
            Los dispositivos registrados pueden recibir notificaciones push incluso cuando no estás
            usando la aplicación
          </li>
          <li>
            Puedes editar el nombre de tus dispositivos para identificarlos fácilmente (ej: "iPhone
            de Juan", "Chrome en PC")
          </li>
          <li>Si pierdes un dispositivo o ya no lo usas, elimínalo de la lista por seguridad</li>
          <li>
            Los dispositivos inactivos por más de 90 días pueden ser desactivados automáticamente
          </li>
        </ul>
      </div>
    </div>
  );
};
