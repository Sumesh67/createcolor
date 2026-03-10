"use client";

import { Mail, MessageCircle, HelpCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-pink-500">Create</span>
            <span className="text-purple-500">And</span>
            <span className="text-cyan-500">Color</span>
            {" "}Support
          </h1>
          <p className="text-gray-600 text-lg">
            We&apos;re here to help you create amazing coloring pages!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-pink-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Support</h2>
            <p className="text-gray-600 mb-4">
              Have a question or need help? Send us an email and we&apos;ll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@createandcolor.com"
              className="text-pink-500 font-medium hover:text-pink-600"
            >
              support@createandcolor.com
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">FAQs</h2>
            <p className="text-gray-600 mb-4">
              Find quick answers to common questions about using CreateAndColor.
            </p>
            <Link href="#faqs" className="text-purple-500 font-medium hover:text-purple-600">
              View FAQs
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12" id="faqs">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How do I create a coloring page?</h3>
              <p className="text-gray-600">
                Use the Spin It slot machine to randomly combine characters, actions, and places.
                Or use Say It to speak your idea, or Type It to write your own description.
                Then tap &quot;Create Magic&quot; to generate your coloring page!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How do I save my coloring pages?</h3>
              <p className="text-gray-600">
                After generating a coloring page, tap the Save button. You can save to your device&apos;s
                photo library, to your in-app gallery, or both.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How do I print a coloring page?</h3>
              <p className="text-gray-600">
                Save the coloring page to your photos, then open it and use your device&apos;s print
                function. On the web, you can use the Print button for direct printing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Is CreateAndColor safe for kids?</h3>
              <p className="text-gray-600">
                Yes! We have multiple safety layers including content filtering and AI moderation
                to ensure all generated content is kid-friendly. Parents can also enable Strict Mode
                in the Parent Dashboard for additional controls.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Why am I seeing &quot;Too many requests&quot;?</h3>
              <p className="text-gray-600">
                To ensure fair usage, there&apos;s a limit of 30 coloring pages per hour.
                Wait a bit and try again, or use the saved pages in your gallery!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How do I access Parent Controls?</h3>
              <p className="text-gray-600">
                Go to the Parents tab and enter the PIN (default: 1234). From there you can
                enable Strict Mode, set theme restrictions, and view activity logs.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Legal</h2>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-cyan-500 font-medium hover:text-cyan-600">
              Privacy Policy
            </Link>
            <a href="mailto:legal@createandcolor.com" className="text-cyan-500 font-medium hover:text-cyan-600">
              Terms of Service
            </a>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-500">
          <p>&copy; 2026 CreateAndColor. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
