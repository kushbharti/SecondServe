'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types/user';
import { DONOR_ROLES, RECEIVER_ROLES } from '@/types/user';
import {
  Mail, Lock, User, AlertCircle, ArrowRight, Phone,
  Building, CheckCircle2, Heart, Home, PlusSquare,
  UtensilsCrossed, Coffee, ChefHat,
} from 'lucide-react';

// ============================================================
// Role metadata
// ============================================================
const DONOR_ROLE_OPTIONS = [
  { id: 'DONOR',            label: 'Individual Donor',   icon: User,           color: 'text-orange-500', desc: 'Personal donor' },
  { id: 'HOTEL',            label: 'Hotel',              icon: Building,       color: 'text-amber-500',  desc: 'Hospitality' },
  { id: 'CAFE',             label: 'Cafe',               icon: Coffee,         color: 'text-yellow-600', desc: 'Coffee & food' },
  { id: 'RESTAURANT',       label: 'Restaurant',         icon: UtensilsCrossed, color: 'text-red-500',   desc: 'Dining' },
  { id: 'CANTEEN',          label: 'Canteen',            icon: ChefHat,        color: 'text-green-600',  desc: 'Institutional' },
  { id: 'CATERING_SERVICE', label: 'Catering Service',   icon: ChefHat,        color: 'text-teal-600',   desc: 'Events' },
];

const RECEIVER_ROLE_OPTIONS = [
  { id: 'NGO',                 label: 'NGO',                 icon: Heart,       color: 'text-blue-500',   desc: 'Organization' },
  { id: 'ORPHANAGE',           label: 'Orphanage',           icon: Home,        color: 'text-orange-500', desc: 'Child welfare' },
  { id: 'OLD_AGE_HOME',        label: 'Old Age Home',        icon: Building,    color: 'text-purple-500', desc: 'Senior care' },
  { id: 'GOVERNMENT_HOSPITAL', label: 'Govt Hospital',       icon: PlusSquare,  color: 'text-red-500',    desc: 'Healthcare' },
];

// ============================================================
// Field helper
// ============================================================
const renderField = (
  name: string,
  label: string,
  type: string = 'text',
  required: boolean = true,
  formData: any,
  handleChange: any,
) => (
  <div className="space-y-1.5" key={name}>
    <label className="text-xs font-semibold text-foreground/80 ml-1">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      value={formData[name] ?? ''}
      onChange={handleChange}
      className="block w-full rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm shadow-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 outline-none"
    />
  </div>
);

