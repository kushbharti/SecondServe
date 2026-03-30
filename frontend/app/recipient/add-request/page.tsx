'use client';

import { useState } from 'react';
import { Upload, X, Clock, MapPin, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { recipientApi } from '@/lib/recipient';
import { useAuthStore } from '@/store/useAuthStore';

export default function AddRequestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    food_type: 'Produce',
    quantity: '',
    expiry_date: '',
    description: '',
    pickup_address: user?.address || '',
    pickup_start: '',
    pickup_end: '',
    pickup_instructions: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullDescription = `Title: ${formData.title}\n\n${formData.description}\n\nDelivery/Drop-off Instructions: ${formData.pickup_instructions}\nPreferred Time: ${formData.pickup_start} - ${formData.pickup_end}`;

      const payload = {
        food_type_needed: formData.food_type,
        quantity_needed: formData.quantity,
        required_by: new Date(formData.expiry_date).toISOString(),
        message: fullDescription,
      };

      await recipientApi.createRequest(payload);

      router.push('/recipient/requests');
      router.refresh();
    } catch (error) {
      console.error('Failed to create request:', error);
      alert('Failed to create request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const role = user?.role || 'NGO';
  const roleLabels: Record<string, string> = {
      NGO: 'NGO',
      ORPHANAGE: 'Orphanage',
      OLD_AGE_HOME: 'Old Age Home',
      GOVERNMENT_HOSPITAL: 'Hospital'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{roleLabels[role] || 'Recipient'} Food Request</h1>
        <p className="text-muted-foreground">
          {role === 'GOVERNMENT_HOSPITAL' 
            ? 'Coordinate patient and staff meal requirements. Please specify dietary constraints if any.'
            : 'Let donors know what your organization needs. Please be specific about food types and quantities.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Request Title
            </label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={role === 'GOVERNMENT_HOSPITAL' ? 'e.g. Diabetic Meals for 20 Patients' : 'e.g. Needed: 50 Rice Bags for Shelter'}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Category constraint
            </label>
            <select 
              name="food_type"
              value={formData.food_type}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option>Bakery</option>
              <option>Produce</option>
              <option>Meals</option>
              <option>Dairy</option>
              <option>Canned Goods</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Quantity / Expected Amount
            </label>
            <input 
              required
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. 50 kg, 100 servings"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Needed By (Expiry / Deadline)
            </label>
            <input 
              required
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              type="datetime-local"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Description
          </label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Describe the urgency and purpose of your request..."
          />
        </div>

        {/* Drop-off Details */}
        <div className="rounded-xl bg-muted/50 p-6 space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Drop-off / Fulfillment Details
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Location
            </label>
            <input 
              required
              name="pickup_address"
              value={formData.pickup_address}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Full address for delivery"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
             <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                   Preferred Time Start
                </label>
                <div className="relative">
                   <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <input 
                    type="time" 
                    name="pickup_start"
                    value={formData.pickup_start}
                    onChange={handleChange}
                    className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                   />
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                   Preferred Time End
                </label>
                <div className="relative">
                   <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <input 
                    type="time" 
                    name="pickup_end"
                    value={formData.pickup_end}
                    onChange={handleChange}
                    className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                   />
                </div>
             </div>
          </div>
          
           <div className="space-y-2">
               <label className="text-sm font-medium leading-none">
                  Delivery/Drop-off Instructions
               </label>
               <input 
                 name="pickup_instructions"
                 value={formData.pickup_instructions}
                 onChange={handleChange}
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                 placeholder="e.g. Come to front desk"
               />
            </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
