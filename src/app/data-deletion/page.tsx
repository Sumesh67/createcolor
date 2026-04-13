"use client";

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Deletion Request</h1>
        <p className="text-gray-600 mb-4">Last updated: April 12, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Data, Your Control</h2>
          <p className="text-gray-600">
            At CreateAndColor, we respect your privacy and your right to control your data.
            You can request deletion of your data at any time, with or without deleting your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How to Delete Your Data</h2>

          <div className="bg-pink-50 border-l-4 border-pink-500 p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Option 1: Delete Individual Items (In-App)</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>Open the CreateAndColor app</li>
              <li>Navigate to your Gallery</li>
              <li>Tap on any coloring page you want to delete</li>
              <li>Select the delete option</li>
              <li>Confirm deletion</li>
            </ol>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Option 2: Request Full Data Deletion (Keep Your Account)</h3>
            <p className="text-gray-600 mb-2">
              If you want to delete all your data but keep your account active, email us at:
            </p>
            <p className="text-lg font-semibold text-pink-500">
              <a href="mailto:createandcolor.app@gmail.com?subject=Data Deletion Request"
                 className="hover:text-pink-600 underline">
                createandcolor.app@gmail.com
              </a>
            </p>
            <p className="text-gray-600 mt-2 text-sm">
              Subject line: &quot;Data Deletion Request&quot;
            </p>
            <p className="text-gray-600 mt-2">
              Include in your email:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
              <li>Your registered email address</li>
              <li>Confirmation that you want to delete all data while keeping your account</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Option 3: Delete Your Account (All Data)</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>Open the CreateAndColor app</li>
              <li>Go to Account Settings</li>
              <li>Select &quot;Delete Account&quot;</li>
              <li>Confirm account deletion</li>
            </ol>
            <p className="text-gray-600 mt-2 text-sm italic">
              Note: This will permanently delete your account and all associated data.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What Data Will Be Deleted</h2>
          <p className="text-gray-600 mb-3">When you request data deletion, we will remove:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Generated coloring pages:</strong> All images you created</li>
            <li><strong>Saved gallery items:</strong> Your personal collection</li>
            <li><strong>Prompts and descriptions:</strong> Text you entered to create images</li>
            <li><strong>Account information:</strong> Your email and profile (if deleting account)</li>
            <li><strong>Usage data:</strong> Analytics associated with your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What Data May Be Retained</h2>
          <p className="text-gray-600 mb-3">
            We may retain certain data for legal or operational purposes:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Flagged content:</strong> Data related to content safety violations may be retained for up to 90 days for safety purposes</li>
            <li><strong>Legal compliance:</strong> Data required by law to be retained</li>
            <li><strong>Anonymized analytics:</strong> Aggregated, non-identifiable usage statistics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Timeline</h2>
          <p className="text-gray-600">
            <strong>In-app deletion:</strong> Immediate<br />
            <strong>Email requests:</strong> We will process your request within 30 days and confirm via email when complete.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Questions or Concerns?</h2>
          <p className="text-gray-600">
            If you have any questions about data deletion or our privacy practices, please contact us:
          </p>
          <p className="text-gray-600 mt-2">
            Email: <a href="mailto:createandcolor.app@gmail.com" className="text-pink-500 hover:text-pink-600 underline">createandcolor.app@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Related Resources</h2>
          <ul className="space-y-2">
            <li>
              <a href="/privacy" className="text-pink-500 hover:text-pink-600 underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/support" className="text-pink-500 hover:text-pink-600 underline">
                Support & Help Center
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