// ============================================================
// Component
// ============================================================
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('DONOR');
  const [error, setError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', phone_number: '',
    // Donor-specific — FIXED: username added
    username: '',
    // Org fields
    organization_name: '', hospital_name: '', contact_person: '',
    // Registration
    registration_number: '', cci_registration_number: '', hospital_registration_number: '',
    registration_type: '', government_license_number: '', social_welfare_license_number: '',
    pan_number: '', darpan_id: '', registration_certificate_url: '',
    // Departments
    child_welfare_department: '', government_department: '', hospital_type: '',
    // Capacity
    capacity_people_served: '', capacity_children_supported: '',
    capacity_residents_supported: '', number_of_beds: '',
    // Address
    address_line1: '', address_line2: '', city: '', district: '', state: '', pincode: '',
    // Other
    website_url: '', description: '',
    // Hospital
    official_email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isDonor = DONOR_ROLES.includes(role as any);
  const isReceiver = RECEIVER_ROLES.includes(role as any);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);

    try {
      // Build payload based on role
      const payload: any = {
        role,
        email: role === 'GOVERNMENT_HOSPITAL'
          ? (formData.official_email || formData.email)
          : formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        phone_number: formData.phone_number,
        address_line1: formData.address_line1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      if (isDonor) {
        // FIXED: all donor types use username field
        payload.username = formData.username;
        payload.full_name = formData.username; // sync for display compatibility
      }

      if (role === 'NGO') {
        Object.assign(payload, {
          organization_name: formData.organization_name,
          contact_person: formData.contact_person,
          registration_number: formData.registration_number,
          registration_type: formData.registration_type,
          darpan_id: formData.darpan_id,
          pan_number: formData.pan_number,
          registration_certificate_url: formData.registration_certificate_url,
          address_line2: formData.address_line2,
          district: formData.district,
          capacity_people_served: parseInt(formData.capacity_people_served, 10) || null,
          website_url: formData.website_url,
          description: formData.description,
        });
      } else if (role === 'ORPHANAGE') {
        Object.assign(payload, {
          organization_name: formData.organization_name,
          contact_person: formData.contact_person,
          cci_registration_number: formData.cci_registration_number,
          government_license_number: formData.government_license_number,
          pan_number: formData.pan_number,
          registration_certificate_url: formData.registration_certificate_url,
          child_welfare_department: formData.child_welfare_department,
          capacity_children_supported: parseInt(formData.capacity_children_supported, 10) || null,
          address_line2: formData.address_line2,
          district: formData.district,
          description: formData.description,
        });
      } else if (role === 'OLD_AGE_HOME') {
        Object.assign(payload, {
          organization_name: formData.organization_name,
          contact_person: formData.contact_person,
          registration_number: formData.registration_number,
          social_welfare_license_number: formData.social_welfare_license_number,
          pan_number: formData.pan_number,
          registration_certificate_url: formData.registration_certificate_url,
          capacity_residents_supported: parseInt(formData.capacity_residents_supported, 10) || null,
          address_line2: formData.address_line2,
          district: formData.district,
          description: formData.description,
        });
      } else if (role === 'GOVERNMENT_HOSPITAL') {
        // FIXED: hospital_name maps to organization_name; official_email as email
        Object.assign(payload, {
          organization_name: formData.hospital_name || formData.organization_name,
          hospital_name: formData.hospital_name,
          contact_person: formData.contact_person,
          hospital_registration_number: formData.hospital_registration_number,
          government_department: formData.government_department,
          hospital_type: formData.hospital_type,
          number_of_beds: parseInt(formData.number_of_beds, 10) || null,
          official_email: formData.official_email || formData.email,
          district: formData.district,
          website_url: formData.website_url,
        });
      }

      const result = await register(payload);

      if (result?.pending) {
        // FIXED: Receiver — show pending message, don't redirect to dashboard
        setPendingMessage(
          result.message ||
          'Registration successful! Your account is pending admin approval. You will be notified once approved.'
        );
      } else {
        // Donor — auto-approved, useAuthStore already redirected to dashboard
      }
    } catch (err: any) {
      // FIXED: unified response format
      const data = err.response?.data;
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError)) {
          setError(firstError[0] as string);
        } else {
          setError((firstError as string) || data.message || "Registration failed.");
        }
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  // ============================================================
  // Pending approval state
  // ============================================================
  if (pendingMessage) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Registration Submitted!</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{pendingMessage}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left">
          <p className="text-xs font-semibold text-amber-800">What happens next?</p>
          <ul className="mt-2 space-y-1 text-xs text-amber-700 list-disc list-inside">
            <li>An admin will review your registration documents</li>
            <li>You will receive an email when your account is approved</li>
            <li>Once approved, you can log in and start requesting food</li>
          </ul>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
        >
          Back to Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // ============================================================
  // Step 1 — Role selection
  // ============================================================
  const step1Content = (
    <form onSubmit={handleNext} className="space-y-6 animate-fade-in">
      {/* Donor group */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-orange-500">🍽️</span> I want to donate food
        </legend>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
          {DONOR_ROLE_OPTIONS.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as UserRole)}
                className={`group relative flex flex-col items-center text-center rounded-2xl border-2 p-4 transition-all duration-300 ${
                  role === r.id
                    ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-400/20 scale-[1.02] shadow-md'
                    : 'border-muted bg-card/50 hover:scale-[1.02] hover:border-border'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${role === r.id ? 'bg-orange-100' : 'bg-muted'}`}>
                  <Icon className={`h-4 w-4 ${role === r.id ? r.color : 'text-muted-foreground'}`} />
                </div>
                <span className="text-xs font-bold text-foreground">{r.label}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</span>
                {role === r.id && (
                  <div className={`absolute top-1.5 right-1.5 ${r.color}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Receiver group */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-blue-500">🏥</span> My organization needs food
        </legend>
        <div className="grid gap-2 grid-cols-2">
          {RECEIVER_ROLE_OPTIONS.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as UserRole)}
                className={`group relative flex flex-col items-center text-center rounded-2xl border-2 p-4 transition-all duration-300 ${
                  role === r.id
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400/20 scale-[1.02] shadow-md'
                    : 'border-muted bg-card/50 hover:scale-[1.02] hover:border-border'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${role === r.id ? 'bg-blue-100' : 'bg-muted'}`}>
                  <Icon className={`h-4 w-4 ${role === r.id ? r.color : 'text-muted-foreground'}`} />
                </div>
                <span className="text-xs font-bold text-foreground">{r.label}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</span>
                {role === r.id && (
                  <div className={`absolute top-1.5 right-1.5 ${r.color}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {isReceiver && (
          <p className="text-[11px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
            ℹ️ Receiver accounts require admin approval before you can log in.
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
      >
        Continue as {role.replace(/_/g, ' ')}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );

  // ============================================================
  // Step 2 — Registration form
  // ============================================================
  const step2Content = (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-in">
      <div className="grid gap-4 md:grid-cols-2">

        {/* Donor fields */}
        {isDonor && renderField('username', 'Username', 'text', true, formData, handleChange)}
        {role === 'NGO' && renderField('organization_name', 'Organization Name', 'text', true, formData, handleChange)}
        {role === 'ORPHANAGE' && renderField('organization_name', 'Organization Name', 'text', true, formData, handleChange)}
        {role === 'OLD_AGE_HOME' && renderField('organization_name', 'Organization Name', 'text', true, formData, handleChange)}
        {role === 'GOVERNMENT_HOSPITAL' && renderField('hospital_name', 'Hospital Name', 'text', true, formData, handleChange)}

        {/* Email */}
        {role === 'GOVERNMENT_HOSPITAL'
          ? renderField('official_email', 'Official Email Address', 'email', true, formData, handleChange)
          : renderField('email', 'Email Address', 'email', true, formData, handleChange)
        }

        {/* Contact person for orgs */}
        {isReceiver && renderField('contact_person', 'Contact Person', 'text', true, formData, handleChange)}

        {renderField('phone_number', 'Phone Number', 'tel', true, formData, handleChange)}

        {/* NGO specific */}
        {role === 'NGO' && (<>
          {renderField('registration_number', 'Registration Number', 'text', true, formData, handleChange)}
          {renderField('registration_type', 'Registration Type', 'text', true, formData, handleChange)}
          {renderField('darpan_id', 'Darpan ID', 'text', false, formData, handleChange)}
          {renderField('pan_number', 'PAN Number', 'text', true, formData, handleChange)}
          {renderField('registration_certificate_url', 'Registration Certificate URL', 'url', true, formData, handleChange)}
          {renderField('capacity_people_served', 'Capacity (People Served)', 'number', true, formData, handleChange)}
          {renderField('website_url', 'Website URL', 'url', false, formData, handleChange)}
        </>)}

        {/* Orphanage specific */}
        {role === 'ORPHANAGE' && (<>
          {renderField('cci_registration_number', 'CCI Registration Number', 'text', true, formData, handleChange)}
          {renderField('government_license_number', 'Government License Number', 'text', true, formData, handleChange)}
          {renderField('pan_number', 'PAN Number', 'text', true, formData, handleChange)}
          {renderField('child_welfare_department', 'Child Welfare Department', 'text', true, formData, handleChange)}
          {renderField('registration_certificate_url', 'Registration Certificate URL', 'url', true, formData, handleChange)}
          {renderField('capacity_children_supported', 'Capacity (Children Supported)', 'number', true, formData, handleChange)}
        </>)}

        {/* Old Age Home specific */}
        {role === 'OLD_AGE_HOME' && (<>
          {renderField('registration_number', 'Registration Number', 'text', true, formData, handleChange)}
          {renderField('social_welfare_license_number', 'Social Welfare License Number', 'text', true, formData, handleChange)}
          {renderField('pan_number', 'PAN Number', 'text', true, formData, handleChange)}
          {renderField('registration_certificate_url', 'Registration Certificate URL', 'url', true, formData, handleChange)}
          {renderField('capacity_residents_supported', 'Capacity (Residents Supported)', 'number', true, formData, handleChange)}
        </>)}

        {/* Hospital specific */}
        {role === 'GOVERNMENT_HOSPITAL' && (<>
          {renderField('hospital_registration_number', 'Hospital Registration Number', 'text', true, formData, handleChange)}
          {renderField('government_department', 'Government Department', 'text', true, formData, handleChange)}
          {renderField('hospital_type', 'Hospital Type', 'text', true, formData, handleChange)}
          {renderField('number_of_beds', 'Number of Beds', 'number', true, formData, handleChange)}
          {renderField('website_url', 'Website URL', 'url', false, formData, handleChange)}
        </>)}

        {/* Address */}
        <div className="col-span-1 md:col-span-2 mt-2">
          <h4 className="text-sm font-semibold border-b pb-2">Address Details</h4>
        </div>
        {renderField('address_line1', 'Address Line 1', 'text', true, formData, handleChange)}
        {isReceiver && renderField('address_line2', 'Address Line 2', 'text', false, formData, handleChange)}
        {renderField('city', 'City', 'text', true, formData, handleChange)}
        {isReceiver && renderField('district', 'District', 'text', true, formData, handleChange)}
        {renderField('state', 'State', 'text', true, formData, handleChange)}
        {renderField('pincode', 'Pincode', 'text', true, formData, handleChange)}
      </div>

      {/* Description for orgs */}
      {(role === 'NGO' || role === 'ORPHANAGE' || role === 'OLD_AGE_HOME') && (
        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-semibold text-foreground/80 ml-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="block w-full min-h-[80px] rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm shadow-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 outline-none"
          />
        </div>
      )}

      {/* Password fields */}
      <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t">
        {renderField('password', 'Password', 'password', true, formData, handleChange)}
        {renderField('confirmPassword', 'Confirm Password', 'password', true, formData, handleChange)}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Password must be at least 8 characters with one uppercase, one number, and one special character.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2 text-destructive animate-slide-in">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-muted-foreground transition-all hover:bg-muted/80"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Complete Registration"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 rounded-full bg-primary" />
          <div className={`h-1 w-16 rounded-full ${step === 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Step {step} of 2 · {step === 1 ? 'Choose your role' : `Register as ${role.replace(/_/g, ' ')}`}
        </p>
      </div>

      {step === 1 ? step1Content : step2Content}

      {step === 1 && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
            </div>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Log in here
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
