import { SEOHead } from "@/components/SEOHead";

export default function Help() {
  return (
    <>
      <SEOHead
        title="Help & Support - Lansa Career Development Platform"
        description="Get help with Lansa's professional profile builder. Find answers to common questions about creating profiles, using AI insights, and maximizing your career development."
        keywords="lansa help, career development support, profile builder guide, AI career tools help, professional profile tips"
        canonical="https://lansa.online/help"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help & Support</h1>
            <p className="text-xl opacity-90">
              Everything you need to know about using Lansa effectively
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16">
          {/* Getting Started */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Getting Started</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">How do I create my professional profile?</h3>
                <p className="text-muted-foreground mb-4">
                  Getting started with Lansa is easy! Simply sign up for a free account and complete our guided onboarding process. Our AI will help you create a compelling professional profile based on your experience, skills, and career goals.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Sign up for your free Lansa account</li>
                  <li>Complete the onboarding questionnaire</li>
                  <li>Let our AI analyze your responses and generate insights</li>
                  <li>Review and customize your professional profile</li>
                  <li>Start connecting with opportunities</li>
                </ol>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">What makes Lansa different from other career platforms?</h3>
                <p className="text-muted-foreground">
                  Lansa uses advanced AI to provide personalized career insights and help you craft compelling professional narratives. Unlike traditional resume builders, we focus on your complete career story, helping you articulate your unique value proposition and connect with opportunities that truly align with your goals.
                </p>
              </div>
            </div>
          </section>

          {/* Profile Building */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Building Your Profile</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">How does the AI profile optimization work?</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your background, skills, and career aspirations to suggest improvements to your professional profile. It helps you highlight your unique strengths, craft compelling narratives, and optimize your profile for better visibility with employers and opportunities.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Can I customize my profile after it's created?</h3>
                <p className="text-muted-foreground">
                  Absolutely! Your profile is fully customizable. You can edit your information, update your experience, add new skills, and refine your professional narrative at any time. The AI will continue to provide suggestions as you update your profile.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">How do I share my profile with employers?</h3>
                <p className="text-muted-foreground">
                  You can easily share your Lansa profile with employers, recruiters, or networking contacts using a personalized link. Your shared profile showcases your professional story in a compelling, easy-to-read format that goes beyond traditional resumes.
                </p>
              </div>
            </div>
          </section>

          {/* AI Insights */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">AI Career Insights</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">What are AI career insights?</h3>
                <p className="text-muted-foreground">
                  AI career insights are personalized recommendations and analysis based on your professional profile, career goals, and market trends. These insights help you understand your strengths, identify growth opportunities, and make informed career decisions.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">How often are insights updated?</h3>
                <p className="text-muted-foreground">
                  Your insights are updated regularly as you engage with the platform and update your profile. Our AI continuously learns from your activities and provides fresh recommendations to support your career development.
                </p>
              </div>
            </div>
          </section>

          {/* Account & Privacy */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Account & Privacy</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Is my information secure?</h3>
                <p className="text-muted-foreground">
                  Yes, we take your privacy and security seriously. All your personal information is encrypted and stored securely. We never share your data without your explicit permission, and you have full control over what information is visible in your public profile.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Can I delete my account?</h3>
                <p className="text-muted-foreground">
                  Yes, you can delete your account at any time from your account settings. When you delete your account, all your personal information will be permanently removed from our systems.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center bg-muted rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Can't find what you're looking for? We're here to help you succeed.
            </p>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                For additional support, please check our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
              <a 
                href="/auth" 
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Get Started Now
              </a>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}