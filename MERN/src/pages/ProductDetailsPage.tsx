import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Flag,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  ShoppingCart,
  Package,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { ProfileCard } from '../components/marketplace/ChatBubble';
import { ProductCard } from '../components/marketplace/ProductCard';
import { Button } from '../components/ui/Button';
import { Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/States';
import { useApp } from '../context/AppContext';
import { formatPrice, formatRelativeDate } from '../utils/formatters';

export const ProductDetailsPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    favorites,
    currentUser,
    users,
    navigate,
    toggleFavorite,
    startConversationForProduct,
    changeListingStatus,
    submitReport,
    addToast,
  } = useApp();

  const product = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [product?.id]);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Misleading description');
  const [reportDetails, setReportDetails] = useState('');

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This listing may have been removed or sold."
        actionLabel="Browse Marketplace"
        onAction={() => navigate('browse')}
      />
    );
  }

  const isSaved = favorites.includes(product.id);
  const isOwner = currentUser?.id === product.sellerId;
  const sellerUser = users.find((u) => u.id === product.sellerId);
  const currentImg = product.images[activeImageIdx] || product.images[0];

  const similarProducts = products
    .filter((p) => p.status === 'active' && p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const sellerOtherListings = products
    .filter((p) => p.status === 'active' && p.id !== product.id && p.sellerId === product.sellerId)
    .slice(0, 3);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      productId: product.id,
      reason: reportReason,
      details: reportDetails.trim() || 'Flagged from product details page.',
    });
    setReportDetails('');
    setReportOpen(false);
  };

  return (
    <div className="space-y-10">
      <div>
        <button
          type="button"
          onClick={() => navigate('browse')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>
      </div>

      {/* Main Split: Sticky Gallery Left + Contiguous Purchase/Contact Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="aspect-[4/3] bg-white border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center">
            {currentImg ? (
              <img
                src={currentImg}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <Package className="w-12 h-12 mb-2" />
                <span className="text-sm">No image provided</span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 cursor-pointer ${
                    idx === activeImageIdx ? 'border-teal-700' : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info & Actions Module */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="capitalize font-medium text-teal-700">{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.condition}</span>
                <span aria-hidden="true">·</span>
                <span>Posted {formatRelativeDate(product.createdAt)}</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 leading-snug">
                {product.title}
              </h1>
              <p className="font-mono-tabular text-3xl font-bold text-slate-900 mt-3">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="py-3.5 border-y border-slate-100 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Meetup at <strong className="font-medium text-slate-900">{product.campusLocation}</strong> ({product.university})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Preferred contact: {product.contactPreference}</span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900 mb-1.5">
                Description
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Primary Actions */}
            <div className="space-y-2.5 pt-2">
              {isOwner ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => navigate('sell', { editProductId: product.id })}
                >
                  Edit This Listing
                </Button>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Button
                      fullWidth
                      size="lg"
                      onClick={() => startConversationForProduct(product)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat with Seller
                    </Button>
                    <Button
                      fullWidth
                      size="lg"
                      variant="primary"
                      onClick={async () => {
                        if (product.status !== 'active') return;
                        if (window.confirm(`Confirm purchase of \"${product.title}\" for ${formatPrice(product.price)}?`)) {
                          try {
                            await changeListingStatus(product.id, 'sold');
                            addToast({
                              type: 'success',
                              title: 'Item marked as sold',
                              description: 'The seller can now arrange the campus handoff with you.',
                            });
                          } catch {
                            addToast({ type: 'error', title: 'Purchase could not be completed' });
                          }
                        }
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button variant="outline" onClick={() => setContactOpen(true)}>
                      Contact Seller
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleFavorite(product.id)}
                      className={isSaved ? '!border-rose-300 !text-rose-700 !bg-rose-50/50' : ''}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                      {isSaved ? 'Saved' : 'Save Product'}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {!isOwner && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report Listing
                </button>
              </div>
            )}
          </div>

          {/* Seller Profile Card */}
          <ProfileCard
            name={product.sellerName}
            university={product.sellerUniversity}
            rating={product.sellerRating}
            verified={product.sellerVerified}
            avatarUrl={product.sellerAvatar}
            subtitle={sellerUser ? `${sellerUser.soldCount} sold` : 'University account'}
          />
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="pt-4 border-t border-slate-200">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Seller's Other Listings */}
      {sellerOtherListings.length > 0 && (
        <section className="pt-4 border-t border-slate-200">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-5">
            More from {product.sellerName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerOtherListings.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Contact Seller Modal */}
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Contact ${product.sellerName}`}
        subtitle={`${product.sellerUniversity} · Preferred: ${product.contactPreference}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Mail className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{sellerUser?.email || 'University account email'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                {sellerUser?.preferences.showPhoneOnProfile
                  ? sellerUser.phone
                  : 'Phone hidden — use In-App Chat'}
              </span>
            </div>
          </div>
          <Button
            fullWidth
            onClick={() => {
              setContactOpen(false);
              startConversationForProduct(product);
            }}
          >
            <MessageSquare className="w-4 h-4" />
            Open In-App Chat
          </Button>
        </div>
      </Modal>

      {/* Report Listing Modal */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report Listing"
        subtitle="Help keep CampusCart safe and accurate for students."
        maxWidth="sm"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <Select
            label="Reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            options={[
              { value: 'Misleading description', label: 'Misleading description or photos' },
              { value: 'Prohibited campus item', label: 'Prohibited item on campus' },
              { value: 'Suspected scam or spam', label: 'Suspected scam or spam' },
              { value: 'Academic integrity concern', label: 'Academic integrity concern' },
            ]}
          />
          <Textarea
            label="Additional Details"
            rows={3}
            placeholder="Share any context for campus moderators..."
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
