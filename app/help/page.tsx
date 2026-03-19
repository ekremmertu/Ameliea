'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/hooks/useI18n';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: t('help.faq1.question', 'How do I create an invitation?'),
      answer: t('help.faq1.answer', 'After purchasing a plan, go to your dashboard and click "Create New Invitation". Choose a template, fill in your wedding details, and customize the design.'),
    },
    {
      question: t('help.faq2.question', 'How do I share my invitation?'),
      answer: t('help.faq2.answer', 'Once your invitation is published, you can share it via the unique URL, or generate QR codes and tokens for specific guests.'),
    },
    {
      question: t('help.faq3.question', 'Can I edit my invitation after publishing?'),
      answer: t('help.faq3.answer', 'Yes! You can edit your invitation at any time from your dashboard. Changes will be reflected immediately.'),
    },
    {
      question: t('help.faq4.question', 'How do guests RSVP?'),
      answer: t('help.faq4.answer', 'Guests can RSVP directly on your invitation page. You can view and manage all RSVPs from your invitation dashboard.'),
    },
    {
      question: t('help.faq5.question', 'What is the difference between Light and Premium plans?'),
      answer: t('help.faq5.answer', 'Light gives you a beautiful invitation with essential RSVP features and 30-day access. Premium adds video & music, countdown timer, guest questions, advanced analytics, unlimited edits, theme customization, and lifetime access.'),
    },
    {
      question: t('help.faq6.question', 'Can I export my guest list?'),
      answer: t('help.faq6.answer', 'Yes! Premium users can export their RSVP list as CSV from the invitation dashboard.'),
    },
    {
      question: t('help.faq7.question', 'How do I delete my account?'),
      answer: t('help.faq7.answer', 'You can delete your account from your profile page. This will permanently remove all your data.'),
    },
    {
      question: t('help.faq8.question', 'Is my data secure?'),
      answer: t('help.faq8.answer', 'Yes! We use industry-standard encryption and security measures to protect your data. We are KVKK compliant.'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t('help.title', 'Help & Support')}
          </h1>
          <p className="text-xl opacity-90">
            {t('help.subtitle', 'Find answers to common questions')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/dashboard"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t('help.dashboard', 'Dashboard')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('help.dashboardDesc', 'Manage your invitations')}
            </p>
          </Link>

          <Link
            href="/profile"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t('help.profile', 'Profile')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('help.profileDesc', 'Update your information')}
            </p>
          </Link>

          <Link
            href="/checkout"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {t('help.pricing', 'Pricing')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('help.pricingDesc', 'View plans and pricing')}
            </p>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('help.faqTitle', 'Frequently Asked Questions')}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full py-4 flex justify-between items-center text-left hover:text-rose-600 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('help.contactTitle', 'Still Need Help?')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('help.contactDesc', 'Our support team is here to help you. Reach out to us via:')}
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:support@example.com" className="text-rose-600 hover:text-rose-700">
                support@example.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+905320000000" className="text-rose-600 hover:text-rose-700">
                +90 532 000 00 00
              </a>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-rose-600 hover:text-rose-700 font-medium">
            ← {t('help.backToHome', 'Back to Home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
