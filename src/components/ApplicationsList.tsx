import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Building2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { MerchantApplication, ApplicationStatus } from '../types';

interface ApplicationsListProps {
  applications: MerchantApplication[];
  onSelectApplication: (app: MerchantApplication) => void;
  onDeleteApplication: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  onSelectApplication,
  onDeleteApplication,
  onRefresh,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.appId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.businessInfo.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.businessInfo.dba.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.businessInfo.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' || app.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <span>{status}</span>
          </span>
        );
    }
  };

  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
  const pendingCount = applications.filter((a) => a.status === 'Under Review').length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header & Stat Cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#121c28] tracking-tight font-['Work_Sans']">
            Enrollment Applications
          </h2>
          <p className="text-sm text-[#434655]">
            Manage and track all merchant onboardings, drafts, and active underwriting reviews.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Cargando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7]/50 shadow-2xs">
          <p className="text-xs text-[#434655] font-medium">Total Solicitudes</p>
          <p className="text-2xl font-bold text-[#121c28] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7]/50 shadow-2xs">
          <p className="text-xs text-amber-700 font-medium">Underwriting Review</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7]/50 shadow-2xs">
          <p className="text-xs text-emerald-700 font-medium">Approved Merchants</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7]/50 shadow-2xs">
          <p className="text-xs text-red-700 font-medium">Rejected</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#c3c6d7]/50 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Legal Name, DBA, App ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#c3c6d7] rounded-lg bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#737686] shrink-0" />
          {['All', 'Under Review', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-[#004ac6] text-white shadow-2xs'
                  : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#eef4ff] border border-[#c3c6d7]/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-xl border border-[#c3c6d7]/50 shadow-2xs overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-[#c3c6d7] mx-auto mb-3" />
            <p className="text-base font-medium text-[#121c28]">No applications found</p>
            <p className="text-xs text-[#434655] mt-1">Try adjusting your search query or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#c3c6d7]/50 text-xs font-semibold text-[#434655]">
                  <th className="py-3.5 px-4">App ID</th>
                  <th className="py-3.5 px-4">Merchant / Legal Name</th>
                  <th className="py-3.5 px-4">Entity & State</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7]/30 text-sm">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-[#f8f9ff]/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-[#004ac6]">
                      {app.appId}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-[#121c28]">
                          {app.businessInfo.legalName || 'Untitled Merchant'}
                        </p>
                        <p className="text-xs text-[#434655]">
                          DBA: {app.businessInfo.dba || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-[#434655]">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#004ac6]" />
                        <span>
                          {app.businessInfo.entityType?.toUpperCase() || 'LLC'}{' '}
                          {app.businessInfo.stateOfIncorporation ? `(${app.businessInfo.stateOfIncorporation})` : ''}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#737686]">{app.businessInfo.email}</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-4 px-4 text-xs text-[#434655]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#737686]" />
                        <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#eef4ff] hover:bg-[#e5eeff] text-[#004ac6] border border-[#004ac6]/30 text-xs font-medium rounded-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="p-1.5 text-[#737686] hover:text-[#ba1a1a] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
