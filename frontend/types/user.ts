// FIXED: All 10 roles as per spec (6 donor + 4 receiver)
export type DonorRole = 'DONOR' | 'HOTEL' | 'CAFE' | 'RESTAURANT' | 'CANTEEN' | 'CATERING_SERVICE';
export type ReceiverRole = 'NGO' | 'ORPHANAGE' | 'OLD_AGE_HOME' | 'GOVERNMENT_HOSPITAL';
export type UserRole = DonorRole | ReceiverRole;

export const DONOR_ROLES: DonorRole[] = ['DONOR', 'HOTEL', 'CAFE', 'RESTAURANT', 'CANTEEN', 'CATERING_SERVICE'];
export const RECEIVER_ROLES: ReceiverRole[] = ['NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'GOVERNMENT_HOSPITAL'];

export function isDonorRole(role: string): role is DonorRole {
  return DONOR_ROLES.includes(role as DonorRole);
}

export function isReceiverRole(role: string): role is ReceiverRole {
  return RECEIVER_ROLES.includes(role as ReceiverRole);
}

export interface User {
  id: string;
  role: UserRole;
  email: string;
  phone_number?: string;
  // FIXED: added username and verification_status
  username?: string;
  full_name?: string;
  profile_image?: string;
  // FIXED: added official_email for hospitals
  official_email?: string;
  // Org fields
  organization_name?: string;
  hospital_name?: string;
  contact_person?: string;
  // Registration
  registration_number?: string;
  cci_registration_number?: string;
  hospital_registration_number?: string;
  registration_type?: string;
  government_license_number?: string;
  social_welfare_license_number?: string;
  pan_number?: string;
  darpan_id?: string;
  registration_certificate_url?: string;
  // Departments
  child_welfare_department?: string;
  government_department?: string;
  hospital_type?: string;
  // Capacity
  capacity_people_served?: number;
  capacity_children_supported?: number;
  capacity_residents_supported?: number;
  number_of_beds?: number;
  // Address
  address?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  // Org metadata
  website_url?: string;
  description?: string;
  // FIXED: critical field for receiver gating
  verification_status?: 'pending' | 'approved' | 'rejected';
  date_joined?: string;
}
