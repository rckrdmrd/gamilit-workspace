import React, { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
} from 'lucide-react';

/**
 * AdminUsersPage - Gestión de usuarios de la plataforma
 */
export default function AdminUsersPage() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'user_manager'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Mock data de usuarios
  const mockUsers = [
    {
      id: '1',
      name: 'Ana García',
      email: 'ana.garcia@school.edu',
      role: 'student',
      status: 'active',
      institution: 'Escuela Primaria Central',
      registeredAt: '2024-01-15',
      lastLogin: '2025-11-10',
    },
    {
      id: '2',
      name: 'Carlos Méndez',
      email: 'carlos.mendez@school.edu',
      role: 'admin_teacher',
      status: 'active',
      institution: 'Escuela Primaria Central',
      registeredAt: '2023-09-01',
      lastLogin: '2025-11-11',
    },
    {
      id: '3',
      name: 'María López',
      email: 'maria.lopez@school2.edu',
      role: 'student',
      status: 'inactive',
      institution: 'Colegio San José',
      registeredAt: '2024-03-20',
      lastLogin: '2025-10-15',
    },
    {
      id: '4',
      name: 'Roberto Sánchez',
      email: 'roberto.sanchez@admin.gamilit.com',
      role: 'super_admin',
      status: 'active',
      institution: 'GAMILIT Platform',
      registeredAt: '2023-01-01',
      lastLogin: '2025-11-11',
    },
    {
      id: '5',
      name: 'Laura Fernández',
      email: 'laura.fernandez@school.edu',
      role: 'student',
      status: 'active',
      institution: 'Escuela Primaria Central',
      registeredAt: '2024-02-10',
      lastLogin: '2025-11-09',
    },
  ];

  // Filtrar usuarios
  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.status === 'active').length,
    inactive: mockUsers.filter((u) => u.status === 'inactive').length,
    students: mockUsers.filter((u) => u.role === 'student').length,
    teachers: mockUsers.filter((u) => u.role === 'admin_teacher').length,
    admins: mockUsers.filter((u) => u.role === 'super_admin').length,
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-700',
      admin_teacher: 'bg-purple-100 text-purple-700',
      super_admin: 'bg-red-100 text-red-700',
    };

    const roleLabels: Record<string, string> = {
      student: 'Estudiante',
      admin_teacher: 'Profesor',
      super_admin: 'Super Admin',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-700'}`}>
        {roleLabels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Activo</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-red-600">
        <XCircle className="w-4 h-4" />
        <span className="text-sm">Inactivo</span>
      </span>
    );
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
            <Users className="w-8 h-8 text-blue-500" />
            Gestión de Usuarios
          </h1>
          <p className="text-detective-text-secondary mt-1">
            Administra usuarios, roles y permisos de la plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="text-sm text-detective-text-secondary mb-1">Total</p>
              <p className="text-2xl font-bold text-detective-text">{stats.total}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="text-sm text-detective-text-secondary mb-1">Activos</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="text-sm text-detective-text-secondary mb-1">Inactivos</p>
              <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="text-sm text-detective-text-secondary mb-1">Estudiantes</p>
              <p className="text-2xl font-bold text-blue-500">{stats.students}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="text-sm text-detective-text-secondary mb-1">Profesores</p>
              <p className="text-2xl font-bold text-purple-500">{stats.teachers}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <p className="text-sm text-detective-text-secondary mb-1">Admins</p>
              <p className="text-2xl font-bold text-red-500">{stats.admins}</p>
            </div>
          </DetectiveCard>
        </div>

        {/* Filters and Search */}
        <DetectiveCard>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-detective-orange"
              />
            </div>

            {/* Filter by Role */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
              >
                <option value="all">Todos los roles</option>
                <option value="student">Estudiantes</option>
                <option value="admin_teacher">Profesores</option>
                <option value="super_admin">Super Admins</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            {/* Add User Button */}
            <DetectiveButton variant="primary" onClick={() => alert('Crear usuario - Próximamente')}>
              <UserPlus className="w-5 h-5" />
              Nuevo Usuario
            </DetectiveButton>
          </div>
        </DetectiveCard>

        {/* Users Table */}
        <DetectiveCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Institución
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Último acceso
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="border-b border-gray-700 hover:bg-detective-bg-secondary transition-colors">
                    <td className="px-4 py-3 text-sm text-detective-text font-medium">
                      {usr.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-detective-text-secondary flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {usr.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getRoleBadge(usr.role)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(usr.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-detective-text-secondary">
                      {usr.institution}
                    </td>
                    <td className="px-4 py-3 text-sm text-detective-text-secondary">
                      {usr.lastLogin}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 hover:bg-detective-bg rounded text-blue-400 hover:text-blue-300"
                          onClick={() => alert(`Editar usuario: ${usr.name}`)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {usr.status === 'active' ? (
                          <button
                            className="p-1 hover:bg-detective-bg rounded text-red-400 hover:text-red-300"
                            onClick={() => alert(`Desactivar usuario: ${usr.name}`)}
                            title="Desactivar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            className="p-1 hover:bg-detective-bg rounded text-green-400 hover:text-green-300"
                            onClick={() => alert(`Activar usuario: ${usr.name}`)}
                            title="Activar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1 hover:bg-detective-bg rounded text-red-400 hover:text-red-300"
                          onClick={() => alert(`Eliminar usuario: ${usr.name}`)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-detective-text-secondary">
                No se encontraron usuarios que coincidan con los filtros
              </div>
            )}
          </div>
        </DetectiveCard>
      </div>
    </AdminLayout>
  );
}
