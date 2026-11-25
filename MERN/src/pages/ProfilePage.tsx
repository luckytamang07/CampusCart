import React, { useMemo, useState } from 'react';
import { Edit3, KeyRound, LogOut, Mail, Phone, ShieldCheck, Star } from 'lucide-react';
import { ProductCard } from '../components/marketplace/ProductCard';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/States';
import { useApp } from '../context/AppContext';
import { CAMPUS_LOCATIONS, UNIVERSITY_NAME } from '../data/seedData';
import { formatRelativeDate, getInitials } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    products,
    favorites,
    reviews,
    updateProfile,
    logout,
    navigate,
    addToast,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'listings' | 'reviews' | 'saved'>('listings');
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const university = UNIVERSITY_NAME;
  const [campusLocation, setCampusLocation] = useState(
    currentUser?.campusLocation || CAMPUS_LOCATIONS[0]
  );

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  const myListings = useMemo(
    () => products.filter((p) => p.sellerId === currentUser?.id),
    [products, currentUser]
  );

  const savedProducts = useMemo(
    () => products.filter((p) => favorites.includes(p.id)),
    [products, favorites]
  );

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      university,
      campusLocation,
    });
    setEditOpen(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      setPassError('Enter your current password.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }
    setPassError('');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPasswordOpen(false);
    addToast({ type: 'success', title: 'Password updated' });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-teal-700 text-white font-display text-2xl font-bold flex items-center justify-center shrink-0">
                {getInitials(currentUser.fullName)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {currentUser.fullName}
                </h1>

              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                {currentUser.university} · {currentUser.campusLocation}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {currentUser.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {currentUser.phone}
                </span>
                <span>Member since {currentUser.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFullName(currentUser.fullName);
                setPhone(currentUser.phone);
                setCampusLocation(currentUser.campusLocation);
                setEditOpen(true);
              }}
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
              <KeyRound className="w-4 h-4" />
              Change Password
            </Button>
            <Button variant="ghost" size="sm" className="!text-red-600" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Metrics Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 max-w-lg">
          <div>
            <p className="text-xs text-slate-500">Rating</p>
            <p className="font-mono-tabular text-lg font-bold text-slate-900 inline-flex items-center gap-1 mt-0.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              {currentUser.rating.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Listings</p>
            <p className="font-mono-tabular text-lg font-bold text-slate-900 mt-0.5">
              {myListings.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Sold Items</p>
            <p className="font-mono-tabular text-lg font-bold text-slate-900 mt-0.5">
              {currentUser.soldCount}
            </p>
          </div>
        </div>
      </section>

      {/* Profile Sections Tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
        {[
          { id: 'listings' as const, label: `My Listings (${myListings.length})` },
          { id: 'reviews' as const, label: `Reviews (${reviews.length})` },
          { id: 'saved' as const, label: `Saved Items (${savedProducts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'listings' && (
        myListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No listings yet"
            description="Items you list for sale on campus will appear on your profile."
            actionLabel="Sell a Product"
            onAction={() => navigate('sell')}
          />
        )
      )}

      {activeSection === 'reviews' && (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-sm font-semibold text-slate-900">
                    {rev.reviewerName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Bought {rev.productTitle} · {formatRelativeDate(rev.createdAt)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-mono-tabular font-semibold text-slate-900">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {rev.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'saved' && (
        savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="You haven't saved any products yet."
            description="Browse the campus marketplace to bookmark items you are considering."
            actionLabel="Browse Products"
            onAction={() => navigate('browse')}
          />
        )
      )}

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        subtitle="Update your student marketplace details"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input label="University" value={university} disabled />
          <Select
            label="Default Meetup Spot"
            value={campusLocation}
            onChange={(e) => setCampusLocation(e.target.value)}
            options={CAMPUS_LOCATIONS.map((c) => ({ value: c, label: c }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change Password"
        maxWidth="sm"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            error={passError}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
