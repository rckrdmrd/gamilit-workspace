import React, { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Wrench,
  Save,
  AlertTriangle,
  Database,
  Image,
} from 'lucide-react';

/**
 * AdminSettingsPage - Configuración general del sistema
 */
export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'general' | 'email' | 'notifications' | 'security' | 'maintenance'>('general');

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'system_config'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSave = () => {
    alert('Configuración guardada correctamente');
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-detective-text flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-500" />
            Configuración del Sistema
          </h1>
          <p className="text-detective-text-secondary mt-1">
            Administra la configuración global de la plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Menu */}
          <div className="lg:col-span-1">
            <DetectiveCard>
              <h2 className="text-lg font-bold text-detective-text mb-4">Secciones</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'general'
                      ? 'bg-detective-orange text-white'
                      : 'text-detective-text hover:bg-detective-bg-secondary'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span>General</span>
                </button>
                <button
                  onClick={() => setActiveSection('email')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'email'
                      ? 'bg-detective-orange text-white'
                      : 'text-detective-text hover:bg-detective-bg-secondary'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span>Email (SMTP)</span>
                </button>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'notifications'
                      ? 'bg-detective-orange text-white'
                      : 'text-detective-text hover:bg-detective-bg-secondary'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span>Notificaciones</span>
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'security'
                      ? 'bg-detective-orange text-white'
                      : 'text-detective-text hover:bg-detective-bg-secondary'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Seguridad</span>
                </button>
                <button
                  onClick={() => setActiveSection('maintenance')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'maintenance'
                      ? 'bg-detective-orange text-white'
                      : 'text-detective-text hover:bg-detective-bg-secondary'
                  }`}
                >
                  <Wrench className="w-5 h-5" />
                  <span>Mantenimiento</span>
                </button>
              </nav>
            </DetectiveCard>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeSection === 'general' && (
              <DetectiveCard>
                <h2 className="text-xl font-bold text-detective-text mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Configuración General
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Nombre de la Plataforma
                    </label>
                    <input
                      type="text"
                      defaultValue="GAMILIT Platform"
                      className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      URL de la Plataforma
                    </label>
                    <input
                      type="url"
                      defaultValue="https://gamilit.com"
                      className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Logo de la Plataforma
                    </label>
                    <div className="flex items-center gap-4">
                      <img
                        src="/logo_gamilit.png"
                        alt="Logo"
                        className="w-16 h-16 rounded-lg border border-gray-600"
                      />
                      <DetectiveButton variant="outline" size="sm">
                        <Image className="w-4 h-4" />
                        Cambiar Logo
                      </DetectiveButton>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Idioma por Defecto
                    </label>
                    <select className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Zona Horaria
                    </label>
                    <select className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange">
                      <option value="America/Mexico_City">América/Ciudad de México (UTC-6)</option>
                      <option value="America/New_York">América/Nueva York (UTC-5)</option>
                      <option value="America/Los_Angeles">América/Los Ángeles (UTC-8)</option>
                    </select>
                  </div>
                  <DetectiveButton variant="primary" onClick={handleSave}>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </DetectiveButton>
                </div>
              </DetectiveCard>
            )}

            {/* Email Settings */}
            {activeSection === 'email' && (
              <DetectiveCard>
                <h2 className="text-xl font-bold text-detective-text mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Configuración de Email (SMTP)
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-detective-text mb-2">
                        Servidor SMTP
                      </label>
                      <input
                        type="text"
                        defaultValue="smtp.gmail.com"
                        className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-detective-text mb-2">
                        Puerto
                      </label>
                      <input
                        type="number"
                        defaultValue="587"
                        className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Usuario SMTP
                    </label>
                    <input
                      type="email"
                      defaultValue="noreply@gamilit.com"
                      className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Contraseña SMTP
                    </label>
                    <input
                      type="password"
                      defaultValue="••••••••"
                      className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-tls"
                      defaultChecked
                      className="w-4 h-4 rounded border-gray-600 bg-detective-bg-secondary"
                    />
                    <label htmlFor="use-tls" className="text-sm text-detective-text">
                      Usar TLS/SSL
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <DetectiveButton variant="primary" onClick={handleSave}>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </DetectiveButton>
                    <DetectiveButton variant="outline" onClick={() => alert('Enviando email de prueba...')}>
                      <Mail className="w-5 h-5" />
                      Enviar Email de Prueba
                    </DetectiveButton>
                  </div>
                </div>
              </DetectiveCard>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <DetectiveCard>
                <h2 className="text-xl font-bold text-detective-text mb-4 flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  Configuración de Notificaciones
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-detective-bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-detective-text">Notificaciones por Email</h3>
                        <p className="text-sm text-detective-text-secondary">
                          Enviar notificaciones importantes por email
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-6 h-6 rounded border-gray-600 bg-detective-bg"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-detective-bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-detective-text">Notificaciones Push</h3>
                        <p className="text-sm text-detective-text-secondary">
                          Enviar notificaciones push a dispositivos móviles
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-6 h-6 rounded border-gray-600 bg-detective-bg"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-detective-bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-detective-text">Notificaciones de Sistema</h3>
                        <p className="text-sm text-detective-text-secondary">
                          Alertas sobre el estado del sistema
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-6 h-6 rounded border-gray-600 bg-detective-bg"
                      />
                    </div>
                  </div>
                  <DetectiveButton variant="primary" onClick={handleSave}>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </DetectiveButton>
                </div>
              </DetectiveCard>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <DetectiveCard>
                <h2 className="text-xl font-bold text-detective-text mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Configuración de Seguridad
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Duración de Sesión (minutos)
                    </label>
                    <input
                      type="number"
                      defaultValue="60"
                      className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-detective-text mb-2">
                      Intentos de Login Máximos
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                    />
                  </div>
                  <div className="p-4 bg-detective-bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-detective-text">Autenticación de Dos Factores (2FA)</h3>
                        <p className="text-sm text-detective-text-secondary">
                          Requerir 2FA para todos los administradores
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-6 h-6 rounded border-gray-600 bg-detective-bg"
                      />
                    </div>
                  </div>
                  <DetectiveButton variant="primary" onClick={handleSave}>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </DetectiveButton>
                </div>
              </DetectiveCard>
            )}

            {/* Maintenance Settings */}
            {activeSection === 'maintenance' && (
              <DetectiveCard>
                <h2 className="text-xl font-bold text-detective-text mb-4 flex items-center gap-2">
                  <Wrench className="w-6 h-6" />
                  Mantenimiento del Sistema
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
                      <div>
                        <h3 className="font-bold text-yellow-400 mb-2">Modo Mantenimiento</h3>
                        <p className="text-sm text-detective-text-secondary mb-3">
                          Activar el modo mantenimiento deshabilitará el acceso para todos los usuarios excepto administradores.
                        </p>
                        <DetectiveButton
                          variant="outline"
                          size="sm"
                          onClick={() => alert('Activar modo mantenimiento')}
                        >
                          Activar Modo Mantenimiento
                        </DetectiveButton>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-detective-bg-secondary rounded-lg">
                    <h3 className="font-bold text-detective-text mb-3 flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Respaldo de Base de Datos
                    </h3>
                    <p className="text-sm text-detective-text-secondary mb-3">
                      Último respaldo: 2025-11-11 02:00 AM
                    </p>
                    <DetectiveButton variant="outline" size="sm" onClick={() => alert('Creando respaldo...')}>
                      Crear Respaldo Ahora
                    </DetectiveButton>
                  </div>

                  <div className="p-4 bg-detective-bg-secondary rounded-lg">
                    <h3 className="font-bold text-detective-text mb-3">Limpiar Caché</h3>
                    <p className="text-sm text-detective-text-secondary mb-3">
                      Limpia la caché del sistema para mejorar el rendimiento
                    </p>
                    <DetectiveButton variant="outline" size="sm" onClick={() => alert('Limpiando caché...')}>
                      Limpiar Caché
                    </DetectiveButton>
                  </div>
                </div>
              </DetectiveCard>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
