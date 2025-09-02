import { SEOHead } from "@/components/SEOHead";

export default function Terms() {
  return (
    <>
      <SEOHead
        title="Terms of Service - Lansa Career Development Platform"
        description="Read Lansa's terms of service covering user responsibilities, platform usage guidelines, and service agreements for our career development platform."
        keywords="lansa terms of service, user agreement, platform terms, career development terms, service conditions"
        canonical="https://lansa.online/terms"
        noindex={true}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-muted py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: January 2, 2025
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using Lansa's career development platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
              <p className="text-muted-foreground">
                These terms govern your use of our platform, including all features, services, content, and tools provided by Lansa.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                Lansa is an AI-powered career development platform that helps users:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Create and optimize professional profiles</li>
                <li>Receive personalized career insights and recommendations</li>
                <li>Connect with career opportunities and employers</li>
                <li>Access career development tools and resources</li>
                <li>Share professional profiles with potential employers</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">User Accounts and Registration</h2>
              <p className="text-muted-foreground mb-4">
                To use certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your account credentials secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                You agree to use our service only for lawful purposes and in accordance with these terms. You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon others' intellectual property rights</li>
                <li>Upload false, misleading, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our service or servers</li>
                <li>Use our service to harass, abuse, or harm others</li>
                <li>Create fake accounts or misrepresent your identity</li>
                <li>Scrape or extract data from our platform without permission</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mb-3">Your Content</h3>
              <p className="text-muted-foreground mb-4">
                You retain ownership of the content you create and upload to our platform. By using our service, you grant us a limited license to use, display, and process your content to provide our services.
              </p>

              <h3 className="text-xl font-semibold mb-3">Our Content</h3>
              <p className="text-muted-foreground mb-4">
                All content, features, and functionality of our platform, including but not limited to text, graphics, logos, and software, are owned by Lansa and protected by intellectual property laws.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">AI-Generated Content and Insights</h2>
              <p className="text-muted-foreground mb-4">
                Our AI-powered features provide career insights and recommendations based on your profile and market data. Please note:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>AI insights are suggestions, not guarantees of career outcomes</li>
                <li>You are responsible for verifying and validating AI-generated content</li>
                <li>We do not guarantee the accuracy or completeness of AI insights</li>
                <li>Career decisions remain your responsibility</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Privacy and Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which is incorporated into these terms by reference.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
              <p className="text-muted-foreground mb-4">
                We strive to maintain high service availability, but we do not guarantee uninterrupted access to our platform. We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Modify or discontinue features with reasonable notice</li>
                <li>Perform maintenance that may temporarily affect availability</li>
                <li>Suspend accounts that violate these terms</li>
                <li>Update our platform and terms as needed</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                To the fullest extent permitted by law, Lansa shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <p className="text-muted-foreground mb-4">
                You may terminate your account at any time through your account settings. We may terminate or suspend your account immediately if you violate these terms or for other legitimate reasons.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We may modify these terms at any time. We will notify users of significant changes through our platform or email. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please visit our <a href="/help" className="text-primary hover:underline">Help Center</a> or contact us through our platform.
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}