import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroCenterRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const textBanner1Ref = useRef<HTMLDivElement>(null);
  const textBanner2Ref = useRef<HTMLDivElement>(null);
  const workSectionRef = useRef<HTMLDivElement>(null);
  const pathSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero parallax effect
    if (heroLeftRef.current && heroCenterRef.current && heroRightRef.current) {
      gsap.to(heroLeftRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroLeftRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      gsap.to(heroRightRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: heroRightRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // Text banner animations
    if (textBanner1Ref.current && textBanner2Ref.current) {
      gsap.to(textBanner1Ref.current, {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: textBanner1Ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      gsap.to(textBanner2Ref.current, {
        xPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: textBanner2Ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Lansa - AI-Powered Career Development Platform | Dutch Caribbean Professional Growth"
        description="Transform your career in the Dutch Caribbean with Lansa's AI-powered professional profile builder. Create compelling profiles, get personalized career insights, and connect with opportunities in Curaçao, Aruba, and Sint Maarten."
        keywords="career development dutch caribbean, professional profile builder curacao, job search aruba, career coaching sint maarten, AI career development caribbean, professional networking antilles, resume builder caribbean, career growth dutch islands"
        canonical="https://lansa.online/"
      />
      
      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="font-urbanist font-bold text-xl">Lansa</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/about" className="text-gray-600 hover:text-gray-900 font-public-sans">About</Link>
                <Link to="/resources" className="text-gray-600 hover:text-gray-900 font-public-sans">Resources</Link>
                <Link to="/help" className="text-gray-600 hover:text-gray-900 font-public-sans">Support</Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild className="font-public-sans">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 font-public-sans">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Left Image Block */}
              <div ref={heroLeftRef} className="col-span-3 hidden lg:block">
                <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden">
                  <img 
                    src="/lovable-uploads/155ecc34-3f01-4d49-b1ad-10c1a50803e2.png" 
                    alt="Professional in Curaçao office"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Center Content */}
              <div className="col-span-12 lg:col-span-6 text-center">
                <h1 className="font-urbanist font-bold text-5xl lg:text-7xl mb-6 leading-tight">
                  Your Career,
                  <br />
                  <span className="text-blue-600">Amplified</span>
                </h1>
                <p className="font-public-sans text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Build a standout professional profile that gets you noticed in the Dutch Caribbean. 
                  AI-powered insights help you showcase your unique value to employers across the region.
                </p>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 font-public-sans">
                  <Link to="/auth">Start Building Your Profile</Link>
                </Button>
              </div>
              
              {/* Right Image Block */}
              <div ref={heroRightRef} className="col-span-3 hidden lg:block">
                <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl overflow-hidden">
                  <img 
                    src="/lovable-uploads/1c3395f0-854c-4830-b97a-46a12aec1d25.png" 
                    alt="Career success in Aruba"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Center Hero Image */}
            <div ref={heroCenterRef} className="mt-16 relative">
              <div className="max-w-4xl mx-auto">
                <div className="w-full h-96 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/lovable-uploads/2bc2aac1-3d99-47c5-a884-0800b05c0f76.png" 
                    alt="Professional networking in Sint Maarten"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Text Banner Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div ref={textBanner1Ref} className="mb-8">
              <h2 className="font-urbanist font-bold text-6xl lg:text-8xl text-center">
                Get Clarity, Confidence, and Recognition
              </h2>
            </div>
            <div ref={textBanner2Ref}>
              <p className="font-urbanist font-bold text-4xl lg:text-6xl text-center text-blue-600">
                Now — Not Later
              </p>
            </div>
          </div>
        </section>

        {/* Work Where You Fit Best Section */}
        <section ref={workSectionRef} className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-urbanist font-bold text-5xl text-center mb-20">
              Work Where You Fit Best
            </h2>
            
            <div className="grid grid-cols-12 gap-12 items-center min-h-screen">
              {/* Left Content */}
              <div className="col-span-12 lg:col-span-4">
                <div className="space-y-8">
                  <div className="opacity-100">
                    <h3 className="font-urbanist font-bold text-2xl mb-4">Remote-First Companies</h3>
                    <p className="font-public-sans text-gray-600 leading-relaxed">
                      Connect with progressive Caribbean companies that embrace remote work culture and value talent over location.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Center Sticky Image */}
              <div className="col-span-12 lg:col-span-4">
                <div className="sticky top-32">
                  <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden">
                    <img 
                      src="/lovable-uploads/62496478-1e20-484c-bb96-6f47496037df.png" 
                      alt="Remote work opportunities"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Content */}
              <div className="col-span-12 lg:col-span-4">
                <div className="space-y-8">
                  <div className="opacity-100">
                    <h3 className="font-urbanist font-bold text-2xl mb-4">Local Impact Roles</h3>
                    <p className="font-public-sans text-gray-600 leading-relaxed">
                      Make a difference in your community with roles in education, healthcare, tourism, and sustainable development.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Path to Success Section */}
        <section ref={pathSectionRef} className="py-32 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-12">
              {/* Left Sticky Content */}
              <div className="col-span-12 lg:col-span-6">
                <div className="sticky top-32">
                  <h2 className="font-urbanist font-bold text-5xl mb-8">
                    Your Path to Success Starts Here
                  </h2>
                  <p className="font-public-sans text-xl text-gray-600 leading-relaxed">
                    Follow our proven 3-step process to transform your career in the Dutch Caribbean market.
                  </p>
                </div>
              </div>
              
              {/* Right Cards */}
              <div className="col-span-12 lg:col-span-6">
                <div className="space-y-16">
                  {/* Card 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="text-blue-600 font-urbanist font-bold text-6xl mb-4">01</div>
                    <h3 className="font-urbanist font-bold text-2xl mb-4">Build Your Profile</h3>
                    <p className="font-public-sans text-gray-600 leading-relaxed">
                      Create a compelling professional profile with AI-powered insights tailored to the Caribbean job market.
                    </p>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="text-blue-600 font-urbanist font-bold text-6xl mb-4">02</div>
                    <h3 className="font-urbanist font-bold text-2xl mb-4">Get Discovered</h3>
                    <p className="font-public-sans text-gray-600 leading-relaxed">
                      Let employers across Curaçao, Aruba, and Sint Maarten find you through our regional network.
                    </p>
                  </div>
                  
                  {/* Card 3 */}
                  <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="text-blue-600 font-urbanist font-bold text-6xl mb-4">03</div>
                    <h3 className="font-urbanist font-bold text-2xl mb-4">Land Your Dream Job</h3>
                    <p className="font-public-sans text-gray-600 leading-relaxed">
                      Connect with opportunities that match your skills, values, and career goals in the Caribbean.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-urbanist font-bold text-5xl text-center mb-20">
              Trusted by Caribbean Professionals
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Text Testimonial 1 */}
              <div className="bg-blue-50 p-8 rounded-2xl">
                <p className="font-public-sans text-gray-700 mb-6 italic">
                  "Lansa helped me showcase my bilingual skills and cultural knowledge, landing me a management role in Curaçao's tourism sector."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="ml-4">
                    <p className="font-urbanist font-bold">Maria Santos</p>
                    <p className="font-public-sans text-sm text-gray-600">Tourism Manager, Curaçao</p>
                  </div>
                </div>
              </div>
              
              {/* Image Testimonial */}
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src="/lovable-uploads/91347dc5-2857-4d8f-9a0e-f7f93f5a739b.png" 
                  alt="Success story"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Text Testimonial 2 */}
              <div className="bg-green-50 p-8 rounded-2xl">
                <p className="font-public-sans text-gray-700 mb-6 italic">
                  "The AI insights helped me reframe my experience in a way that resonated with Sint Maarten employers. Got 3 interviews in one week!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="ml-4">
                    <p className="font-urbanist font-bold">James Richardson</p>
                    <p className="font-public-sans text-sm text-gray-600">Finance Director, Sint Maarten</p>
                  </div>
                </div>
              </div>
              
              {/* Text Testimonial 3 */}
              <div className="bg-purple-50 p-8 rounded-2xl">
                <p className="font-public-sans text-gray-700 mb-6 italic">
                  "Finally, a platform that understands the Caribbean job market. Lansa connected me with opportunities I never knew existed."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="ml-4">
                    <p className="font-urbanist font-bold">Ana Martinez</p>
                    <p className="font-public-sans text-sm text-gray-600">Software Engineer, Aruba</p>
                  </div>
                </div>
              </div>
              
              {/* More testimonials */}
              <div className="bg-yellow-50 p-8 rounded-2xl">
                <p className="font-public-sans text-gray-700 mb-6 italic">
                  "The regional focus made all the difference. Employers could see my local connections and cultural fit immediately."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div className="ml-4">
                    <p className="font-urbanist font-bold">Carlos Ruiz</p>
                    <p className="font-public-sans text-sm text-gray-600">Marketing Director, Curaçao</p>
                  </div>
                </div>
              </div>
              
              {/* Image Testimonial 2 */}
              <div className="rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <span className="font-urbanist font-bold text-4xl text-gray-600">Success Stories</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Lansa Section */}
        <section className="py-32 px-6 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-urbanist font-bold text-5xl mb-8">
              Meet Lansa
            </h2>
            <p className="font-public-sans text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              We're not just another career platform. We're your dedicated partner in navigating the unique opportunities 
              and challenges of the Dutch Caribbean professional landscape.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-urbanist font-bold mb-2">1000+</div>
                <p className="font-public-sans text-blue-100">Caribbean Professionals</p>
              </div>
              <div>
                <div className="text-4xl font-urbanist font-bold mb-2">3</div>
                <p className="font-public-sans text-blue-100">Islands Covered</p>
              </div>
              <div>
                <div className="text-4xl font-urbanist font-bold mb-2">95%</div>
                <p className="font-public-sans text-blue-100">Success Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-urbanist font-bold text-5xl mb-8">
              Ready to Transform Your Career?
            </h2>
            <p className="font-public-sans text-xl mb-12 text-gray-300 leading-relaxed">
              Join hundreds of professionals who've already discovered better opportunities in the Dutch Caribbean.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-12 py-4 font-public-sans">
              <Link to="/auth">Start Your Journey Today</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <span className="font-urbanist font-bold text-xl">Lansa</span>
                </div>
                <p className="font-public-sans text-gray-600 text-sm">
                  AI-powered career development for Dutch Caribbean professionals.
                </p>
              </div>
              
              <div>
                <h4 className="font-urbanist font-bold mb-4">Platform</h4>
                <ul className="space-y-2 font-public-sans text-sm text-gray-600">
                  <li><Link to="/about" className="hover:text-blue-600">About</Link></li>
                  <li><Link to="/resources" className="hover:text-blue-600">Resources</Link></li>
                  <li><Link to="/help" className="hover:text-blue-600">Support</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-urbanist font-bold mb-4">Legal</h4>
                <ul className="space-y-2 font-public-sans text-sm text-gray-600">
                  <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-urbanist font-bold mb-4">Regions</h4>
                <ul className="space-y-2 font-public-sans text-sm text-gray-600">
                  <li>Curaçao</li>
                  <li>Aruba</li>
                  <li>Sint Maarten</li>
                  <li>Caribbean Region</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-100 mt-12 pt-8 text-center">
              <p className="font-public-sans text-sm text-gray-600">
                &copy; 2025 Lansa. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}