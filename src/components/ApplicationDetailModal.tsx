import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  User,
  BadgeCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import { MerchantApplication } from '../types';

interface ApplicationDetailModalProps {
  application: MerchantApplication | null;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: MerchantApplication['status']) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onStatusChange,
}) => {
  if (!application) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#c3c6d7]/50 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Top Bar */}
        <div className="bg-[#f8f9ff] px-6 py-4 border-b border-[#c3c6d7]/40 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e5eeff] rounded-lg text-[#004ac6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#121c28]">
                  {application.businessInfo.legalName || 'Merchant Details'}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#e5eeff] text-[#004ac6] font-semibold rounded-md border border-[#004ac6]/20">
                  {application.appId}
                </span>
              </div>
              <p className="text-xs text-[#434655]">
                DBA: {application.businessInfo.dba || 'N/A'} • Submitted:{' '}
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleDateString()
                  : new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c3c6d7] hover:bg-[#f8f9ff] text-[#121c28] text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#c3c6d7]/30 rounded-full text-[#737686] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#121c28]">
          {/* Status Bar */}
          <div className="bg-[#eef4ff] p-4 rounded-xl border border-[#004ac6]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
                Application Status
              </span>
              <p className="text-base font-bold text-[#004ac6] mt-0.5">
                {application.status}
              </p>
            </div>
            {onStatusChange && (
              <div className="flex items-center gap-2">
                {application.status !== 'Approved' && (
                  <button
                    onClick={() => onStatusChange(application.id, 'Approved')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Merchant</span>
                  </button>
                )}
                {application.status !== 'Under Review' && (
                  <button
                    onClick={() => onStatusChange(application.id, 'Under Review')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Set Under Review</span>
                  </button>
                )}
                {application.status !== 'Rejected' && (
                  <button
                    onClick={() => onStatusChange(application.id, 'Rejected')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    <span>Reject</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 1: Customer Details */}
          <div className="border border-[#c3c6d7]/40 rounded-xl p-4 bg-white space-y-3">
            <h4 className="text-xs font-bold text-[#004ac6] uppercase tracking-wider flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-2">
              <User className="w-4 h-4" />
              <span>1. Customer Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#737686] block">NRS Customer</span>
                <span className="font-semibold uppercase">{application.customerDetails.nrsCustomer || 'No'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">Elmer Number</span>
                <span className="font-semibold">{application.customerDetails.elmerNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">NRS Pay MID</span>
                <span className="font-semibold">{application.customerDetails.nrsPayMid || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Business Info */}
          <div className="border border-[#c3c6d7]/40 rounded-xl p-4 bg-white space-y-3">
            <h4 className="text-xs font-bold text-[#004ac6] uppercase tracking-wider flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-2">
              <Building2 className="w-4 h-4" />
              <span>2. Business Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#737686] block">Legal Corporate Name</span>
                <span className="font-semibold">{application.businessInfo.legalName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">DBA</span>
                <span className="font-semibold">{application.businessInfo.dba || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">Type of Entity</span>
                <span className="font-semibold uppercase">{application.businessInfo.entityType || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">Date Business Started</span>
                <span className="font-semibold">{application.businessInfo.dateStarted || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">State of Incorporation</span>
                <span className="font-semibold">{application.businessInfo.stateOfIncorporation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">Federal Tax ID</span>
                <span className="font-semibold font-mono">{application.businessInfo.federalTaxId || 'N/A'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#737686] block">Business Address</span>
                <span className="font-semibold">
                  {application.businessInfo.address}, {application.businessInfo.city},{' '}
                  {application.businessInfo.state} {application.businessInfo.zipCode},{' '}
                  {application.businessInfo.country}
                </span>
              </div>
              <div>
                <span className="text-[#737686] block">Business Tel</span>
                <span className="font-semibold">{application.businessInfo.businessTel || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#737686] block">Email</span>
                <span className="font-semibold">{application.businessInfo.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Owners */}
          <div className="border border-[#c3c6d7]/40 rounded-xl p-4 bg-white space-y-4">
            <h4 className="text-xs font-bold text-[#004ac6] uppercase tracking-wider flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-2">
              <BadgeCheck className="w-4 h-4" />
              <span>3. Merchant / Owner Information ({application.owners.length})</span>
            </h4>
            {application.owners.map((owner, idx) => (
              <div
                key={owner.id || idx}
                className="p-3.5 bg-[#f8f9ff] rounded-lg border border-[#c3c6d7]/30 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center border-b border-[#c3c6d7]/20 pb-1.5">
                  <span className="font-bold text-[#121c28]">
                    {owner.name || `Owner #${idx + 1}`} ({owner.title || 'Officer'})
                  </span>
                  <span className="bg-[#004ac6] text-white px-2 py-0.5 rounded text-[11px] font-semibold">
                    {owner.ownershipPercent}% Ownership
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[#737686] block">Length of Ownership</span>
                    <span className="font-medium">{owner.lengthOfOwnership || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#737686] block">DOB / SSN</span>
                    <span className="font-medium">
                      DOB: {owner.dob || 'N/A'} • SSN: {owner.ssn || '••••'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#737686] block">Home Address</span>
                    <span className="font-medium">
                      {owner.homeAddress}, {owner.city}, {owner.state} {owner.zipCode},{' '}
                      {owner.country}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737686] block">Home Tel / Cell</span>
                    <span className="font-medium">
                      Home: {owner.homeTel || 'N/A'} | Cell: {owner.cell || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f8f9ff] px-6 py-3 border-t border-[#c3c6d7]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#004ac6] text-white text-xs font-semibold rounded-lg hover:bg-[#003ea8] transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
