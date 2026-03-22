"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types/user";
import { RECEIVER_ROLES } from "@/types/user";
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Hash,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

// Only DONOR is the single donor type
const DONOR_ROLE_OPTIONS = [
  { id: 'DONOR', label: 'Food Donor' },
];

const RECEIVER_ROLE_OPTIONS = [
  { id: 'NGO', label: 'NGO' },
  { id: 'ORPHANAGE', label: 'Orphanage' },
  { id: 'OLD_AGE_HOME', label: 'Old Age Home' },
  { id: 'GOVERNMENT_HOSPITAL', label: 'Government Hospital' },
];

// Returns the registration number field name and label for receiver roles
function getRegField(role: string) {
  if (role === 'NGO') return { field: 'registration_number', label: 'NGO Registration Number' };
  if (role === 'ORPHANAGE') return { field: 'cci_registration_number', label: 'CCI Registration Number' };
  if (role === 'OLD_AGE_HOME') return { field: 'registration_number', label: 'Registration Number' };
  if (role === 'GOVERNMENT_HOSPITAL') return { field: 'hospital_registration_number', label: 'Hospital Registration Number' };
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [officialEmail, setOfficialEmail] = useState(""); // For hospitals
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [role, setRole] = useState<UserRole>("DONOR");
  const [error, setError] = useState<string | null>(null);
  // Track which group is expanded: 'donor' | 'receiver'
  const [group, setGroup] = useState<'donor' | 'receiver'>('donor');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const payload: any = {
        email: role === 'GOVERNMENT_HOSPITAL' ? officialEmail || email : email,
        password,
        role,
      };

      // Add role-specific registration number fields
      const regField = getRegField(role);
      if (regField) {
        payload[regField.field] = registrationNumber;
      }
      // Hospital-specific: also send official_email explicitly
      if (role === 'GOVERNMENT_HOSPITAL') {
        payload.official_email = officialEmail || email;
      }

      await login(payload);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.message) {
        setError(data.message);
      } else if (data?.errors?.detail) {
        setError(data.errors.detail);
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError("Invalid credentials. Please check your details and try again.");
      }
    }
  }

  const isReceiver = RECEIVER_ROLES.includes(role as any);
  const regField = getRegField(role);

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Grouped role selector — Donors vs Receivers */}
        <div className="space-y-2">
          {/* Donor group */}
          <button
            type="button"
            onClick={() => setGroup('donor')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              group === 'donor'
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-muted/30 border-input text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span>🍽️ I want to donate food</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${group === 'donor' ? 'rotate-180' : ''}`} />
          </button>
          {group === 'donor' && (
            <div className="grid grid-cols-1 gap-2 pt-1 pl-1">
              {DONOR_ROLE_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setRole(r.id as UserRole); setRegistrationNumber(""); }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                    role === r.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-card border border-input text-muted-foreground hover:border-orange-300 hover:text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Receiver group */}
          <button
            type="button"
            onClick={() => setGroup('receiver')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              group === 'receiver'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-muted/30 border-input text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span>🏥 I need food for my organization</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${group === 'receiver' ? 'rotate-180' : ''}`} />
          </button>
          {group === 'receiver' && (
            <div className="grid grid-cols-2 gap-2 pt-1 pl-1">
              {RECEIVER_ROLE_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setRole(r.id as UserRole); setRegistrationNumber(""); }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                    role === r.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-card border border-input text-muted-foreground hover:border-blue-300 hover:text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Registration number for receiver roles */}
        {isReceiver && regField && (
          <div className="space-y-1.5 animate-slide-in">
            <label className="text-xs font-semibold text-foreground/80 ml-1">
              {regField.label} <span className="text-destructive">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                <Hash className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="block w-full rounded-xl border border-input bg-muted/30 pl-10 pr-4 py-3 text-sm shadow-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 outline-none"
                placeholder={regField.label}
              />
            </div>
          </div>
        )}

        {/* Email / Official Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-foreground/80 ml-1">
            {role === 'GOVERNMENT_HOSPITAL' ? 'Official Email Address' : 'Email Address'}
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={role === 'GOVERNMENT_HOSPITAL' ? officialEmail : email}
              onChange={(e) =>
                role === 'GOVERNMENT_HOSPITAL'
                  ? setOfficialEmail(e.target.value)
                  : setEmail(e.target.value)
              }
              className="block w-full rounded-xl border border-input bg-muted/30 pl-10 pr-4 py-3 text-sm shadow-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 outline-none"
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Password with show/hide toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="password" className="text-xs font-semibold text-foreground/80">
              Password
            </label>
            <Link href="/forgot-password" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-input bg-muted/30 pl-10 pr-10 py-3 text-sm shadow-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2 text-destructive animate-slide-in">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : `Log in as ${role.replace(/_/g, ' ')}`}
          {!isLoading && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Don&apos;t have an account?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link href="/register" className="text-sm font-medium text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
