'use client';

import { useState, useEffect } from 'react';
import { Upload, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { donorApi } from '@/lib/donor';
import { useAuthStore } from '@/store/useAuthStore';

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    food_type: 'Bakery',
    quantity: '',
    expiry_date: '',
    description: '',
    pickup_address: '',
    pickup_start: '',
    pickup_end: '',
    pickup_instructions: ''
  });

  useEffect(() => {
    const fetchListing = async () => {
        try {
            const data = await donorApi.getListingById(params.id);
            
            // Parse description to extract pickup details if possible, or just load it raw
            // For now, we load it raw into description, but if we followed a strict format we could parse headers.
            // Simplicity: just load into description. User can edit it.
            
            setFormData({
                title: data.title,
                food_type: data.food_type,
                quantity: data.quantity,
                expiry_date: new Date(data.expiry_date).toISOString().slice(0, 16), // Format for datetime-local
                description: data.description,
                pickup_address: data.pickup_address,
                pickup_start: '', // Hard to extract without strict parsing, leave empty or user edits description
                pickup_end: '',
                pickup_instructions: ''
            });
        } catch (error) {
            console.error('Failed to fetch listing', error);
            alert('Failed to load listing');
            router.push('/donor/listings');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (user) {
        fetchListing();
    }
  }, [params.id, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await donorApi.updateListing(params.id, {
        title: formData.title,
        food_type: formData.food_type,
        quantity: formData.quantity,
        expiry_date: new Date(formData.expiry_date).toISOString(),
        pickup_address: formData.pickup_address,
        description: formData.description,
      });

      router.push('/donor/listings');
      router.refresh();
    } catch (error) {
      console.error('Failed to update listing:', error);
      alert('Failed to update listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
      return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Food Listing</h1>
        <p className="text-muted-foreground">
          Update the details of your donation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Title
            </label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Category
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
              Quantity
            </label>
            <input 
              required
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Expiry Date
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
            Description & Instructions
          </label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Pickup Details */}
        <div className="rounded-xl bg-muted/50 p-6 space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Pickup Details
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Pickup Address
            </label>
            <input 
              required
              name="pickup_address"
              value={formData.pickup_address}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-8 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Update Listing' : 'Update Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
