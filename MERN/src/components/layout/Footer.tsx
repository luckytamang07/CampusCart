import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../ui/Logo';
import { Modal } from '../ui/Modal';

type InfoTopic = 'About' | 'Contact' | 'Privacy' | 'Terms' | 'Help' | null;

const TOPIC_CONTENT: Record<Exclude<InfoTopic, null>, { title: string; body: string[] }> = {
  About: {
    title: 'About Mernova – CampusCart',
    body: [
      'CampusCart is built by Mernova to give university students a safe, dedicated marketplace within their own campus community.',
      'By verifying university email addresses and focusing on convenient on-campus handoffs, students save money on textbooks, electronics, dorm furniture, and everyday essentials without shipping delays or anonymous strangers.',
    ],
  },
  Contact: {
    title: 'Contact Support',
    body: [
      'Need assistance with a listing, campus verification, or account recovery? Reach our Presidency University, Bangalore campus operations team at support.01@presidencyuniversity.in.',
      'For urgent safety concerns during a campus meetup, please contact Campus Safety alongside submitting an in-app listing report.',
    ],
  },
  Privacy: {
    title: 'Privacy Policy',
    body: [
      'Your university email and phone number are never sold or shared with third-party advertisers. You control whether your phone number is visible on your profile inside Settings.',
      'In-app messages are strictly used to coordinate campus meetups between university students.',
    ],
  },
  Terms: {
    title: 'Terms of Campus Use',
    body: [
      'All items listed on CampusCart must comply with university policies and local laws. Prohibited items include weapons, alcohol, controlled substances, and graded academic answer keys.',
      'Buyers and sellers are encouraged to inspect items thoroughly in public campus spaces before completing payment.',
    ],
  },
  Help: {
    title: 'CampusCart Help Center',
    body: [
      '1. Finding items: Use Browse filters by category, condition, price range, or campus meetup spot.',
      '2. Buying safely: Always chat in-app and meet at well-lit public hubs such as Admin Block, Fountain, Ground, D Block, L Block, or DSA during daytime hours.',
      '3. Selling fast: Upload clear photos in natural light, list accurate condition notes, and respond promptly to student inquiries.',
    ],
  },
};

export const Footer: React.FC = () => {
  const { navigate } = useApp();
  const [topic, setTopic] = useState<InfoTopic>(null);

  return (
    <footer id="about-section" className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-sm">
            <Logo onClick={() => navigate('landing')} />
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Mernova – CampusCart connects university students to buy, sell, and discover
              essentials right on campus.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600" aria-label="Footer navigation">
            {(['About', 'Contact', 'Privacy', 'Terms', 'Help'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className="hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 Mernova – CampusCart. Built for university communities.</p>
          <p>Safe campus meetups · University-only marketplace</p>
        </div>
      </div>

      <Modal
        open={Boolean(topic)}
        onClose={() => setTopic(null)}
        title={topic ? TOPIC_CONTENT[topic].title : ''}
      >
        {topic && (
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            {TOPIC_CONTENT[topic].body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </Modal>
    </footer>
  );
};
