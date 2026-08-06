export type ApplicationStatus = 'Under Review' | 'Approved' | 'Rejected';

export interface CustomerDetails {
  nrsCustomer: 'yes' | 'no' | '';
  elmerNumber: string;
  nrsPayMid: string;
}

export interface BusinessInfo {
  legalName: string;
  dba: string;
  entityType: 'llc' | 'corp' | 'sole' | 'partnership' | 'nonprofit' | '';
  dateStarted: string;
  stateOfIncorporation: string;
  federalTaxId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessTel: string;
  email: string;
}

export interface OwnerInfo {
  id: string;
  name: string;
  title: string;
  ownershipPercent: string;
  lengthOfOwnership: string;
  dob: string;
  ssn: string;
  homeAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  homeTel: string;
  cell: string;
}

export interface MerchantApplication {
  id: string;
  appId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  customerDetails: CustomerDetails;
  businessInfo: BusinessInfo;
  owners: OwnerInfo[];
  notes?: string;
  submittedAt?: string;
}

export type PortalTab = 'form' | 'admin';
