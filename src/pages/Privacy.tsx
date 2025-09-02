import { SEOHead } from "@/components/SEOHead";

export default function Privacy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy - Lansa Career Development Platform"
        description="Learn how Lansa protects your privacy. Read our comprehensive privacy policy covering data collection, usage, security, and your rights as a user."
        keywords="lansa privacy policy, data protection, user privacy, career platform privacy, personal information security"
        canonical="https://lansa.online/privacy"
        noindex={true}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-muted py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: January 2, 2025
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                At Lansa, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our career development platform and services.
              </p>
              <p className="text-muted-foreground">
                By using Lansa, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We collect information you provide directly to us, such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Professional background, work experience, and education</li>
                <li>Career goals, skills, and preferences</li>
                <li>Profile photos and other content you choose to upload</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-4">
                We automatically collect certain information when you use our service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Usage data and platform interactions</li>
                <li>Device information and browser type</li>
                <li>IP address and general location information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and optimize your professional profile</li>
                <li>Generate personalized career insights and recommendations</li>
                <li>Facilitate connections with potential employers and opportunities</li>
                <li>Communicate with you about your account and our services</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li><strong>With your consent:</strong> When you explicitly choose to share your profile</li>
                <li><strong>Service providers:</strong> Trusted third parties who assist us in operating our platform</li>
                <li><strong>Legal requirements:</strong> When required by law or legal process</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Safety and security:</strong> To protect the rights, property, or safety of Lansa, our users, or others</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Update:</strong> Correct or update your personal information</li>
                <li><strong>Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
                <li><strong>Restrict:</strong> Limit how we process your personal information</li>
                <li><strong>Object:</strong> Opt out of certain uses of your information</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to enhance your experience on our platform. You can control cookies through your browser settings, though disabling cookies may affect some functionality.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us through our platform or refer to our <a href="/help" className="text-primary hover:underline">Help Center</a>.
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}