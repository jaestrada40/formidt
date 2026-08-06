import { BusinessInfo, CustomerDetails, OwnerInfo, MerchantApplication, ApplicationStatus } from '../types';

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no body
  }
  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }
  return body;
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(message: string, status: number, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// ---- Public: submission ----

export interface SubmitPayload {
  customerDetails: CustomerDetails;
  businessInfo: BusinessInfo;
  owners: OwnerInfo[];
  turnstileToken: string;
  website: string; // honeypot, must stay empty
}

export async function submitApplication(payload: SubmitPayload): Promise<{ appId: string }> {
  return apiFetch('/applications', { method: 'POST', body: JSON.stringify(payload) });
}

// ---- Admin auth ----

export type LoginResult =
  | { success: true; email: string }
  | { mfaRequired: true; tempUserId: string }
  | { mfaSetupRequired: true; tempUserId: string; qrCodeDataUrl: string };

export async function adminLogin(email: string, password: string, turnstileToken: string): Promise<LoginResult> {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, turnstileToken }) });
}

export async function verifyMfa(tempUserId: string, code: string): Promise<{ success: true; email: string }> {
  return apiFetch('/auth/verify-mfa', { method: 'POST', body: JSON.stringify({ tempUserId, code }) });
}

export async function adminLogout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function getMfaStatus(): Promise<{ mfaRequired: boolean }> {
  return apiFetch('/auth/mfa-status');
}

export async function toggleMfa(code?: string): Promise<{ mfaRequired: boolean }> {
  return apiFetch('/auth/mfa-toggle', { method: 'POST', body: JSON.stringify({ code }) });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function fetchMe(): Promise<{ email: string; role: string } | null> {
  try {
    return await apiFetch('/auth/me');
  } catch {
    return null;
  }
}

// ---- Admin: applications ----

const STATUS_MAP: Record<string, ApplicationStatus> = {
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const STATUS_MAP_REVERSE: Record<string, string> = {
  'Under Review': 'UNDER_REVIEW',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
};

function mapDbAppToFrontend(row: any): MerchantApplication {
  return {
    id: row.id,
    appId: row.appId,
    status: STATUS_MAP[row.status] || 'Under Review',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    submittedAt: row.createdAt,
    customerDetails: {
      nrsCustomer: row.nrsCustomer,
      elmerNumber: row.elmerNumber || '',
      nrsPayMid: row.nrsPayMid || '',
    },
    businessInfo: {
      legalName: row.legalName,
      dba: row.dba,
      entityType: row.entityType,
      dateStarted: row.dateStarted,
      stateOfIncorporation: row.stateOfIncorporation,
      federalTaxId: row.federalTaxId,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
      country: row.country,
      businessTel: row.businessTel || '',
      email: row.email,
    },
    owners: row.owners,
  };
}

export async function fetchApplications(): Promise<MerchantApplication[]> {
  const rows = await apiFetch('/applications');
  return rows.map(mapDbAppToFrontend);
}

export async function fetchApplicationDetail(id: string): Promise<MerchantApplication> {
  const row = await apiFetch(`/applications/${id}`);
  return mapDbAppToFrontend(row);
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
  await apiFetch(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: STATUS_MAP_REVERSE[status] }),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  await apiFetch(`/applications/${id}`, { method: 'DELETE' });
}
