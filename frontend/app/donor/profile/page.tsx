'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

export default function DonorProfilePage() {
  const { user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    // category: 'Bakery' // Not in backend yet, keeping UI but not saving for now or saving in separate field if needed. 
    // Actually, let's just use what we have in backend: full_name, email, phone_number, address.
  });

  useEffect(() => {
    if (user) {
        setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            address: user.address || '',
        });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.patch('/auth/profile/update/', {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
      });
      // Refresh user data in store
      await checkAuth();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
      return (
          <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Update your business information and contact details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8">
        {/* Business Info */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
          <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b">
            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
              <Building className="h-4 w-4 text-orange-600" />
              Business Information
            </h3>
            <p className="text-sm text-muted-foreground">
              Public details visible to recipients.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Business Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Category</label>
                <select 
                    disabled
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 opacity-50 cursor-not-allowed"
                >
                  <option>Bakery</option>
                  <option>Restaurant</option>
                  <option>Supermarket</option>
                </select>
                <p className="text-xs text-muted-foreground">Category cannot be changed yet.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-9 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
           <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b">
             <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
               <Phone className="h-4 w-4 text-orange-600" />
               Contact Details
             </h3>
             <p className="text-sm text-muted-foreground">
               Used for notifications and coordination.
             </p>
           </div>
           <div className="p-6 space-y-6">
             <div className="grid gap-6 md:grid-cols-2">
               <div className="space-y-2">
                 <label className="text-sm font-medium leading-none">Email Address</label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <input 
                    name="email"
                    value={formData.email}
                    disabled
                    className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 opacity-50 cursor-not-allowed" 
                   />
                 </div>
                 <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium leading-none">Phone Number</label>
                 <div className="relative">
                   <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <input 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                   />
                 </div>
               </div>
             </div>
           </div>
           
           <div className="flex items-center p-6 pt-0">
             <button 
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-8 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 active:scale-95 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isLoading ? (
                   <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                   </>
               ) : (
                   <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                   </>
               )}
             </button>
           </div>
        </div>
      </form>
    </div>
  );
}
