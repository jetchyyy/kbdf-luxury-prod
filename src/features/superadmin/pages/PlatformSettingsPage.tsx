import { useState, useEffect } from 'react';
import { ShieldAlert, Globe, Server, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { useNotification } from '../../../core/context/NotificationContext';

export function PlatformSettingsPage() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
  const { showSuccess, showError } = useNotification();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper states for adding new feature bullet points per plan
  const [newFeatureText, setNewFeatureText] = useState<{ [planName: string]: string }>({});

  useEffect(() => {
    async function loadPricingPlans() {
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
          // Fallback static defaults
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
      } catch (err: any) {
        console.error("Failed to load platform settings:", err);
        showError("Failed to load pricing configurations.");
      } finally {
        setLoading(false);
      }
    }

    loadPricingPlans();
  }, []);

  const handleUpdatePlanField = (index: number, field: string, value: any) => {
    setPlans(prev => prev.map((plan, idx) => {
      if (idx === index) {
        return { ...plan, [field]: value };
      }
      return plan;
    }));
  };

  const handleAddFeature = (index: number, planName: string) => {
    const text = newFeatureText[planName]?.trim();
    if (!text) return;

    setPlans(prev => prev.map((plan, idx) => {
      if (idx === index) {
        return {
          ...plan,
          features: [...(plan.features || []), text]
        };
      }
      return plan;
    }));

    setNewFeatureText(prev => ({ ...prev, [planName]: "" }));
  };

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    setPlans(prev => prev.map((plan, idx) => {
      if (idx === planIndex) {
        return {
          ...plan,
          features: plan.features.filter((_: any, fIdx: number) => fIdx !== featureIndex)
        };
      }
      return plan;
    }));
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: 'pricing_plans',
          value: plans
        }, { onConflict: 'key' });

      if (error) throw error;
      showSuccess("Pricing plans updated successfully!");
    } catch (err: any) {
      console.error(err);
      showError("Failed to save pricing configurations: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">Platform Settings</h2>
        <p className="text-white/40 text-xs mt-0.5 font-sans">Global configuration settings and packages for EcomSaaS multi-tenant database infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT / TOP: Infrastructure Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Supabase details */}
          <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Server className="w-4 h-4 text-[#fb7a90]" />
              <h3 className="text-white font-semibold text-sm">Database Configuration</h3>
            </div>
            
            <div className="space-y-3 text-xs text-white/70">
              <div>
                <p className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">Shared Project Endpoint</p>
                <p className="font-mono bg-[#07080c] p-2.5 rounded-lg border border-white/5 text-white/90 overflow-x-auto truncate mt-1">
                  {supabaseUrl}
                </p>
              </div>
              <div>
                <p className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">Row-Level Security State</p>
                <p className="mt-1 font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active (Isolated)
                </p>
              </div>
            </div>
          </div>

          {/* Deployment notice */}
          <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Globe className="w-4 h-4 text-[#fb7a90]" />
              <h3 className="text-white font-semibold text-sm">Deployment Settings</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              EcomSaaS is designed around a single-repository, multi-site architecture. When onboarding a tenant:
            </p>
            <ul className="list-disc list-inside text-xs text-white/50 space-y-1">
              <li>Generate their customized config `.env` in Tenants page.</li>
              <li>Commit code adjustments or push same branch to Netlify.</li>
              <li>Link a new Netlify website to this repository and supply the downloaded `.env` fields.</li>
            </ul>
          </div>

          {/* Security alert */}
          <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1 text-white/70">
              <h4 className="font-semibold text-white">System Security Notice</h4>
              <p>
                Platform Superadmin routes are strictly protected by Row Level Security bypassing policies. 
                Keep your authentication details secure, and ensure that Service Role keys are never exposed.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT / MAIN: Dynamic Pricing Plans Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/5 p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-white font-serif font-bold text-base">Platform Pricing Plans</h3>
                <p className="text-white/40 text-xs mt-0.5">Customize the packages available on the landing page in real-time.</p>
              </div>
              <button
                onClick={handleSavePricing}
                disabled={saving || loading}
                className="bg-brand-pink hover:bg-brand-coral text-white rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Pricing Plans
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
              </div>
            ) : (
              <div className="space-y-8 divide-y divide-white/5">
                {plans.map((plan, planIdx) => {
                  const isCustom = plan.priceMonthly === "Custom" || plan.priceYearly === "Custom";

                  return (
                    <div key={plan.name} className={`space-y-4 ${planIdx > 0 ? 'pt-8' : ''}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-pink" /> {plan.name} Tier
                        </h4>
                        
                        <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={isCustom}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleUpdatePlanField(planIdx, "priceMonthly", "Custom");
                                handleUpdatePlanField(planIdx, "priceYearly", "Custom");
                              } else {
                                handleUpdatePlanField(planIdx, "priceMonthly", 1999);
                                handleUpdatePlanField(planIdx, "priceYearly", 1599);
                              }
                            }}
                            className="rounded border-white/10 bg-[#07080c] text-brand-pink focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          Use Custom / Enterprise pricing
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-white/50">Monthly Price (₱)</label>
                          <input 
                            type={isCustom ? "text" : "number"}
                            value={plan.priceMonthly}
                            disabled={isCustom}
                            onChange={(e) => handleUpdatePlanField(planIdx, "priceMonthly", isCustom ? e.target.value : Number(e.target.value))}
                            className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-brand-pink disabled:opacity-40"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-white/50">Yearly Price (computed monthly, ₱)</label>
                          <input 
                            type={isCustom ? "text" : "number"}
                            value={plan.priceYearly}
                            disabled={isCustom}
                            onChange={(e) => handleUpdatePlanField(planIdx, "priceYearly", isCustom ? e.target.value : Number(e.target.value))}
                            className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-brand-pink disabled:opacity-40"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-white/50">Description</label>
                        <textarea
                          rows={2}
                          value={plan.description}
                          onChange={(e) => handleUpdatePlanField(planIdx, "description", e.target.value)}
                          className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-brand-pink resize-none"
                        />
                      </div>

                      {/* Feature Bullet Points Editor */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase text-white/50 block">Bullet Point Features</label>
                        
                        <div className="flex flex-wrap gap-2">
                          {(plan.features || []).map((feat: string, featIdx: number) => (
                            <div 
                              key={featIdx}
                              className="bg-[#07080c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white/80 flex items-center gap-2 group"
                            >
                              <span>{feat}</span>
                              <button 
                                type="button"
                                onClick={() => handleRemoveFeature(planIdx, featIdx)}
                                className="text-white/30 hover:text-brand-pink transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Feature input */}
                        <div className="flex items-center gap-2 max-w-md">
                          <input 
                            type="text"
                            placeholder="Add another feature bullet point..."
                            value={newFeatureText[plan.name] || ""}
                            onChange={(e) => setNewFeatureText(prev => ({ ...prev, [plan.name]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddFeature(planIdx, plan.name);
                              }
                            }}
                            className="flex-1 bg-[#07080c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-brand-pink"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddFeature(planIdx, plan.name)}
                            className="bg-[#07080c] border border-white/10 text-white/60 hover:text-white hover:border-brand-pink rounded-xl p-2.5 transition-all shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
export default PlatformSettingsPage;
