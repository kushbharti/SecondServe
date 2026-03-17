'use client';

import { useState } from 'react';
import { Upload, X, Clock, MapPin, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { donorApi } from '@/lib/donor';
import { useAuthStore } from '@/store/useAuthStore';

export default function AddListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    food_type: 'Bakery',
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullDescription = `${formData.description}\n\nPickup Instructions: ${formData.pickup_instructions}\nPickup Time: ${formData.pickup_start} - ${formData.pickup_end}`;

      const data = new FormData();
      data.append('title', formData.title);
      data.append('food_type', formData.food_type);
      data.append('quantity', formData.quantity);
      data.append('expiry_date', new Date(formData.expiry_date).toISOString());
      data.append('pickup_address', formData.pickup_address);
      data.append('description', fullDescription);
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      await donorApi.createListing(data);

      router.push('/donor/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Add Food Listing</h1>
        <p className="text-muted-foreground">
          Share your surplus food with those in need. Please provide accurate details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Food Image
          </label>
          
          {imagePreview ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-8 hover:bg-muted/50 transition-colors text-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="p-3 bg-muted rounded-full">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 5MB)</p>
              </div>
            </div>
          )}
        </div>

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
              placeholder="e.g. 50 Loaves of Bread"
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
              Quantity (e.g. 10 kg, 50 meals)
            </label>
            <input 
              required
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. 10 kg"
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
            Description
          </label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Describe the condition, packaging, and any handling instructions..."
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
              placeholder="Full address for pickup"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
             <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                   Pickup Time Start
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
                   Pickup Time End
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
                  Pickup Instructions
               </label>
               <input 
                 name="pickup_instructions"
                 value={formData.pickup_instructions}
                 onChange={handleChange}
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                 placeholder="e.g. Go to the back dock, ask for Mike"
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
            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
