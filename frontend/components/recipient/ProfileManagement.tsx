'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, Building, Edit2, Save, X, Globe, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export function ProfileManagement() {
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    organization_name: user?.organization_name || '',
    hospital_name: user?.hospital_name || '',
    contact_person: user?.contact_person || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    website_url: user?.website_url || '',
    description: user?.description || '',
    registration_number: user?.registration_number || '',
    cci_registration_number: user?.cci_registration_number || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        organization_name: user.organization_name || '',
        hospital_name: user.hospital_name || '',
        contact_person: user.contact_person || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        website_url: user.website_url || '',
        description: user.description || '',
        registration_number: user.registration_number || '',
        cci_registration_number: user.cci_registration_number || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-8 text-center">
        <User className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
        await api.patch('/auth/profile/update/', formData);
        await checkAuth();
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
        setSaveError('Failed to update profile. Please try again.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || '',
      organization_name: user.organization_name || '',
      hospital_name: user.hospital_name || '',
      contact_person: user.contact_person || '',
      email: user.email,
      phone_number: user.phone_number || '',
      address: user.address || '',
      website_url: user.website_url || '',
      description: user.description || '',
      registration_number: user.registration_number || '',
      cci_registration_number: user.cci_registration_number || '',
    });
    setIsEditing(false);
  };

  const isHospital = user.role === 'GOVERNMENT_HOSPITAL';
  const isOrg = ['NGO', 'ORPHANAGE', 'OLD_AGE_HOME'].includes(user.role);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile Management</h3>
          <p className="text-xs text-muted-foreground">
            Manage your personal information and organization details
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-smooth hover:border-primary hover:bg-primary hover:text-primary-foreground hover-lift"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-white px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition-smooth hover:bg-muted hover-lift disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-smooth hover:bg-primary/90 hover-lift disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        {/* Feedback Messages */}
        {saveError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Profile updated successfully!
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary overflow-hidden">
              {user.profile_image && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profile_image}
                  alt={user.full_name || user.organization_name || 'Profile'}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                (user.organization_name || user.hospital_name || user.username || user.full_name || '?').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold">{user.organization_name || user.hospital_name || user.username || user.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            
            {/* Conditional Name Field */}
            {isHospital ? (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Building className="h-3.5 w-3.5" /> Hospital Name

                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.hospital_name}
                            onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    ) : (
                        <p className="text-sm font-medium">{user.hospital_name}</p>
                    )}
                </div>
            ) : isOrg ? (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Building className="h-3.5 w-3.5" /> Organization Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.organization_name}
                            onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    ) : (
                        <p className="text-sm font-medium">{user.organization_name}</p>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <User className="h-3.5 w-3.5" /> Full Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    ) : (
                        <p className="text-sm font-medium">{user.full_name}</p>
                    )}
                </div>
            )}

            {(isHospital || isOrg) && (
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <User className="h-3.5 w-3.5" /> Contact Person
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.contact_person}
                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    ) : (
                        <p className="text-sm font-medium">{user.contact_person || 'Not provided'}</p>
                    )}
                </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {isHospital ? 'Official Email' : 'Email Address'}
              </label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-sm font-medium">{user.phone_number || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Building className="h-3.5 w-3.5" /> Primary Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                  />
                ) : (
                  <p className="text-sm font-medium">{user.address || 'Not provided'}</p>
                )}
            </div>

            {(isHospital || isOrg) && (
                <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" /> Website
                    </label>
                    {isEditing ? (
                        <input
                            type="url"
                            value={formData.website_url}
                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    ) : (
                        <p className="text-sm font-medium text-primary hover:underline">{user.website_url || 'Not provided'}</p>
                    )}
                </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Member since {user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
