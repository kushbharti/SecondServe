'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Loader2, Camera, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

export default function DonorProfilePage() {
  const { user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone_number: '',
    address: '',
    aadhar_number: '',
    pan_number: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        await checkAuth();
      } catch {
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        aadhar_number: user.aadhar_number || '',
        pan_number: user.pan_number || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch('/auth/profile/update/', {
        username: formData.username,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        address: formData.address,
        aadhar_number: formData.aadhar_number,
        pan_number: formData.pan_number,
      });
      await checkAuth();
      setSuccess('Profile updated successfully!');
    } catch {
      setError('Failed to update profile. Please check your inputs and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Derive display name: prefer username, then full_name, then email
  const displayName = user?.username || user?.full_name || user?.email || 'Donor';
  const initials = displayName.slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading profile…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
        <User className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Unable to load profile. Please refresh or log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account details and contact information.</p>
      </div>

      {/* Profile Hero Card */}
      <div className="rounded-2xl border bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 flex items-center gap-6">
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-full ring-4 ring-orange-200 dark:ring-orange-800 overflow-hidden bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            {user.profile_image && !imgError ? (
              <img
                src={user.profile_image}
                alt={displayName}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-300">{initials}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-orange-600 flex items-center justify-center shadow-md">
            <Camera className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-foreground truncate">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 px-3 py-1 text-xs font-semibold capitalize">
              <ShieldCheck className="h-3 w-3" />
              {user.role}
            </span>
            {user.verification_status && (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                user.verification_status === 'approved'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300'
              }`}>
                {user.verification_status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-5 py-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 px-5 py-4 text-sm text-green-700 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="grid gap-6">

        {/* Account Info Card */}
        <div className="rounded-xl border bg-card shadow-xs">
          <div className="flex items-center gap-2 p-6 pb-4 border-b">
            <User className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold">Account Information</h3>
          </div>
          <div className="p-6 grid gap-5 md:grid-cols-2">

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full / Business Name</label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your name or business name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Email — read only */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Address
              </label>
              <input
                value={user.email}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            {/* Role — read only */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <input
                value={user.role}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed capitalize"
              />
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="rounded-xl border bg-card shadow-xs">
          <div className="flex items-center gap-2 p-6 pb-4 border-b">
            <Phone className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold">Contact Details</h3>
          </div>
          <div className="p-6 grid gap-5 md:grid-cols-2">

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Aadhar Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aadhar Card Number</label>
              <input
                name="aadhar_number"
                value={formData.aadhar_number}
                onChange={handleChange}
                maxLength={12}
                placeholder="12 digit Aadhar"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            {/* PAN Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Card Number</label>
              <input
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                maxLength={10}
                placeholder="ABCDE1234F"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-uppercase uppercase"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
