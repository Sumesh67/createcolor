"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">Last updated: April 12, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Overview</h2>
          <p className="text-gray-600">
            CreateAndColor (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the privacy of children and families.
            This Privacy Policy explains how we collect, use, and safeguard information when you use our app and website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Prompts:</strong> Text descriptions entered to generate coloring pages (not linked to personal identity)</li>
            <li><strong>Generated Images:</strong> Coloring pages created through the app</li>
            <li><strong>Account Information:</strong> Email address if you choose to create an account (optional)</li>
            <li><strong>Usage Data:</strong> Anonymous analytics to improve the app experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Mobile App Permissions</h2>
          <p className="text-gray-600 mb-3">
            Our mobile app requests the following permissions to provide features. All permissions are optional and only used when you actively use the related feature:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Camera:</strong> Used only for the Magic Lens feature to take photos and convert them into coloring pages. Photos are processed on-device and only sent to our servers if you choose to convert them.</li>
            <li><strong>Microphone:</strong> Used only for voice input to describe coloring pages verbally. Voice recordings are converted to text immediately and not stored.</li>
            <li><strong>Photo Library:</strong> Used to save generated coloring pages to your device and to select existing photos for Magic Lens conversion. We never access your photos without your explicit action.</li>
          </ul>
          <p className="text-gray-600 mt-3">
            <strong>Important:</strong> We do not collect, store, or share any photos, voice recordings, or camera data. These permissions are used only when you actively engage with the feature, and all data is processed securely.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Children&apos;s Privacy (COPPA Compliance)</h2>
          <p className="text-gray-600 mb-3">
            We are committed to complying with the Children&apos;s Online Privacy Protection Act (COPPA). We do not:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Knowingly collect personal information from children under 13 without parental consent</li>
            <li>Require children to provide personal information to use the app</li>
            <li>Share children&apos;s information with third parties</li>
            <li>Display targeted advertising to children</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Information</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>To generate coloring pages based on your prompts</li>
            <li>To save your coloring pages to your gallery (if logged in)</li>
            <li>To improve our AI and app experience</li>
            <li>To ensure content safety and appropriate use</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Storage & Security</h2>
          <p className="text-gray-600">
            We use industry-standard security measures to protect your data. Generated images are stored securely
            and can be deleted at any time from your gallery. We do not sell or share your data with third parties
            for marketing purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Services</h2>
          <p className="text-gray-600">
            We use the following services to provide our app:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
            <li>Hugging Face - AI image generation</li>
            <li>Vercel - Web hosting</li>
            <li>MongoDB - Data storage (optional accounts only)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Parental Controls</h2>
          <p className="text-gray-600">
            Our app includes parental controls accessible through the Parent Dashboard. Parents can:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
            <li>Enable Strict Mode for additional content filtering</li>
            <li>Set theme restrictions</li>
            <li>View flagged content attempts</li>
            <li>Control app settings with a PIN</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
          <p className="text-gray-600">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
            <li>Access your data</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of analytics</li>
            <li>Contact us with privacy concerns</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy or our practices, please contact us at:
          </p>
          <p className="text-gray-600 mt-2">
            Email: <a href="mailto:createandcolor.app@gmail.com" className="text-pink-500 hover:text-pink-600">createandcolor.app@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify users of any material changes
            by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>
      </div>
    </div>
  );
}
