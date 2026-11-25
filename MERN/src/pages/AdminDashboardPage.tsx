import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  ShieldAlert,
  Trash2,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { ConfirmDialog } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { formatPrice, formatRelativeDate } from '../utils/formatters';

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'listings'
  | 'categories'
  | 'reports'
  | 'messages'
  | 'settings';



export const AdminDashboardPage: React.FC = () => {
  const {
    users,
    products,
    categories,
    reports,
    conversations,
    navigate,
    toggleUserSuspension,
    toggleProductFeatured,
    deleteListing,
    resolveReport,
    addCategory,
    toggleCategoryActive,
    addToast,
  } = useApp();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [requireEdu, setRequireEdu] = useState(true);

  const metrics = useMemo(() => {
    const activeListings = products.filter((p) => p.status === 'active').length;
    const soldItems = products.filter((p) => p.status === 'sold').length;
    const pendingReports = reports.filter((r) => r.status === 'Pending').length;
    return {
      totalUsers: users.length,
      totalListings: products.length,
      activeListings,
      soldItems,
      reportedListings: pendingReports,
    };
  }, [users, products, reports]);

  const monthlyStats = useMemo(() => {
    const months = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (6 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleString('en-US', { month: 'short' }),
        listings: 0,
        sold: 0,
      };
    });
    const byKey = new Map(months.map((item) => [item.key, item]));
    products.forEach((product) => {
      const date = new Date(product.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const item = byKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (!item) return;
      item.listings += 1;
      if (product.status === 'sold') item.sold += 1;
    });
    return months;
  }, [products]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter(
      (u) =>
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.university.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredProducts = useMemo(() => {
    const q = listingSearch.trim().toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, listingSearch]);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'listings', label: 'Listings', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    {
      id: 'reports',
      label: 'Reports',
      icon: <Flag className="w-4 h-4" />,
      count: metrics.reportedListings,
    },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName, newCatDesc || 'Campus marketplace items');
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    addToast({
      type: 'success',
      title: 'Campus announcement sent',
      description: `Delivered to ${users.length} active university accounts.`,
    });
    setBroadcastText('');
  };

  const maxMonthlyValue = Math.max(1, ...monthlyStats.map((m) => Math.max(m.listings, m.sold)));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-slate-900 text-slate-200 min-h-screen sticky top-0 h-screen">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <Logo variant="light" onClick={() => setTab('dashboard')} />
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Admin Console
          </p>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Admin navigation">
          {navItems.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-xs font-mono-tabular font-semibold bg-red-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Admin Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-slate-900 capitalize">
                Admin · {tab}
              </h1>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            Student View
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {tab === 'dashboard' && (
            <>
              {/* 5 Dashboard Metric Cards */}
              <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                  { label: 'Total Users', value: metrics.totalUsers, tone: 'text-slate-900' },
                  { label: 'Total Listings', value: metrics.totalListings, tone: 'text-slate-900' },
                  { label: 'Active Listings', value: metrics.activeListings, tone: 'text-teal-700' },
                  { label: 'Sold Items', value: metrics.soldItems, tone: 'text-emerald-700' },
                  { label: 'Reported Listings', value: metrics.reportedListings, tone: 'text-red-600' },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5"
                  >
                    <p className="text-xs font-medium text-slate-500">{card.label}</p>
                    <p className={`font-mono-tabular text-2xl sm:text-3xl font-bold mt-1.5 ${card.tone}`}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </section>

              {/* Charts Row */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display text-base font-semibold text-slate-900">
                        Marketplace Activity (Last 7 Months)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Based on actual listings stored in MongoDB
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-teal-700" />
                        Listings
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
                        Sold
                      </span>
                    </div>
                  </div>

                  <div className="h-52 flex items-end gap-3 sm:gap-5 pt-4 border-b border-slate-100">
                    {monthlyStats.map((item) => {
                      const listH = Math.round((item.listings / maxMonthlyValue) * 100);
                      const soldH = Math.round((item.sold / maxMonthlyValue) * 100);
                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <div className="w-full flex items-end justify-center gap-1.5 h-40">
                            <div
                              className="w-3 sm:w-4 bg-teal-700 rounded-t-sm transition-all"
                              style={{ height: `${listH}%` }}
                              title={`${item.listings} listings`}
                            />
                            <div
                              className="w-3 sm:w-4 bg-slate-300 rounded-t-sm transition-all"
                              style={{ height: `${soldH}%` }}
                              title={`${item.sold} sold`}
                            />
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Distribution + Activity Overview */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    Listings by Category
                  </h2>
                  <div className="space-y-3">
                    {categories.slice(0, 6).map((cat) => {
                      const count = products.filter((p) => p.category === cat.slug).length;
                      const pct = Math.max(8, Math.round((count / Math.max(1, products.length)) * 100));
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">{cat.name}</span>
                            <span className="font-mono-tabular text-slate-500">
                              {count} ({Math.round((count / Math.max(1, products.length)) * 100)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-700 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Recent Users & Recent Listings */}
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-display text-base font-semibold text-slate-900">
                      Recent Users
                    </h2>
                    <button
                      type="button"
                      onClick={() => setTab('users')}
                      className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
                    >
                      Manage all
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-medium">Student</th>
                          <th className="py-2.5 px-4 font-medium">University</th>
                          <th className="py-2.5 px-4 font-medium text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.slice(0, 5).map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4">
                              <p className="font-medium text-slate-900">{u.fullName}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </td>
                            <td className="py-2.5 px-4 text-xs text-slate-600">{u.university}</td>
                            <td className="py-2.5 px-4 text-right text-xs font-medium">
                              <span
                                className={
                                  u.status === 'active' ? 'text-emerald-700' : 'text-red-600'
                                }
                              >
                                {u.status === 'active' ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-display text-base font-semibold text-slate-900">
                      Recent Listings
                    </h2>
                    <button
                      type="button"
                      onClick={() => setTab('listings')}
                      className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
                    >
                      Manage all
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-medium">Product</th>
                          <th className="py-2.5 px-4 font-medium">Seller</th>
                          <th className="py-2.5 px-4 font-medium text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.slice(0, 5).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4">
                              <p className="font-medium text-slate-900 truncate max-w-[200px]">
                                {p.title}
                              </p>
                              <p className="text-xs text-slate-500 capitalize">
                                {p.category} · {p.status}
                              </p>
                            </td>
                            <td className="py-2.5 px-4 text-xs text-slate-600">{p.sellerName}</td>
                            <td className="py-2.5 px-4 text-right font-mono-tabular font-semibold text-slate-900">
                              {formatPrice(p.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Reported Products Queue */}
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <h2 className="font-display text-base font-semibold text-slate-900">
                      Reported Products & Activity Overview
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('reports')}
                    className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    Open Reports Queue
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {rep.productTitle} · {formatPrice(rep.productPrice)}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Reason: <strong className="font-medium">{rep.reason}</strong> · Seller:{' '}
                          {rep.sellerName} · Reported {formatRelativeDate(rep.createdAt)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{rep.details}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {rep.status === 'Pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveReport(rep.id, 'Dismissed', false)}
                            >
                              Keep Listing
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => resolveReport(rep.id, 'Resolved', true)}
                            >
                              Remove Item
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {rep.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Student & Moderator Directory
                </h2>
                <div className="w-full sm:w-72">
                  <Input
                    placeholder="Search name, email, or university..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-medium">Name</th>
                      <th className="py-3 px-4 font-medium">University</th>
                      <th className="py-3 px-4 font-medium">Role</th>
                      <th className="py-3 px-4 font-medium text-right">Sold</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{u.university}</td>
                        <td className="py-3 px-4 text-xs capitalize text-slate-700">{u.role}</td>
                        <td className="py-3 px-4 text-right font-mono-tabular text-slate-900">
                          {u.soldCount}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium">
                          <span
                            className={u.status === 'active' ? 'text-emerald-700' : 'text-red-600'}
                          >
                            {u.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserSuspension(u.id)}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Restore'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  All Campus Listings ({filteredProducts.length})
                </h2>
                <div className="w-full sm:w-72">
                  <Input
                    placeholder="Filter listings by title or seller..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-medium">Listing</th>
                      <th className="py-3 px-4 font-medium">Seller</th>
                      <th className="py-3 px-4 font-medium text-right">Price</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{p.title}</p>
                          <p className="text-xs text-slate-500 capitalize">
                            {p.category} · {p.campusLocation}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{p.sellerName}</td>
                        <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-slate-900">
                          {formatPrice(p.price)}
                        </td>
                        <td className="py-3 px-4 text-xs capitalize text-slate-700">{p.status}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleProductFeatured(p.id)}
                            >
                              {p.featured ? 'Unfeature' : 'Feature'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="!text-red-600 hover:!bg-red-50"
                              onClick={() => setDeleteId(p.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    Marketplace Categories
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900">{cat.name}</p>
                        <p className="text-xs text-slate-500">{cat.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCategoryActive(cat.id)}
                      >
                        {cat.active ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleAddCategory}
                className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
              >
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Add Category
                </h2>
                <Input
                  label="Category Name"
                  placeholder="e.g. Lab Equipment"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <Input
                  label="Short Description"
                  placeholder="Microscopes, kits, and supplies"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />
                <Button type="submit" fullWidth>
                  <Plus className="w-4 h-4" />
                  Create Category
                </Button>
              </form>
            </div>
          )}

          {tab === 'reports' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Reported Listings Moderation Queue
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-display font-semibold text-base text-slate-900">
                        {rep.productTitle}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Reason: <strong>{rep.reason}</strong> · Reported by {rep.reportedBy} ·{' '}
                        {formatRelativeDate(rep.createdAt)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1.5">{rep.details}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {rep.status === 'Pending' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveReport(rep.id, 'Dismissed', false)}
                          >
                            Dismiss
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => resolveReport(rep.id, 'Resolved', true)}
                          >
                            Remove Listing
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700">{rep.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    Active Campus Conversations ({conversations.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {conversations.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {c.otherUserName} · {c.productTitle}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                      </div>
                      <span className="text-xs font-medium text-teal-700 whitespace-nowrap">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleBroadcast}
                className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit"
              >
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Send Campus Announcement
                </h2>
                <p className="text-xs text-slate-500">
                  Broadcast important safety reminders or semester move-out notices to all students.
                </p>
                <Input
                  label="Announcement Message"
                  placeholder="e.g. Finals Week Textbook Swap at DSA..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth>
                  Send to {users.length} Students
                </Button>
              </form>
            </div>
          )}

          {tab === 'settings' && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Campus Moderation Settings
              </h2>
              <label className="py-2 flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Require @presidencyuniversity.in email verification
                  </p>
                  <p className="text-xs text-slate-500">
                    Restrict accounts strictly to Presidency University, Bangalore emails (name.rollnumber@presidencyuniversity.in).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireEdu}
                  onChange={(e) => setRequireEdu(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-700"
                />
              </label>
              <label className="py-2 flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Auto-publish student listings
                  </p>
                  <p className="text-xs text-slate-500">
                    Skip manual pre-approval queue for students with 4.5+ ratings.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-700"
                />
              </label>
              <div className="pt-2">
                <Button
                  onClick={() =>
                    addToast({ type: 'success', title: 'Admin moderation settings saved' })
                  }
                >
                  Save Console Settings
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Admin Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/50 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-slate-900 text-slate-200 h-full p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <Logo variant="light" onClick={() => setMobileMenuOpen(false)} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="py-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                      tab === item.id ? 'bg-teal-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('dashboard');
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteListing(deleteId);
        }}
        title="Remove listing?"
        description="This removes the listing from CampusCart immediately."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
};
