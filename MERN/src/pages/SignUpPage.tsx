import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Camera, CheckCircle2, User as UserIcon } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { UNIVERSITY_NAME } from '../data/seedData';
import { isValidUniversityEmail } from '../utils/formatters';

export const SignUpPage: React.FC = () => {
  const { signup, navigate, addToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const university = UNIVERSITY_NAME;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!/^[A-Za-z ]+$/.test(fullName.trim()) || fullName.trim().length < 2) {
      next.fullName = 'Name must contain only letters and spaces.';
    }
    if (!email.trim()) {
      next.email = 'University email is required.';
    } else if (!isValidUniversityEmail(email)) {
      next.email =
        'Use format: name.rollnumber@presidencyuniversity.in (e.g. navya.46@presidencyuniversity.in).';
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      next.phone = 'Phone number must contain exactly 10 digits.';
    }
    if (!university) {
      next.university = 'Please select your university.';
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
      next.password = 'Password must be at least 6 characters and contain both letters and numbers.';
    }
    if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.';
    }
    if (!acceptedTerms) {
      next.terms = 'You must accept the CampusCart Terms & Safety Guidelines.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await signup({
        fullName,
        email,
        phone,
        university,
        password,
        avatarUrl,
      });
      setCreated(true);
      addToast({
        type: 'success',
        title: 'Account created',
        description: `Welcome to CampusCart, ${user.fullName}!`,
      });
      setTimeout(() => navigate('dashboard'), 600);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <button
            type="button"
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CampusCart
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Create your student account
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Exclusively for Presidency University, Bangalore students.
            </p>

            {serverError && (
              <div
                role="alert"
                className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {created && (
              <div
                role="status"
                className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-sm text-emerald-800"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Student account created! Opening your dashboard...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 pb-2">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>Upload Profile Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-1">Optional · Helps buyers recognize you on campus</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Navya Deepthi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.replace(/[^A-Za-z ]/g, ''))}
                  error={errors.fullName}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={errors.phone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="University Email"
                  type="email"
                  placeholder="navya.46@presidencyuniversity.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  helperText="Format: name.rollnumber@presidencyuniversity.in"
                />
                <Input
                  label="University"
                  value={university}
                  disabled
                  helperText="Only Presidency University, Bangalore is supported"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters: letters + numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                />
              </div>

              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the CampusCart Terms of Service, Privacy Policy, and safe campus meetup
                    guidelines.
                  </span>
                </label>
                {errors.terms && <p className="mt-1 text-xs font-medium text-red-600">{errors.terms}</p>}
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
