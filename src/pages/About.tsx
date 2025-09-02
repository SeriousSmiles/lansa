import { SEOHead } from "@/components/SEOHead";

export default function About() {
  return (
    <>
      <SEOHead
        title="About Lansa - AI-Powered Career Development Platform"
        description="Learn about Lansa's mission to transform careers through AI-powered professional profiles. Discover how we help job seekers, students, and professionals build compelling career narratives."
        keywords="about lansa, career development platform, AI career tools, professional profile builder, career transformation, job search platform"
        canonical="https://lansa.online/about"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Lansa</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Transforming careers through AI-powered professional profiles and personalized career insights
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16">
          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <div className="max-w-4xl mx-auto text-lg leading-relaxed text-muted-foreground">
              <p className="mb-6">
                At Lansa, we believe everyone deserves to see their career dreams become reality. We're building the future of professional development through AI-powered tools that help you create compelling professional profiles, gain career clarity, and connect with opportunities that align with your goals.
              </p>
              <p className="mb-6">
                Our platform combines cutting-edge artificial intelligence with proven career development principles to provide personalized insights, professional profile optimization, and strategic career guidance.
              </p>
            </div>
          </section>

          {/* What We Do */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-4">AI-Powered Profiles</h3>
                <p className="text-muted-foreground">
                  Create compelling professional profiles with AI assistance that highlights your unique strengths and career narrative.
                </p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Career Insights</h3>
                <p className="text-muted-foreground">
                  Get personalized career insights and recommendations based on your goals, skills, and market trends.
                </p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Opportunity Matching</h3>
                <p className="text-muted-foreground">
                  Connect with relevant opportunities, employers, and career paths that align with your professional aspirations.
                </p>
              </div>
            </div>
          </section>

          {/* Who We Serve */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Who We Serve</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <h3 className="text-lg font-semibold mb-2">Job Seekers</h3>
                <p className="text-sm text-muted-foreground">
                  Professionals looking to advance their careers and land their dream jobs.
                </p>
              </div>
              <div className="text-center p-4">
                <h3 className="text-lg font-semibold mb-2">Students</h3>
                <p className="text-sm text-muted-foreground">
                  College students and recent graduates starting their professional journey.
                </p>
              </div>
              <div className="text-center p-4">
                <h3 className="text-lg font-semibold mb-2">Career Changers</h3>
                <p className="text-sm text-muted-foreground">
                  Professionals transitioning to new industries or career paths.
                </p>
              </div>
              <div className="text-center p-4">
                <h3 className="text-lg font-semibold mb-2">Freelancers</h3>
                <p className="text-sm text-muted-foreground">
                  Independent professionals building their personal brand and client base.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-muted rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Career?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are building better careers with Lansa's AI-powered platform.
            </p>
            <a 
              href="/auth" 
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </a>
          </section>
        </main>
      </div>
    </>
  );
}