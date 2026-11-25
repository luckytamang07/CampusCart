import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { CAMPUS_LOCATIONS, UNIVERSITY_NAME } from '../data/seedData';

export const SettingsPage: React.FC = () => {
  const { currentUser, updateProfile, updatePreferences, logout, addToast } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const university = UNIVERSITY_NAME;
  const [campusLocation, setCampusLocation] = useState(
    currentUser?.campusLocation || CAMPUS_LOCATIONS[0]
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!currentUser) return null;

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, phone, university, campusLocation });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast({ type: 'success', title: 'Password updated successfully' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Manage your campus account, notification alerts, privacy, and security.
        </p>
      </div>

      {/* Account Settings */}
      <form
        onSubmit={handleAccountSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <h2 className="font-display text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Account Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input label="University Email" value={currentUser.email} disabled />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input label="University" value={university} disabled />
          <div className="sm:col-span-2">
            <Select
              label="Preferred Campus Meetup Spot"
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              options={CAMPUS_LOCATIONS.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit">Save Account Details</Button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Notification Preferences
        </h2>
        <div className="divide-y divide-slate-100">
          {[
            {
              key: 'notifyMessages' as const,
              title: 'New Messages',
              desc: 'Get notified when a student replies or starts a chat about your item.',
            },
            {
              key: 'notifyInterest' as const,
              title: 'Buyer Interest & Saves',
              desc: 'Receive alerts when classmates save or inquire about your active listings.',
            },
            {
              key: 'notifyListingUpdates' as const,
              title: 'Listing Approvals & Status',
              desc: 'Notifications when your listing goes live or reaches view milestones.',
            },
            {
              key: 'notifySystem' as const,
              title: 'Campus Safety & Announcements',
              desc: 'Occasional reminders about safe campus meetup practices.',
            },
          ].map((pref) => (
            <label
              key={pref.key}
              className="py-3.5 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{pref.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={currentUser.preferences[pref.key]}
                onChange={(e) => updatePreferences({ [pref.key]: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 shrink-0"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Privacy Settings
        </h2>
        <div className="divide-y divide-slate-100">
          {[
            {
              key: 'campusOnlyVisibility' as const,
              title: 'Restrict listings to university students',
              desc: 'Only university accounts can message you or view your contact preferences.',
            },
            {
              key: 'showOnlineStatus' as const,
              title: 'Show online status in chat',
              desc: 'Let buyers and sellers see when you are active in CampusCart Messages.',
            },
            {
              key: 'showPhoneOnProfile' as const,
              title: 'Allow phone contact when requested',
              desc: 'Display your phone number to university buyers who click Contact Seller.',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="py-3.5 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={currentUser.preferences[item.key]}
                onChange={(e) => updatePreferences({ [item.key]: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 shrink-0"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Password Change */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <h2 className="font-display text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Password Change
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordError}
          />
        </div>
        <div className="flex justify-end pt-1">
          <Button type="submit" variant="secondary">
            Update Password
          </Button>
        </div>
      </form>

      {/* Logout Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">Sign Out</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log out of CampusCart on this browser session.
          </p>
        </div>
        <Button variant="outline" className="!text-red-600 !border-red-200 hover:!bg-red-50" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
