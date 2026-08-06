import React, { useState } from 'react';
import {
  User,
  Store,
  Badge,
  Calendar,
  Mail,
  ChevronDown,
  Info,
  Send,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomerDetails, BusinessInfo, OwnerInfo } from '../types';
import { TurnstileWidget } from './TurnstileWidget';

interface MerchantFormProps {
  customerDetails: CustomerDetails;
  businessInfo: BusinessInfo;
  owners: OwnerInfo[];
  onChangeCustomerDetails: (data: Partial<CustomerDetails>) => void;
  onChangeBusinessInfo: (data: Partial<BusinessInfo>) => void;
  onChangeOwners: (owners: OwnerInfo[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: Record<string, string>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  turnstileToken: string;
  onTurnstileToken: (token: string) => void;
  honeypotValue: string;
  onHoneypotChange: (value: string) => void;
  isSubmitting: boolean;
  submitError: string;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export const MerchantForm: React.FC<MerchantFormProps> = ({
  customerDetails,
  businessInfo,
  owners,
  onChangeCustomerDetails,
  onChangeBusinessInfo,
  onChangeOwners,
  onSubmit,
  errors,
  onSectionClick,
  turnstileToken,
  onTurnstileToken,
  honeypotValue,
  onHoneypotChange,
  isSubmitting,
  submitError,
}) => {
  const [showSSN, setShowSSN] = useState<Record<string, boolean>>({});

  const toggleShowSSN = (ownerId: string) => {
    setShowSSN((prev) => ({ ...prev, [ownerId]: !prev[ownerId] }));
  };

  const handleOwnerChange = (index: number, field: keyof OwnerInfo, value: string) => {
    const updated = [...owners];
    updated[index] = { ...updated[index], [field]: value };
    onChangeOwners(updated);
  };

  const addOwner = () => {
    const newOwner: OwnerInfo = {
      id: `owner-${Date.now()}`,
      name: '',
      title: '',
      ownershipPercent: '',
      lengthOfOwnership: '',
      dob: '',
      ssn: '',
      homeAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      homeTel: '',
      cell: '',
    };
    onChangeOwners([...owners, newOwner]);
  };

  const removeOwner = (index: number) => {
    if (owners.length === 1) return;
    const updated = owners.filter((_, i) => i !== index);
    onChangeOwners(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header Info */}
      <div className="mb-6 text-center lg:text-left">
        <h2 className="text-[24px] font-semibold mb-2 text-[#121c28] tracking-tight font-['Work_Sans']">
          Merchant Application Form
        </h2>
        <p className="text-sm text-[#434655] max-w-2xl">
          Please complete all required fields below. Your application will be processed securely using end-to-end encryption.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-[#93000a]">Please correct the missing fields below:</h4>
            <ul className="text-xs text-[#93000a] mt-1 list-disc list-inside space-y-0.5">
              {Object.entries(errors).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Honeypot field: hidden from real users via off-screen positioning (not
            display:none, which some bots specifically detect and skip). Any bot that
            blindly fills every input trips this and gets silently dropped server-side. */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', top: 0, width: 1, height: 1, overflow: 'hidden' }}
        >
          <label htmlFor="website">Leave this field empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypotValue}
            onChange={(e) => onHoneypotChange(e.target.value)}
          />
        </div>

        {/* Section 1: Customer Details */}
        <section
          className="bg-white p-5 rounded-xl shadow-2xs border border-[#c3c6d7]/50"
          id="section-1"
          onClick={() => onSectionClick('section-1')}
        >
          <div className="border-b border-[#c3c6d7]/40 pb-3 mb-5">
            <h3 className="text-[18px] font-semibold text-[#004ac6] flex items-center gap-2">
              <User className="w-5 h-5 text-[#004ac6]" />
              <span>1. Customer Details</span>
            </h3>
          </div>

          <div className="space-y-5">
            {/* NRS Customer */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label className="text-sm font-medium text-[#121c28]">
                NRS Customer<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <label className={`flex items-center gap-2 cursor-pointer p-2.5 border rounded-lg hover:border-[#004ac6] transition-colors flex-1 bg-[#ffffff] ${
                  customerDetails.nrsCustomer === 'yes' ? 'border-[#004ac6] ring-2 ring-[#004ac6]/10' : 'border-[#c3c6d7]/60'
                }`}>
                  <input
                    type="radio"
                    name="nrs_customer"
                    value="yes"
                    checked={customerDetails.nrsCustomer === 'yes'}
                    onChange={() => onChangeCustomerDetails({ nrsCustomer: 'yes' })}
                    className="w-4 h-4 text-[#004ac6] border-[#737686] focus:ring-[#004ac6]"
                  />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer p-2.5 border rounded-lg hover:border-[#004ac6] transition-colors flex-1 bg-[#ffffff] ${
                  customerDetails.nrsCustomer === 'no' ? 'border-[#004ac6] ring-2 ring-[#004ac6]/10' : 'border-[#c3c6d7]/60'
                }`}>
                  <input
                    type="radio"
                    name="nrs_customer"
                    value="no"
                    checked={customerDetails.nrsCustomer === 'no'}
                    onChange={() => onChangeCustomerDetails({ nrsCustomer: 'no' })}
                    className="w-4 h-4 text-[#004ac6] border-[#737686] focus:ring-[#004ac6]"
                  />
                  <span className="text-sm font-medium">No</span>
                </label>
              </div>
            </div>

            {/* Elmer Number */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="elmer_number" className="text-sm font-medium text-[#121c28]">
                Elmer Number
              </label>
              <input
                id="elmer_number"
                type="text"
                placeholder="Enter Elmer Number"
                value={customerDetails.elmerNumber}
                onChange={(e) => onChangeCustomerDetails({ elmerNumber: e.target.value })}
                className="w-full max-w-md border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
              />
            </div>

            {/* NRS Pay MID */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="nrs_pay_mid" className="text-sm font-medium text-[#121c28]">
                NRS Pay MID
              </label>
              <input
                id="nrs_pay_mid"
                type="text"
                placeholder="Enter NRS Pay MID"
                value={customerDetails.nrsPayMid}
                onChange={(e) => onChangeCustomerDetails({ nrsPayMid: e.target.value })}
                className="w-full max-w-md border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Business Information */}
        <section
          className="bg-white p-5 rounded-xl shadow-2xs border border-[#c3c6d7]/50"
          id="section-2"
          onClick={() => onSectionClick('section-2')}
        >
          <div className="border-b border-[#c3c6d7]/40 pb-3 mb-5">
            <h3 className="text-[18px] font-semibold text-[#004ac6] flex items-center gap-2">
              <Store className="w-5 h-5 text-[#004ac6]" />
              <span>2. Business Information</span>
            </h3>
          </div>

          <div className="space-y-4">
            {/* Legal Corporate Name */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="legal_name" className="text-sm font-medium text-[#121c28]">
                Legal Corporate Name<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <div>
                <input
                  id="legal_name"
                  type="text"
                  required
                  value={businessInfo.legalName}
                  onChange={(e) => onChangeBusinessInfo({ legalName: e.target.value })}
                  className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                    errors.legalName ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                  }`}
                />
              </div>
            </div>

            {/* DBA */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="dba" className="text-sm font-medium text-[#121c28]">
                DBA<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <input
                id="dba"
                type="text"
                required
                value={businessInfo.dba}
                onChange={(e) => onChangeBusinessInfo({ dba: e.target.value })}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                  errors.dba ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                }`}
              />
            </div>

            {/* Type of Entity */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="entity_type" className="text-sm font-medium text-[#121c28]">
                Type of Entity<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <div className="relative w-full max-w-md">
                <select
                  id="entity_type"
                  required
                  value={businessInfo.entityType}
                  onChange={(e) => onChangeBusinessInfo({ entityType: e.target.value as any })}
                  className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] appearance-none pr-10 cursor-pointer focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                    errors.entityType ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                  }`}
                >
                  <option value="" disabled>
                    - Select Entity Type -
                  </option>
                  <option value="llc">LLC (Limited Liability Company)</option>
                  <option value="corp">Corporation</option>
                  <option value="sole">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="nonprofit">Non-Profit Organization</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date Business Started */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="date_started" className="text-sm font-medium text-[#121c28]">
                Date Business Started<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <div className="relative w-full max-w-md">
                <input
                  id="date_started"
                  type="text"
                  placeholder="MM/DD/YYYY"
                  required
                  value={businessInfo.dateStarted}
                  onChange={(e) => onChangeBusinessInfo({ dateStarted: e.target.value })}
                  className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] pr-10 focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686] ${
                    errors.dateStarted ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                  }`}
                />
                <Calendar className="w-4 h-4 text-[#737686] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* State of Incorporation */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="state_inc" className="text-sm font-medium text-[#121c28]">
                State of Incorporation<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <div className="relative w-full max-w-md">
                <select
                  id="state_inc"
                  required
                  value={businessInfo.stateOfIncorporation}
                  onChange={(e) => onChangeBusinessInfo({ stateOfIncorporation: e.target.value })}
                  className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] appearance-none pr-10 cursor-pointer focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                    errors.stateOfIncorporation ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                  }`}
                >
                  <option value="" disabled>
                    - Select State -
                  </option>
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Federal Tax ID */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="tax_id" className="text-sm font-medium text-[#121c28]">
                Federal Tax ID<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <input
                id="tax_id"
                type="text"
                placeholder="XX-XXXXXXX"
                required
                value={businessInfo.federalTaxId}
                onChange={(e) => onChangeBusinessInfo({ federalTaxId: e.target.value })}
                className={`w-full max-w-md border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                  errors.federalTaxId ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                }`}
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="biz_address" className="text-sm font-medium text-[#121c28]">
                Address<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <input
                id="biz_address"
                type="text"
                required
                placeholder="Street address or P.O. Box"
                value={businessInfo.address}
                onChange={(e) => onChangeBusinessInfo({ address: e.target.value })}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                  errors.address ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                }`}
              />
            </div>

            {/* City / State / Zip */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label className="text-sm font-medium text-[#121c28]">
                City / State / Zip<span className="text-[#ba1a1a] ml-1">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  id="biz_city"
                  type="text"
                  placeholder="City"
                  required
                  value={businessInfo.city}
                  onChange={(e) => onChangeBusinessInfo({ city: e.target.value })}
                  className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                    errors.city ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                  }`}
                />
                <div className="relative">
                  <select
                    id="biz_state"
                    required
                    value={businessInfo.state}
                    onChange={(e) => onChangeBusinessInfo({ state: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] appearance-none pr-8 cursor-pointer focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                      errors.state ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                    }`}
                  >
                    <option value="" disabled>
                      State
                    </option>
                    {US_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.code} - {st.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#737686] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <input
                  id="biz_zip"
                  type="text"
                  placeholder="Zip Code"
                  required
                  value={businessInfo.zipCode}
                  onChange={(e) => onChangeBusinessInfo({ zipCode: e.target.value })}
                  className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all ${
                    errors.zipCode ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                  }`}
                />
              </div>
            </div>

            {/* Country */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label htmlFor="biz_country" className="text-sm font-medium text-[#121c28]">
                Country
              </label>
              <div className="relative w-full max-w-md">
                <select
                  id="biz_country"
                  value={businessInfo.country}
                  onChange={(e) => onChangeBusinessInfo({ country: e.target.value })}
                  className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] appearance-none pr-10 cursor-pointer focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                >
                  <option value="" disabled>
                    - Select Country -
                  </option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
              <label className="text-sm font-medium text-[#121c28]">Contact Info</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <input
                  id="biz_tel"
                  type="tel"
                  placeholder="Business Tel"
                  value={businessInfo.businessTel}
                  onChange={(e) => onChangeBusinessInfo({ businessTel: e.target.value })}
                  className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                />
                <div className="relative">
                  <input
                    id="biz_email"
                    type="email"
                    placeholder="Email *"
                    required
                    value={businessInfo.email}
                    onChange={(e) => onChangeBusinessInfo({ email: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-[#121c28] pr-10 focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686] ${
                      errors.email ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-[#737686] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Owner Information */}
        <section
          className="bg-white p-5 rounded-xl shadow-2xs border border-[#c3c6d7]/50"
          id="section-3"
          onClick={() => onSectionClick('section-3')}
        >
          <div className="border-b border-[#c3c6d7]/40 pb-3 mb-5 flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#004ac6] flex items-center gap-2">
              <Badge className="w-5 h-5 text-[#004ac6]" />
              <span>3. Merchant/Owner Information</span>
            </h3>
            <button
              type="button"
              onClick={addOwner}
              className="flex items-center gap-1.5 text-xs text-[#004ac6] hover:text-[#003ea8] font-semibold bg-[#eef4ff] hover:bg-[#e5eeff] px-3 py-1.5 rounded-lg border border-[#004ac6]/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Secondary Owner</span>
            </button>
          </div>

          <div className="space-y-8">
            {owners.map((owner, index) => (
              <div
                key={owner.id}
                className={`space-y-4 ${
                  index > 0 ? 'pt-6 border-t border-[#c3c6d7]/40 relative' : ''
                }`}
              >
                {index > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-[#004ac6] bg-[#eef4ff] px-2.5 py-1 rounded-full border border-[#004ac6]/20">
                      Secondary Owner #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOwner(index)}
                      className="flex items-center gap-1 text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/50 px-2 py-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Owner</span>
                    </button>
                  </div>
                )}

                {/* Corporate Officer/Owner Name */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label htmlFor={`owner_name_${index}`} className="text-sm font-medium text-[#121c28]">
                    Corporate Officer/Owner Name<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <input
                    id={`owner_name_${index}`}
                    type="text"
                    required
                    value={owner.name}
                    onChange={(e) => handleOwnerChange(index, 'name', e.target.value)}
                    className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                  />
                </div>

                {/* Title */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label htmlFor={`owner_title_${index}`} className="text-sm font-medium text-[#121c28]">
                    Title<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <input
                    id={`owner_title_${index}`}
                    type="text"
                    required
                    placeholder="e.g. CEO, President, Managing Member"
                    value={owner.title}
                    onChange={(e) => handleOwnerChange(index, 'title', e.target.value)}
                    className="w-full max-w-md border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                  />
                </div>

                {/* Ownership Percent */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label htmlFor={`own_percent_${index}`} className="text-sm font-medium text-[#121c28]">
                    Ownership Percent<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <div className="flex items-center w-full max-w-xs rounded-md shadow-2xs">
                    <input
                      id={`own_percent_${index}`}
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={owner.ownershipPercent}
                      onChange={(e) => handleOwnerChange(index, 'ownershipPercent', e.target.value)}
                      className="w-full border border-[#c3c6d7] rounded-l-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all rounded-r-none z-10"
                    />
                    <span className="bg-[#eef4ff] px-3.5 py-2 text-[#434655] font-medium text-sm border border-l-0 border-[#c3c6d7] rounded-r-md">
                      %
                    </span>
                  </div>
                </div>

                {/* Length of Ownership */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label htmlFor={`own_length_${index}`} className="text-sm font-medium text-[#121c28]">
                    Length of Ownership<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <input
                    id={`own_length_${index}`}
                    type="text"
                    required
                    placeholder="e.g. 3 Years, 6 Months"
                    value={owner.lengthOfOwnership}
                    onChange={(e) => handleOwnerChange(index, 'lengthOfOwnership', e.target.value)}
                    className="w-full max-w-md border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                  />
                </div>

                {/* Owner Details: DOB & SSN */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label className="text-sm font-medium text-[#121c28]">
                    Owner Details<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    <div className="relative">
                      <input
                        id={`owner_dob_${index}`}
                        type="text"
                        placeholder="DOB (MM/DD/YYYY)"
                        required
                        value={owner.dob}
                        onChange={(e) => handleOwnerChange(index, 'dob', e.target.value)}
                        className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] pr-10 focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                      />
                      <Calendar className="w-4 h-4 text-[#737686] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <input
                        id={`owner_ssn_${index}`}
                        type={showSSN[owner.id] ? 'text' : 'password'}
                        placeholder="SSN *"
                        required
                        value={owner.ssn}
                        onChange={(e) => handleOwnerChange(index, 'ssn', e.target.value)}
                        className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] pr-10 focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSSN(owner.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#121c28]"
                        title={showSSN[owner.id] ? 'Hide SSN' : 'Show SSN'}
                      >
                        {showSSN[owner.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Home Address */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label htmlFor={`owner_address_${index}`} className="text-sm font-medium text-[#121c28]">
                    Home Address<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <input
                    id={`owner_address_${index}`}
                    type="text"
                    required
                    value={owner.homeAddress}
                    onChange={(e) => handleOwnerChange(index, 'homeAddress', e.target.value)}
                    className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                  />
                </div>

                {/* City / State / Zip */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label className="text-sm font-medium text-[#121c28]">
                    City / State / Zip<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      id={`owner_city_${index}`}
                      type="text"
                      placeholder="City"
                      required
                      value={owner.city}
                      onChange={(e) => handleOwnerChange(index, 'city', e.target.value)}
                      className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                    />
                    <div className="relative">
                      <select
                        id={`owner_state_${index}`}
                        value={owner.state}
                        onChange={(e) => handleOwnerChange(index, 'state', e.target.value)}
                        className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] appearance-none pr-8 cursor-pointer focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                      >
                        <option value="" disabled>
                          State
                        </option>
                        {US_STATES.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.code} - {st.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#737686] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <input
                      id={`owner_zip_${index}`}
                      type="text"
                      placeholder="Zip Code"
                      required
                      value={owner.zipCode}
                      onChange={(e) => handleOwnerChange(index, 'zipCode', e.target.value)}
                      className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label htmlFor={`owner_country_${index}`} className="text-sm font-medium text-[#121c28]">
                    Country<span className="text-[#ba1a1a] ml-1">*</span>
                  </label>
                  <div className="relative w-full max-w-md">
                    <select
                      id={`owner_country_${index}`}
                      required
                      value={owner.country}
                      onChange={(e) => handleOwnerChange(index, 'country', e.target.value)}
                      className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] appearance-none pr-10 cursor-pointer focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                    >
                      <option value="" disabled>
                        - Select Country -
                      </option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="MX">Mexico</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#737686] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 items-center">
                  <label className="text-sm font-medium text-[#121c28]">Phone Numbers</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    <input
                      id={`owner_tel_${index}`}
                      type="tel"
                      placeholder="Home Tel"
                      value={owner.homeTel}
                      onChange={(e) => handleOwnerChange(index, 'homeTel', e.target.value)}
                      className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                    />
                    <input
                      id={`owner_cell_${index}`}
                      type="tel"
                      placeholder="Cell"
                      value={owner.cell}
                      onChange={(e) => handleOwnerChange(index, 'cell', e.target.value)}
                      className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm bg-white text-[#121c28] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all placeholder:text-[#737686]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Submit Section Banner */}
        <div
          className="bg-white p-6 rounded-xl shadow-2xs border border-[#c3c6d7]/50 flex flex-col gap-5"
          id="submit-section"
        >
          {submitError && (
            <div className="p-3.5 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
              <p className="text-xs text-[#93000a]">{submitError}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-3 bg-[#eef4ff] p-3.5 rounded-lg flex-1 border border-[#c3c6d7]/30">
              <Info className="w-5 h-5 text-[#004ac6] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#434655] leading-tight">
                A copy of this submission will be sent securely to the email provided. Please review all information before submitting.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !turnstileToken}
              className="w-full md:w-auto bg-[#004ac6] text-white font-medium text-sm px-7 py-3 rounded-lg hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs hover:shadow-md focus:ring-4 focus:ring-[#004ac6]/20 outline-none flex items-center justify-center gap-2 cursor-pointer font-['Work_Sans']"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>

          <div className="flex justify-center">
            <TurnstileWidget onToken={onTurnstileToken} />
          </div>
        </div>
      </form>
    </div>
  );
};
