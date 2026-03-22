/**
 * A robust fallback image generator based on food categories.
 * Uses consistent, high-quality images from Unsplash to ensure the UI looks excellent
 * even when donors haven't uploaded an image.
 */

export const FOOD_CATEGORY_IMAGES: Record<string, string[]> = {
  veg: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-149883716733f-a51e8125539d?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2680&auto=format&fit=crop',
  ],
  non_veg: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544025162-8e14620f4f9f?q=80&w=1920&auto=format&fit=crop',
  ],
  packaged: [
    'https://images.unsplash.com/photo-1621939514649-280e227092ed?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605807660233-149eb0b1686c?q=80&w=2112&auto=format&fit=crop',
  ],
  baked: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1972&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2080&auto=format&fit=crop',
  ],
  raw: [
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506484381280-12052dc66311?q=80&w=2080&auto=format&fit=crop',
  ],
  mixed: [
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
  ],
  other: [
    'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1965&auto=format&fit=crop',
  ]
};

/**
 * Returns a consistent fallback image based on the food type and ID (so the same item always gets the same image).
 */
export function getFallbackFoodImage(foodType: string = 'other', itemId: string | number = 0): string {
  const typeKey = foodType.toLowerCase();
  
  // Find matching category or fallback to 'mixed'
  const categoryImages = FOOD_CATEGORY_IMAGES[typeKey] || FOOD_CATEGORY_IMAGES['mixed'];
  
  // Create a simple deterministic hash from the ID
  const hash = String(itemId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Pick an image from the array
  const index = hash % categoryImages.length;
  
  return categoryImages[index];
}
