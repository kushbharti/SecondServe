"use client";

import { useState } from "react";
import { Upload, X, Clock, MapPin, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { donorPostsApi } from "@/lib/donor";
import { useAuthStore } from "@/store/useAuthStore";

export default function AddListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    food_name: "",
    food_type: "veg",
    quantity: "" as string,
    expiry_time: "",
    description: "",
    pickup_address: user?.address || "",
    pickup_start: "",
    pickup_end: "",
    pickup_instructions: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear quantity error when the user starts typing
    if (name === "quantity") setQuantityError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate quantity
    const qty = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(qty) || qty < 10) {
      setQuantityError("Quantity must be at least 10.");
      return;
    }
    setQuantityError(null);
    setIsSubmitting(true);

    try {
      const fullDescription = `${formData.description}\n\nPickup Instructions: ${formData.pickup_instructions}\nPickup Time: ${formData.pickup_start} - ${formData.pickup_end}`;

      const submitData = new FormData();
      submitData.append("food_name", formData.food_name);
      submitData.append("food_type", formData.food_type);
      submitData.append("quantity", String(qty));
      submitData.append(
        "expiry_time",
        new Date(formData.expiry_time).toISOString(),
      );
      submitData.append("pickup_address", formData.pickup_address);
      submitData.append("description", fullDescription);

      if (image) {
        submitData.append("image", image);
      }

      await donorPostsApi.createPost(submitData);

      router.push("/donor/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Failed to create listing:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Add Food Listing</h1>
        <p className="text-muted-foreground">
          Share your surplus food with those in need. Please provide accurate
          details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload Area */}
        <div className="space-y-4">
          <label className="text-sm font-medium leading-none">Food Photo</label>
          <div className="relative group">
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all duration-300 ${imagePreview ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}`}
            >
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-xl shadow-lg ring-4 ring-background"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-3 -right-3 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex text-sm text-muted-foreground justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 focus-within:outline-none"
                      >
                        <span>Upload a photo</span>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground/60">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Food Name
            </label>
            <input
              required
              name="food_name"
              value={formData.food_name}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. 11 Loaves of Bread"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Category</label>
            <select
              name="food_type"
              value={formData.food_type}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Quantity{" "}
              <span className="text-muted-foreground font-normal">
                (minimum 10 servings/items)
              </span>
            </label>
            <input
              required
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min={10}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                quantityError
                  ? "border-red-400 focus-visible:ring-red-400"
                  : "border-input"
              }`}
              placeholder="e.g. 100"
            />
            {quantityError && (
              <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                <span>⚠</span> {quantityError}
              </p>
            )}
            {!quantityError &&
              formData.quantity &&
              parseInt(formData.quantity) >= 10 && (
                <p className="text-xs text-green-600">✓ Quantity looks good</p>
              )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Expiry Time
            </label>
            <input
              required
              name="expiry_time"
              value={formData.expiry_time}
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
            {isSubmitting ? "Publishing..." : "Publish Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
