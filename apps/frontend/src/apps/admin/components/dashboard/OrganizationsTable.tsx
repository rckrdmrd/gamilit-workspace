/**
 * OrganizationsTable Component
 *
 * Table for managing organizations with search, filtering, and actions.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Building, Eye, Edit, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { StatusBadge } from '@shared/components/base/StatusBadge';
import type { StatusType } from '@shared/components/base/StatusBadge';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import type { Organization } from '../../types';

export const OrganizationsTable: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.admin.organizations.list);
      const data = response.data.success ? response.data.data : response.data;
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-500/20 text-gray-500',
      basic: 'bg-amber-500/20 text-amber-500',
      professional: 'bg-blue-500/20 text-blue-500',
      enterprise: 'bg-purple-500/20 text-purple-500',
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  const getPlanEmoji = (plan: string) => {
    const emojis = {
      free: '🔍',
      basic: '🥉',
      professional: '⭐',
      enterprise: '🏆',
    };
    return emojis[plan as keyof typeof emojis] || '🔍';
  };

  const renderStatusBadge = (status: string) => {
    const validStatuses: StatusType[] = ['active', 'inactive', 'suspended'];
    const statusType = validStatuses.includes(status as StatusType)
      ? (status as StatusType)
      : 'inactive';
    return <StatusBadge status={statusType} size="sm" showIcon={false} />;
  };

  return (
    <DetectiveCard>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-detective-subtitle">Organizations</h3>
          <p className="text-detective-small text-gray-400">{organizations.length} total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-700 bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Name</th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Plan</th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Status</th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Users</th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Created</th>
              <th className="text-detective-small px-4 py-3 text-center text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading organizations...
                </td>
              </tr>
            ) : filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  🔍 No organizations found
                </td>
              </tr>
            ) : (
              filteredOrgs.map((org) => (
                <motion.tr
                  key={org.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-800 transition-colors hover:bg-detective-bg-secondary"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-detective-small font-semibold">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs capitalize ${getPlanBadge(org.plan)}`}
                    >
                      {getPlanEmoji(org.plan)} {org.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {renderStatusBadge(org.status)}
                  </td>
                  <td className="text-detective-small px-4 py-3">{org.userCount}</td>
                  <td className="text-detective-small px-4 py-3 text-gray-400">
                    {org.createdAt ? new Date(org.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/admin/organizations/${org.id}`}
                        className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Link>
                      <Link
                        to={`/admin/organizations/${org.id}/edit`}
                        className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
                        title="Edit organization"
                      >
                        <Edit className="h-4 w-4 text-green-500" />
                      </Link>
                      {org.status !== 'suspended' && (
                        <button
                          className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
                          title="Suspend organization"
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DetectiveCard>
  );
};
