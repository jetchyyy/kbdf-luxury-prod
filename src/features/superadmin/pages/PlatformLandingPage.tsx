import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Check, ArrowRight, ShieldCheck, Zap, BarChart3, Coins, Users, HelpCircle, Loader2, X, MessageSquare 
} from "lucide-react";
import { FadeUp } from "../../../ui/Motion/FadeUp";
import { supabase } from "../../../lib/supabase/supabaseClient";

export function PlatformLandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Form states for availing plans
  const [selectedPlanForInquiry, setSelectedPlanForInquiry] = useState<any | null>(null);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryViber, setInquiryViber] = useState("");
  const [inquiryFacebook, setInquiryFacebook] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    async function loadPricing() {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'pricing_plans')
          .maybeSingle();

        if (error) throw error;
        if (data && Array.isArray(data.value)) {
          setPlans(data.value);
        } else {
          // Fallback static plans
          setPlans([
            {
              name: "Basic",
              description: "For new boutique owners starting their luxury retail business.",
              priceMonthly: 1499,
              priceYearly: 1199,
              features: [
                "Single Store Tenant (1 Brand)",
                "Up to 200 Catalog Products",
                "Standard Checkout Flow",
                "E-mail Order Notifications",
                "Shared DB Resources"
              ],
              cta: "Launch Basic",
              popular: false,
              gradient: "from-slate-800 to-slate-900"
            },
            {
              name: "Grow",
              description: "The gold standard for growing luxury brands with high volumes.",
              priceMonthly: 3999,
              priceYearly: 3199,
              features: [
                "Custom Brand Domain Bindings",
                "Unlimited Catalog Products",
                "Pre-Approval Installments",
                "Advanced Sales Reports & Analytics",
                "Inventory Reservation Timer Flow",
                "Multiple Admin Staff & Permissions",
                "Priority Customer Support"
              ],
              cta: "Go Grow",
              popular: true,
              gradient: "from-brand-navy to-slate-950"
            },
            {
              name: "Enterprise",
              description: "Tailored database scale, SLA, and custom enterprise tools.",
              priceMonthly: "Custom",
              priceYearly: "Custom",
              features: [
                "Dedicated Database Sharding",
                "White-glove Migrations & Store Setup",
                "99.9% Uptime SLA Agreement",
                "Custom API Integrations & Webhooks",
                "Unlimited Admin Staff & Accounts",
                "Dedicated Success Manager"
              ],
              cta: "Contact Sales",
              popular: false,
              gradient: "from-slate-900 to-black"
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load platform pricing:", err);
      } finally {
        setLoadingPlans(false);
      }
    }

    loadPricing();
  }, []);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForInquiry) return;
    setSubmittingInquiry(true);
    try {
      // Fetch first tenant to satisfy foreign key constraint
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id')
        .limit(1)
        .single();
      
      const tenantIdToUse = tenantData?.id;
      if (!tenantIdToUse) throw new Error("No active platform tenants configured.");

      const formattedMessage = `Facebook Profile: ${inquiryFacebook}\n\nMessage: ${inquiryMessage}`;

      const { error } = await supabase
        .from('leads')
        .insert({
          tenant_id: tenantIdToUse,
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryViber,
          subject: `${selectedPlanForInquiry.name} Plan Inquiry`,
          message: formattedMessage,
          status: 'new'
        });

      if (error) throw error;
      setInquirySuccess(true);
      
      // Clear fields
      setInquiryName("");
      setInquiryEmail("");
      setInquiryViber("");
      setInquiryFacebook("");
      setInquiryMessage("");
    } catch (err: any) {
      console.error("Failed to submit inquiry:", err);
      alert("Failed to submit inquiry: " + (err.message || err));
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 font-sans selection:bg-brand-pink selection:text-white overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-pink/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-brand-peach/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 bg-[#0f1117]/80 backdrop-blur-md border-b border-white/5 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-pink to-brand-coral flex items-center justify-center font-black text-white text-base shadow-lg shadow-brand-pink/20">O</div>
            <span className="font-bold text-lg tracking-wider text-white">DC</span>
            <span className="text-[9px] bg-white/10 text-brand-pink px-2 py-0.5 rounded-full border border-white/5 font-semibold tracking-widest uppercase ml-1">Platform</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              to="/admin/login" 
              className="text-xs uppercase font-bold tracking-widest text-slate-400 hover:text-white px-4 py-2 transition-colors"
            >
              Merchant Login
            </Link>
            <a 
              href="#pricing"
              className="bg-brand-pink hover:bg-brand-coral text-white rounded-xl px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-all shadow-md shadow-brand-pink/15"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 max-w-7xl mx-auto px-6 text-center space-y-8">
        <FadeUp>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-brand-pink font-semibold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" /> Launching Platform V2.0
          </div>
        </FadeUp>
        
        <FadeUp delay={100}>
          <h1 className="text-4xl md:text-6xl font-serif text-white font-black leading-tight max-w-4xl mx-auto">
            A Premium E-Commerce Platform Built for <span className="bg-gradient-to-r from-brand-pink via-brand-coral to-brand-peach bg-clip-text text-transparent">Luxury Brands</span>
          </h1>
        </FadeUp>

        <FadeUp delay={200}>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create beautiful multi-brand store layouts, enable secure order inventory reservations, and offer customized installment plans directly to your buyers.
          </p>
        </FadeUp>

        <FadeUp delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href="#pricing"
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
            >
              View Plans & Pricing <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </FadeUp>
      </section>

      {/* Platform Core Features Grid */}
      <section id="features" className="py-24 border-t border-white/5 bg-[#0a0c10]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs text-brand-pink uppercase tracking-widest font-black">Platform Capabilities</h2>
            <h3 className="text-2xl md:text-4xl font-serif text-white font-bold">Why Luxury Brands Choose ODC</h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto uppercase tracking-wider leading-relaxed">Everything you need to configure and manage private boutiques</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-brand-pink/30 hover:bg-white/[0.03] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-6 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif mb-2">24/7 Developer Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get around-the-clock technical developer support for code changes, platform configurations, database updates, and storefront enhancements whenever you need it.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-brand-pink/30 hover:bg-white/[0.03] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-6 group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif mb-2">Installments Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Approve installment accounts on an item-by-item level. Shoppers request pre-approval at checkout, and admins verify receipts and manage payments inline.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-brand-pink/30 hover:bg-white/[0.03] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif mb-2">Inventory Reservations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prevent cart hoarding and overselling. Storefront items are reserved securely on a database-backed timer countdown at checkout, releasing stock automatically on expiry.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-brand-pink/30 hover:bg-white/[0.03] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif mb-2">Advanced Analytics</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track revenue growth, customer acquisition funnels, category distributions, and monthly expenses via a responsive, visual administrator dashboard panel.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-brand-pink/30 hover:bg-white/[0.03] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif mb-2">Roles & Permissions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add system administrators and staff operators with granular accessibility checkboxes. Decide who can view sales, upload stock, or manage payments.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-brand-pink/30 hover:bg-white/[0.03] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif mb-2">Dynamic Branding</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each tenant controls their unique branding settings, primary and accent theme colors, currency symbols, and pick-up store logistics dynamically from the admin panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Plans Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <div className="space-y-2">
            <h2 className="text-xs text-brand-pink uppercase tracking-widest font-black">Pricing Packages</h2>
            <h3 className="text-2xl md:text-4xl font-serif text-white font-bold">Flexible Plans for Every Stage</h3>
          </div>

          {/* Billing Cycle Switcher Toggle */}
          <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1.5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${billingCycle === 'monthly' ? 'bg-brand-pink text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-brand-pink text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Yearly Billing
              <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loadingPlans ? (
          <div className="py-16 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const isCustom = plan.priceMonthly === "Custom" || plan.priceYearly === "Custom";
              const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            
            return (
              <div 
                key={plan.name}
                className={`rounded-3xl bg-gradient-to-b ${plan.gradient} border ${plan.popular ? 'border-brand-pink shadow-[0_0_50px_rgba(251,122,144,0.1)] scale-100 lg:scale-[1.03]' : 'border-white/5'} p-8 flex flex-col justify-between transition-all hover:translate-y-[-4px] relative`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-pink to-brand-coral text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-brand-pink/20 shadow-md">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold font-serif text-white">{plan.name}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="py-4 border-y border-white/5 flex items-baseline gap-2">
                    {isCustom ? (
                      <span className="text-3xl font-serif text-white font-bold">Custom Pricing</span>
                    ) : (
                      <>
                        <span className="text-3xl md:text-4xl font-serif text-white font-black">
                          ₱{price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                          / {billingCycle === 'monthly' ? 'month' : 'month, billed yearly'}
                        </span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3.5 text-xs text-slate-300">
                    {plan.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <button
                    onClick={() => {
                      setSelectedPlanForInquiry(plan);
                      setInquirySuccess(false);
                    }}
                    className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-brand-pink hover:bg-brand-coral text-white shadow-md shadow-brand-pink/15' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-white/5 bg-[#0a0c10]/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs text-brand-pink uppercase tracking-widest font-black">Common Queries</h2>
            <h3 className="text-2xl md:text-4xl font-serif text-white font-bold">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <h4 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-pink" /> How do I register a new tenant store?
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Merchants register stores inside the ODC Superadmin Dashboard panel. Superadmins can generate specific configurations and custom build variables, which are then deployed automatically.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <h4 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-pink" /> What are installment plans?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Installment is an item-level, post-payment process where buyers request pre-approval. When approved, they checkout their shopping bag on customizable schedules and upload billing receipts for admin verification.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <h4 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-pink" /> Can I bind custom domains for my brand?
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Yes! The Professional and Enterprise plans allow merchants to bind custom URLs. The platform routes users dynamically based on incoming domain names or URL slugs to load branding packages correctly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#090b0e]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-pink to-brand-coral flex items-center justify-center font-black text-white text-sm">O</div>
            <span className="font-bold text-sm tracking-wider text-white">DC</span>
            <span className="text-[10px] text-slate-500">© 2026 ODC Platforms, Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#features" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#pricing" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="mailto:support@odc.com" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* Inquiry Form Modal */}
      {selectedPlanForInquiry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-lg w-full text-left space-y-6 shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPlanForInquiry(null)}
              className="absolute right-6 top-6 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySuccess ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
                  <Check className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-white">Inquiry Received</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Thank you for your interest in the <span className="text-brand-pink font-bold">{selectedPlanForInquiry.name} plan</span>! 
                    A platform representative will get in touch with you via Viber or Facebook shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlanForInquiry(null)}
                  className="bg-brand-pink hover:bg-brand-coral text-white rounded-xl px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Avail {selectedPlanForInquiry.name} Plan</h3>
                  <p className="text-xs text-slate-400 mt-1">Please provide your details below and our team will contact you to set up your store.</p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={inquiryName}
                      onChange={e => setInquiryName(e.target.value)}
                      placeholder="Jane Doe" 
                      className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-pink"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={inquiryEmail}
                      onChange={e => setInquiryEmail(e.target.value)}
                      placeholder="jane.doe@example.com" 
                      className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-pink"
                    />
                  </div>

                  {/* Viber & Facebook */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Viber Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={inquiryViber}
                        onChange={e => setInquiryViber(e.target.value)}
                        placeholder="+63 917 123 4567" 
                        className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-pink"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Facebook Profile Link *</label>
                      <input 
                        type="url" 
                        required 
                        value={inquiryFacebook}
                        onChange={e => setInquiryFacebook(e.target.value)}
                        placeholder="https://facebook.com/janedoe" 
                        className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-pink"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Message (Optional)</label>
                    <textarea 
                      rows={3} 
                      value={inquiryMessage}
                      onChange={e => setInquiryMessage(e.target.value)}
                      placeholder="Tell us about your brand or specific custom requirements..." 
                      className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-pink resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-coral text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {submittingInquiry ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <MessageSquare className="w-4 h-4 text-white" />}
                    {submittingInquiry ? 'Sending Inquiry...' : `Avail ${selectedPlanForInquiry.name} Plan`}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
export default PlatformLandingPage;
