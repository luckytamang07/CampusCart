import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Lock,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { CategoryCard } from '../components/marketplace/CategoryCard';
import { ProductCard } from '../components/marketplace/ProductCard';
import { SearchBar } from '../components/marketplace/SearchBar';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { HERO_IMAGE } from '../data/seedData';

export const LandingPage: React.FC = () => {
  const { products, categories, navigate } = useApp();
  const [heroQuery, setHeroQuery] = useState('');

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === 'active'),
    [products]
  );

  const featuredProducts = useMemo(() => {
    const featured = activeProducts.filter((p) => p.featured);
    return (featured.length >= 3 ? featured : activeProducts).slice(0, 6);
  }, [activeProducts]);

  const recentlyAdded = useMemo(
    () =>
      [...activeProducts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [activeProducts]
  );

  const handleHeroSearch = () => {
    navigate('browse', { query: heroQuery, category: 'all' });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onScrollToSection={scrollToSection} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-3">
                  Mernova – CampusCart
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
                  Buy and sell with students on your campus.
                </h1>
                <p className="text-base sm:text-lg text-slate-600 mt-4 max-w-xl leading-relaxed">
                  Find textbooks, laptops, dorm furniture, and commuter gear from classmates
                  at your university—no shipping fees, no guesswork.
                </p>

                <div className="mt-7 max-w-xl">
                  <SearchBar
                    value={heroQuery}
                    onChange={setHeroQuery}
                    onSubmit={handleHeroSearch}
                    placeholder="Search textbooks, laptops, bikes, lamps..."
                    buttonLabel="Search"
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button size="lg" onClick={() => navigate('browse')}>
                    Browse Products
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate('sell')}>
                    Sell an Item
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                  <span>Presidency University accounts only</span>
                  <span aria-hidden="true">·</span>
                  <span>Direct student-to-student chat</span>
                  <span aria-hidden="true">·</span>
                  <span>Zero listing fees</span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative h-64 sm:h-80 lg:h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={HERO_IMAGE}
                    alt="University students walking across campus quad with laptops and backpacks"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs font-medium text-teal-200">Presidency University, Bangalore</p>
                    <p className="font-display text-base sm:text-lg font-semibold mt-0.5">
                      Safe handoffs at Admin Block, Fountain, Ground, D Block, L Block & DSA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">Browse by Category</h2>
              <p className="text-sm text-slate-600 mt-1">
                Everything students need for classes, dorm rooms, and campus life.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('browse', { category: 'all' })}
              className="text-sm font-medium text-teal-700 hover:text-teal-900 whitespace-nowrap shrink-0 cursor-pointer"
            >
              View all listings
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories
              .filter((c) => c.active)
              .map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => navigate('browse', { category: category.slug })}
                />
              ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-sm text-slate-600 mt-1">
                Popular items currently available across campus meetup points.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('browse')}
              className="text-sm font-medium text-teal-700 hover:text-teal-900 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Browse marketplace
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">Recently Added</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Freshly posted by fellow students today.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('browse')}
                className="text-sm font-medium text-teal-700 hover:text-teal-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                See latest
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyAdded.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works & Trust & Safety */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">How CampusCart Works</h2>
              <p className="text-sm text-slate-600 mt-1.5">
                Three simple steps from discovery to campus handoff.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Find a product',
                    desc: 'Search by course, item category, price range, or your nearest campus building.',
                    icon: <Search className="w-5 h-5 text-teal-700" />,
                  },
                  {
                    step: '02',
                    title: 'Chat with the seller',
                    desc: 'Message university classmates directly inside CampusCart to ask questions or confirm condition.',
                    icon: <MessageSquare className="w-5 h-5 text-teal-700" />,
                  },
                  {
                    step: '03',
                    title: 'Meet safely on campus',
                    desc: 'Exchange items at the designated campus meetup spots.',
                    icon: <MapPin className="w-5 h-5 text-teal-700" />,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-slate-900">
                        {item.step}. {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-slate-900">Trust & Safety</h2>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Designed specifically around university community standards so you always know who you
                are meeting.
              </p>

              <div className="mt-6 divide-y divide-slate-100">
                <div className="py-4 flex items-start gap-3.5">
                  <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-900">
                      University Email Verification
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Accounts require an active Presidency University, Bangalore email
                      (name.rollnumber@presidencyuniversity.in) before listing or messaging.
                    </p>
                  </div>
                </div>

                <div className="py-4 flex items-start gap-3.5">
                  <Users className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-900">
                      Campus-Only Visibility & Ratings
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Review seller ratings, campus affiliation, and past completed sales before meeting.
                    </p>
                  </div>
                </div>

                <div className="py-4 flex items-start gap-3.5">
                  <Lock className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-900">
                      Moderated Reporting Queue
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Flag suspicious listings with one click for immediate campus moderator review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-slate-900 rounded-2xl px-6 py-12 sm:px-12 sm:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-balance">
                Start buying and selling on campus
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2">
                Create your free student account in under a minute or explore active campus listings now.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button size="lg" onClick={() => navigate('signup')}>
                Create Student Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('browse')}
                className="!bg-transparent !text-white !border-slate-600 hover:!bg-slate-800"
              >
                Browse Products
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
