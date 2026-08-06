import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MerchantForm } from './components/MerchantForm';
import { ApplicationsList } from './components/ApplicationsList';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { AdminLogin } from './components/AdminLogin';
import {
  CustomerDetails,
  BusinessInfo,
  OwnerInfo,
  MerchantApplication,
  PortalTab,
} from './types';
import {
  submitApplication,
  fetchMe,
  adminLogout,
  fetchApplications,
  fetchApplicationDetail,
  updateApplicationStatus,
  deleteApplication,
  ApiError,
} from './lib/api';

const defaultCustomerDetails: CustomerDetails = {
  nrsCustomer: '',
  elmerNumber: '',
  nrsPayMid: '',
};

const defaultBusinessInfo: BusinessInfo = {
  legalName: '',
  dba: '',
  entityType: '',
  dateStarted: '',
  stateOfIncorporation: '',
  federalTaxId: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  businessTel: '',
  email: '',
};

const defaultOwner: OwnerInfo = {
  id: 'owner-1',
  name: '',
  title: '',
  ownershipPercent: '100',
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<PortalTab>('form');

  // Admin auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined);

  // Admin: applications list
  const [applications, setApplications] = useState<MerchantApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // Current Form State
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(defaultCustomerDetails);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [owners, setOwners] = useState<OwnerInfo[]>([defaultOwner]);
  const [activeSection, setActiveSection] = useState<'section-1' | 'section-2' | 'section-3' | 'submit-section'>('section-1');

  // Anti-bot
  const [turnstileToken, setTurnstileToken] = useState('');
  const [honeypotValue, setHoneypotValue] = useState('');

  // Validation / submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Modals
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<MerchantApplication | null>(null);
  const [recentlySubmittedApp, setRecentlySubmittedApp] = useState<MerchantApplication | null>(null);

  // Check for an existing admin session on load (e.g. page refresh).
  useEffect(() => {
    fetchMe().then((me) => {
      if (me) {
        setIsAdminAuthenticated(true);
        setAdminEmail(me.email);
      }
      setAuthChecked(true);
    });
  }, []);

  const loadApplications = useCallback(async () => {
    setIsLoadingApplications(true);
    try {
      const apps = await fetchApplications();
      setApplications(apps);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setIsAdminAuthenticated(false);
      }
    } finally {
      setIsLoadingApplications(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'admin' && isAdminAuthenticated) {
      loadApplications();
    }
  }, [currentTab, isAdminAuthenticated, loadApplications]);

  // Handle section completeness for stepper indicator
  const section1Complete = Boolean(customerDetails.nrsCustomer !== '');
  const section2Complete = Boolean(
    businessInfo.legalName.trim() &&
      businessInfo.dba.trim() &&
      businessInfo.entityType &&
      businessInfo.dateStarted.trim() &&
      businessInfo.stateOfIncorporation &&
      businessInfo.federalTaxId.trim() &&
      businessInfo.address.trim() &&
      businessInfo.city.trim() &&
      businessInfo.state &&
      businessInfo.zipCode.trim() &&
      businessInfo.email.trim()
  );
  const section3Complete = Boolean(
    owners.length > 0 &&
      owners.every(
        (o) =>
          o.name.trim() &&
          o.title.trim() &&
          o.ownershipPercent.trim() &&
          o.dob.trim() &&
          o.ssn.trim() &&
          o.homeAddress.trim() &&
          o.city.trim() &&
          o.zipCode.trim()
      )
  );

  const resetFormState = () => {
    setCustomerDetails(defaultCustomerDetails);
    setBusinessInfo(defaultBusinessInfo);
    setOwners([{ ...defaultOwner, id: `owner-${Date.now()}` }]);
    setErrors({});
    setActiveSection('section-1');
    setTurnstileToken('');
    setHoneypotValue('');
    setSubmitError('');
  };

  // Reset current form draft
  const handleResetForm = () => {
    if (window.confirm('¿Seguro que quieres borrar el formulario actual?')) {
      resetFormState();
    }
  };

  // Scroll smooth to section
  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId as any);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Select an application from the admin list — fetch the full (unmasked) record.
  const handleSelectApplication = async (app: MerchantApplication) => {
    try {
      const full = await fetchApplicationDetail(app.id);
      setSelectedAppForDetail(full);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'No se pudo cargar el detalle.');
    }
  };

  // Delete an application
  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('¿Eliminar este registro de forma permanente?')) return;
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'No se pudo eliminar.');
    }
  };

  // Change status of an application
  const handleStatusChange = async (id: string, newStatus: MerchantApplication['status']) => {
    try {
      await updateApplicationStatus(id, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus, updatedAt: new Date().toISOString() } : app))
      );
      setSelectedAppForDetail((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAdminAuthenticated(false);
    setAdminEmail(undefined);
    setApplications([]);
    setCurrentTab('form');
  };

  // Submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const newErrors: Record<string, string> = {};

    if (!customerDetails.nrsCustomer) {
      newErrors.nrsCustomer = 'NRS Customer selection is required';
    }
    if (!businessInfo.legalName.trim()) newErrors.legalName = 'Legal Corporate Name is required';
    if (!businessInfo.dba.trim()) newErrors.dba = 'DBA is required';
    if (!businessInfo.entityType) newErrors.entityType = 'Type of Entity is required';
    if (!businessInfo.dateStarted.trim()) newErrors.dateStarted = 'Date Business Started is required';
    if (!businessInfo.stateOfIncorporation) newErrors.stateOfIncorporation = 'State of Incorporation is required';
    if (!businessInfo.federalTaxId.trim()) newErrors.federalTaxId = 'Federal Tax ID is required';
    if (!businessInfo.address.trim()) newErrors.address = 'Business Address is required';
    if (!businessInfo.city.trim()) newErrors.city = 'City is required';
    if (!businessInfo.state) newErrors.state = 'State is required';
    if (!businessInfo.zipCode.trim()) newErrors.zipCode = 'Zip Code is required';
    if (!businessInfo.email.trim()) newErrors.email = 'Contact Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!turnstileToken) {
      setSubmitError('Completa la verificación anti-bot antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { appId } = await submitApplication({
        customerDetails,
        businessInfo,
        owners,
        turnstileToken,
        website: honeypotValue,
      });

      const submitted: MerchantApplication = {
        id: appId,
        appId,
        status: 'Under Review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        customerDetails: { ...customerDetails },
        businessInfo: { ...businessInfo },
        owners: [...owners],
      };

      setRecentlySubmittedApp(submitted);
      resetFormState();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'No se pudo enviar la solicitud. Intenta de nuevo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#121c28] font-['Work_Sans',sans-serif] min-h-screen flex flex-col antialiased">
      {/* Sidebar Progress Stepper */}
      <Sidebar
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
        sectionStatus={{
          section1Complete,
          section2Complete,
          section3Complete,
        }}
        currentTab={currentTab}
        onResetForm={handleResetForm}
      />

      {/* Main Container Layout */}
      <div className="flex-1 lg:ml-64 w-full flex flex-col">
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isAdminAuthenticated={isAdminAuthenticated}
          adminEmail={adminEmail}
          onLogout={handleLogout}
        />

        {/* Tab Content */}
        <main className="flex-1">
          {currentTab === 'form' ? (
            <MerchantForm
              customerDetails={customerDetails}
              businessInfo={businessInfo}
              owners={owners}
              onChangeCustomerDetails={(data) =>
                setCustomerDetails((prev) => ({ ...prev, ...data }))
              }
              onChangeBusinessInfo={(data) =>
                setBusinessInfo((prev) => ({ ...prev, ...data }))
              }
              onChangeOwners={setOwners}
              onSubmit={handleSubmit}
              errors={errors}
              activeSection={activeSection}
              onSectionClick={(secId) => setActiveSection(secId as any)}
              turnstileToken={turnstileToken}
              onTurnstileToken={setTurnstileToken}
              honeypotValue={honeypotValue}
              onHoneypotChange={setHoneypotValue}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          ) : !authChecked ? (
            <div className="p-10 text-center text-sm text-[#434655]">Cargando…</div>
          ) : !isAdminAuthenticated ? (
            <AdminLogin
              onSuccess={(email) => {
                setIsAdminAuthenticated(true);
                setAdminEmail(email);
              }}
            />
          ) : (
            <ApplicationsList
              applications={applications}
              onSelectApplication={handleSelectApplication}
              onDeleteApplication={handleDeleteApplication}
              onRefresh={loadApplications}
              isLoading={isLoadingApplications}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ApplicationDetailModal
        application={selectedAppForDetail}
        onClose={() => setSelectedAppForDetail(null)}
        onStatusChange={handleStatusChange}
      />

      <SubmissionSuccessModal
        application={recentlySubmittedApp}
        onClose={() => setRecentlySubmittedApp(null)}
      />
    </div>
  );
}
