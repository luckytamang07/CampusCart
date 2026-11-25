import React, { useEffect, useState } from 'react';
import { ArrowLeft, Eye, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { CAMPUS_LOCATIONS, PRODUCT_IMAGES } from '../data/seedData';
import {
  CategorySlug,
  ContactPreference,
  ListingStatus,
  ProductCondition,
} from '../types/marketplace';
import { formatPrice } from '../utils/formatters';

export const SellProductPage: React.FC = () => {
  const {
    products,
    categories,
    editingProductId,
    currentUser,
    createListing,
    updateListing,
    navigate,
    addToast,
  } = useApp();

  const existingProduct = editingProductId
    ? products.find((p) => p.id === editingProductId)
    : undefined;

  const [title, setTitle] = useState(existingProduct?.title || '');
  const [category, setCategory] = useState<CategorySlug>(
    existingProduct?.category || 'electronics'
  );
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [price, setPrice] = useState(existingProduct ? String(existingProduct.price) : '');
  const [condition, setCondition] = useState<ProductCondition>(
    existingProduct?.condition || 'Like New'
  );
  const [campusLocation, setCampusLocation] = useState(
    existingProduct?.campusLocation || CAMPUS_LOCATIONS[0]
  );
  const [contactPreference, setContactPreference] = useState<ContactPreference>(
    existingProduct?.contactPreference || 'In-App Chat'
  );
  const [images, setImages] = useState<string[]>(existingProduct?.images || []);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setTitle(existingProduct.title);
      setCategory(existingProduct.category);
      setDescription(existingProduct.description);
      setPrice(String(existingProduct.price));
      setCondition(existingProduct.condition);
      setCampusLocation(existingProduct.campusLocation);
      setContactPreference(existingProduct.contactPreference);
      setImages(existingProduct.images);
    } else {
      setTitle('');
      setCategory('electronics');
      setDescription('');
      setPrice('');
      setCondition('Like New');
      setCampusLocation(CAMPUS_LOCATIONS[0]);
      setContactPreference('In-App Chat');
      setImages([]);
    }
    setErrors({});
  }, [existingProduct]);

  const readFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string].slice(0, 6));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    readFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addQuickSamplePhoto = (url: string) => {
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url].slice(0, 6)));
  };

  const validate = (requireStrict: boolean) => {
    const next: Record<string, string> = {};
    const normalizedTitle = title.trim();
    if (!/^(?=.*[A-Za-z])[A-Za-z0-9][A-Za-z0-9 .&()/'-]{3,99}$/.test(normalizedTitle)) {
      next.title = 'Product name must be 4–100 characters, contain at least one letter, and use letters, numbers, spaces, or basic punctuation.';
    }
    const numericPrice = Number(price);
    if (requireStrict && (price === '' || Number.isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 100000)) {
      next.price = 'Enter a price from ₹1 to ₹1,00,000.';
    }
    if (requireStrict && description.trim().length < 15) {
      next.description = 'Add at least 15 characters describing condition and accessories.';
    }
    if (requireStrict && images.length === 0) {
      next.images = 'Please upload at least one product photo.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (targetStatus: ListingStatus) => {
    const strict = targetStatus === 'active';
    if (!validate(strict)) return;

    const payload = {
      title: title.trim(),
      category,
      description: description.trim() || 'Draft listing description.',
      price: Number(price) || 0,
      condition,
      campusLocation,
      university: currentUser?.university || 'Presidency University, Bangalore',
      images: images.length > 0 ? images : [PRODUCT_IMAGES.lamp],
      status: targetStatus,
      contactPreference,
    };

    try {
      if (existingProduct) {
        const updated = await updateListing(existingProduct.id, payload);
        if (updated) navigate('my-listings');
      } else {
        const created = await createListing(payload);
        addToast({
          type: 'success',
          title: targetStatus === 'draft' ? 'Draft saved' : 'Listing published!',
          description:
            targetStatus === 'draft'
              ? 'You can resume editing from My Listings.'
              : `"${created.title}" is now visible in the campus marketplace and saved to MongoDB.`,
        });
        navigate(targetStatus === 'draft' ? 'my-listings' : 'product-details', {
          productId: created.id,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not save listing',
        description: error instanceof Error ? error.message : 'Please make sure the backend and MongoDB are running.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(existingProduct ? 'my-listings' : 'dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {existingProduct ? 'Edit Listing' : 'Sell a Product on Campus'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Create a clear, trustworthy listing for students at {currentUser?.university}.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        {/* Image Uploader */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Product Images ({images.length}/6)
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              isDragging
                ? 'border-teal-600 bg-teal-50/50'
                : errors.images
                ? 'border-red-300 bg-red-50/30'
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-teal-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">
              Drag and drop photos here, or browse from your device
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Clear daylight photos sell 2x faster · PNG or JPG up to 6 images
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <ImagePlus className="w-4 h-4 text-teal-700" />
                <span>Add Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => readFiles(e.target.files)}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                onClick={() => addQuickSamplePhoto(PRODUCT_IMAGES.macbook)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-teal-700 hover:bg-teal-50 cursor-pointer"
              >
                Use Sample Studio Photo
              </button>
            </div>
          </div>
          {errors.images && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.images}</p>}

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group"
                >
                  <img
                    src={src}
                    alt={`Upload preview ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    aria-label={`Remove image ${idx + 1}`}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-white/90 text-slate-700 hover:text-red-600 shadow-sm cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listing Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Product Title"
              placeholder="e.g. Sony WH-1000XM5 Headphones or Calculus 9th Ed."
              value={title}
              onChange={(e) => setTitle(e.target.value.replace(/[^A-Za-z0-9 .&()/'-]/g, '').slice(0, 100))}
              error={errors.title}
            />
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategorySlug)}
            options={categories
              .filter((c) => c.active)
              .map((c) => ({ value: c.slug, label: c.name }))}
          />

          <Input
            label="Price (₹)"
            type="number"
            min="1"
            max="100000"
            step="1"
            placeholder="1200"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
          />

          <Select
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as ProductCondition)}
            options={[
              { value: 'New', label: 'New (Unused)' },
              { value: 'Like New', label: 'Like New' },
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' },
            ]}
          />

          <Select
            label="Preferred Campus Meetup Spot"
            value={campusLocation}
            onChange={(e) => setCampusLocation(e.target.value)}
            options={CAMPUS_LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
          />

          <div className="sm:col-span-2">
            <Select
              label="Contact Preference"
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value as ContactPreference)}
              options={[
                { value: 'In-App Chat', label: 'In-App Chat (Recommended)' },
                { value: 'Chat & Phone', label: 'In-App Chat & Phone Number' },
                { value: 'University Email', label: 'University Email' },
              ]}
            />
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              rows={4}
              placeholder="Describe condition, edition or model year, included cables/accessories, and preferred meetup times..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => handleSave('draft')}>
              Save Draft
            </Button>
            <Button onClick={() => handleSave('active')}>
              {existingProduct ? 'Update & Save' : 'Publish Listing'}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Listing Preview"
        subtitle="How students will see your item in CampusCart"
        maxWidth="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            {images[0] ? (
              <img
                src={images[0]}
                alt={title || 'Preview'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No photo added yet
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-xs text-slate-500 capitalize">
              {category} · {condition} · {campusLocation}
            </p>
            <h3 className="font-display text-xl font-bold text-slate-900">
              {title || 'Untitled Listing'}
            </h3>
            <p className="font-mono-tabular text-2xl font-bold text-slate-900">
              {formatPrice(Number(price) || 0)}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {description || 'No description provided yet.'}
            </p>
            <p className="text-xs text-slate-500 pt-2">
              Seller: {currentUser?.fullName} · {contactPreference}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
