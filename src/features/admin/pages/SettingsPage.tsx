import { useState, useEffect } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { Save, AlertCircle, Layout, PhoneCall, Image as ImageIcon, Settings, Truck } from 'lucide-react';
import { ImageUploadInput } from '../components/ImageUploadInput';
import { fetchProvinces } from '../../cart/locationData';
import type { PSGCLocation } from '../../cart/locationData';

export function SettingsPage() {
  const { tenant } = useAdminUser();
  const { canEdit } = usePermissions('settings');

  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'hero' | 'homepage' | 'shipping'>('branding');

  // Shipping Settings State
  interface ShippingRate {
    id: string;
    name: string;
    rate: number;
    base_weight: number;
    extra_weight_rate: number;
    provinces: string[];
  }
  const [defaultRate, setDefaultRate] = useState(150);
  const [defaultBaseWeight, setDefaultBaseWeight] = useState(1.0);
  const [defaultExtraWeightRate, setDefaultExtraWeightRate] = useState(50);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState(5000);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  
  // Helpers for editing custom rates
  const [provincesList, setProvincesList] = useState<PSGCLocation[]>([]);
  const [newRateName, setNewRateName] = useState('');
  const [newRateValue, setNewRateValue] = useState(0);
  const [newRateBaseWeight, setNewRateBaseWeight] = useState(1.0);
  const [newRateExtraWeightRate, setNewRateExtraWeightRate] = useState(50);
  const [newRateProvinces, setNewRateProvinces] = useState<string[]>([]);

  // Tab 1: Branding
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2f4065');
  const [accentColor, setAccentColor] = useState('#fb7a90');
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [reservationDurationMins, setReservationDurationMins] = useState(5);
  
  // Custom Login Backgrounds
  const [authBgUrl, setAuthBgUrl] = useState('');
  const [adminBgUrl, setAdminBgUrl] = useState('');

  // Tab 2: Contact
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [monFriHours, setMonFriHours] = useState('');
  const [satHours, setSatHours] = useState('');
  const [sunHours, setSunHours] = useState('');

  // Tab 3: Header & Hero Announcement
  const [announcementText, setAnnouncementText] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('');
  const [heroCtaLink, setHeroCtaLink] = useState('');

  const [hero2Title, setHero2Title] = useState('');
  const [hero2ImageUrl, setHero2ImageUrl] = useState('');
  const [hero2CtaText, setHero2CtaText] = useState('');
  const [hero2CtaLink, setHero2CtaLink] = useState('');

  const [hero3Title, setHero3Title] = useState('');
  const [hero3ImageUrl, setHero3ImageUrl] = useState('');
  const [hero3CtaText, setHero3CtaText] = useState('');
  const [hero3CtaLink, setHero3CtaLink] = useState('');

  // Tab 4: Homepage Sections
  // Editorial
  const [editorialTitle, setEditorialTitle] = useState('');
  const [editorialSubtitle, setEditorialSubtitle] = useState('');
  const [editorialBannerImage, setEditorialBannerImage] = useState('');
  const [editorialCtaText, setEditorialCtaText] = useState('');
  const [editorialCtaLink, setEditorialCtaLink] = useState('');
  const [editorialGrid1, setEditorialGrid1] = useState('');
  const [editorialGrid2, setEditorialGrid2] = useState('');
  const [editorialGrid3, setEditorialGrid3] = useState('');
  const [editorialGrid4, setEditorialGrid4] = useState('');

  // Featured Collections (3 items)
  const [col1Title, setCol1Title] = useState('');
  const [col1Image, setCol1Image] = useState('');
  const [col2Title, setCol2Title] = useState('');
  const [col2Image, setCol2Image] = useState('');
  const [col3Title, setCol3Title] = useState('');
  const [col3Image, setCol3Image] = useState('');

  // Testimonials (3 items)
  const [t1Quote, setT1Quote] = useState('');
  const [t1Author, setT1Author] = useState('');
  const [t1Image, setT1Image] = useState('');
  const [t1Product, setT1Product] = useState('');
  
  const [t2Quote, setT2Quote] = useState('');
  const [t2Author, setT2Author] = useState('');
  const [t2Image, setT2Image] = useState('');
  const [t2Product, setT2Product] = useState('');

  const [t3Quote, setT3Quote] = useState('');
  const [t3Author, setT3Author] = useState('');
  const [t3Image, setT3Image] = useState('');
  const [t3Product, setT3Product] = useState('');

  // Lifestyle Banner
  const [lifestyleImage, setLifestyleImage] = useState('');
  const [lifestyleText, setLifestyleText] = useState('');
  const [lifestyleCtaText, setLifestyleCtaText] = useState('');
  const [lifestyleCtaLink, setLifestyleCtaLink] = useState('');

  // Social Grid
  const [socialTitle, setSocialTitle] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [socialImg1, setSocialImg1] = useState('');
  const [socialImg2, setSocialImg2] = useState('');
  const [socialImg3, setSocialImg3] = useState('');
  const [socialImg4, setSocialImg4] = useState('');
  const [socialImg5, setSocialImg5] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setLogoUrl(tenant.logo_url || '');
      setPrimaryColor(tenant.primary_color || '#2f4065');
      setAccentColor(tenant.accent_color || '#fb7a90');
      setCurrencySymbol(tenant.currency_symbol || '₱');
      setTimezone(tenant.timezone || 'Asia/Manila');
      setReservationDurationMins(Math.round((tenant.reservation_duration_seconds ?? 300) / 60));

      const settings = (tenant.store_settings as any) || {};
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');

      const branding = settings.branding || {};
      setAuthBgUrl(branding.auth_bg_url || '');
      setAdminBgUrl(branding.admin_bg_url || '');
      
      const hours = settings.hours || {};
      setMonFriHours(hours.monday_friday || '10:00 AM - 9:00 PM');
      setSatHours(hours.saturday || '10:00 AM - 10:00 PM');
      setSunHours(hours.sunday || '11:00 AM - 8:00 PM');

      // Shipping Settings
      const shipping = settings.shipping || {};
      setDefaultRate(shipping.default_rate !== undefined ? shipping.default_rate : 150);
      setDefaultBaseWeight(shipping.default_base_weight !== undefined ? shipping.default_base_weight : 1.0);
      setDefaultExtraWeightRate(shipping.default_extra_weight_rate !== undefined ? shipping.default_extra_weight_rate : 50);
      setFreeShippingEnabled(shipping.free_shipping_enabled !== undefined ? shipping.free_shipping_enabled : true);
      setFreeShippingMinAmount(shipping.free_shipping_min_amount !== undefined ? shipping.free_shipping_min_amount : 5000);
      setShippingRates(shipping.rates || []);

      // Homepage Settings
      const homepage = settings.homepage || {};
      setAnnouncementText(homepage.announcement_text || 'Free Shipping for Orders Over $500');

      const hero = homepage.hero || homepage.heros?.[0] || {};
      setHeroTitle(hero.title || 'Payday Special Offer');
      setHeroImageUrl(hero.image_url || '');
      setHeroCtaText(hero.cta_text || 'Shop Now');
      setHeroCtaLink(hero.cta_link || '/shop');

      const hero2 = homepage.heros?.[1] || {};
      setHero2Title(hero2.title || '');
      setHero2ImageUrl(hero2.image_url || '');
      setHero2CtaText(hero2.cta_text || '');
      setHero2CtaLink(hero2.cta_link || '');

      const hero3 = homepage.heros?.[2] || {};
      setHero3Title(hero3.title || '');
      setHero3ImageUrl(hero3.image_url || '');
      setHero3CtaText(hero3.cta_text || '');
      setHero3CtaLink(hero3.cta_link || '');

      const editorial = homepage.editorial || {};
      setEditorialTitle(editorial.title || 'New In');
      setEditorialSubtitle(editorial.subtitle || 'Discover the latest arrivals');
      setEditorialBannerImage(editorial.banner_image || '');
      setEditorialCtaText(editorial.cta_text || 'Shop Now');
      setEditorialCtaLink(editorial.cta_link || '/shop');
      
      const gridImages = editorial.grid_images || [];
      setEditorialGrid1(gridImages[0] || '');
      setEditorialGrid2(gridImages[1] || '');
      setEditorialGrid3(gridImages[2] || '');
      setEditorialGrid4(gridImages[3] || '');

      const cols = homepage.featured_collections || [];
      setCol1Title(cols[0]?.title || 'All Flats');
      setCol1Image(cols[0]?.image_url || '');
      setCol2Title(cols[1]?.title || 'Tote Bags');
      setCol2Image(cols[1]?.image_url || '');
      setCol3Title(cols[2]?.title || 'Sneakers');
      setCol3Image(cols[2]?.image_url || '');

      const tests = homepage.testimonials || [];
      setT1Quote(tests[0]?.quote || "Five Stars! This wallet is fantastic. This wallet is durable enough to withstand daily use. I love the design - it's sleek and modern, but also practical with plenty of space for cards and cash/coins. It's the perfect blend of style and functionality. Highly recommend!");
      setT1Author(tests[0]?.author || '- Richie A.E.');
      setT1Image(tests[0]?.image_url || '');
      setT1Product(tests[0]?.product_name || 'CLASSIC WALLET');

      setT2Quote(tests[1]?.quote || "Been looking for this kind of design and I really love it! I took the risk to order even if I wasn't sure about my size, but I got it correct! It fits perfectly. Btw, you have to add 1 size up. Thanks! I will definitely order again 😊");
      setT2Author(tests[1]?.author || '- MJ G.');
      setT2Image(tests[1]?.image_url || '');
      setT2Product(tests[1]?.product_name || 'KESHI SLIDES');

      setT3Quote(tests[2]?.quote || "This is actually my second time ordering the same pair of shoes. The quality is excellent, and they're really comfortable to wear. I'm very satisfied with my purchase!");
      setT3Author(tests[2]?.author || '- Cyndy');
      setT3Image(tests[2]?.image_url || '');
      setT3Product(tests[2]?.product_name || 'EVERYDAY SNEAKERS');

      const lifestyle = homepage.lifestyle || {};
      setLifestyleImage(lifestyle.image_url || '');
      setLifestyleText(lifestyle.text || 'Where style meets <span class="text-brand-peach italic">value</span> - shoes, bags, and wallets that make you stand out.');
      setLifestyleCtaText(lifestyle.cta_text || 'Shop Now');
      setLifestyleCtaLink(lifestyle.cta_link || '/shop');

      const social = homepage.social || {};
      setSocialTitle(social.title || 'As Seen On @kbdf.ph');
      setSocialHandle(social.handle || '@kbdf.ph');
      
      const socImgs = social.images || [];
      setSocialImg1(socImgs[0] || '');
      setSocialImg2(socImgs[1] || '');
      setSocialImg3(socImgs[2] || '');
      setSocialImg4(socImgs[3] || '');
      setSocialImg5(socImgs[4] || '');
    }
  }, [tenant]);

  // Fetch provinces list on mount
  useEffect(() => {
    fetchProvinces().then(data => {
      setProvincesList(data);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const storeSettings = {
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        hours: {
          monday_friday: monFriHours.trim(),
          saturday: satHours.trim(),
          sunday: sunHours.trim(),
        },
        branding: {
          auth_bg_url: authBgUrl.trim(),
          admin_bg_url: adminBgUrl.trim(),
        },
        homepage: {
          announcement_text: announcementText.trim(),
          hero: {
            title: heroTitle.trim(),
            image_url: heroImageUrl.trim(),
            cta_text: heroCtaText.trim(),
            cta_link: heroCtaLink.trim(),
          },
          heros: [
            {
              title: heroTitle.trim(),
              image_url: heroImageUrl.trim(),
              cta_text: heroCtaText.trim(),
              cta_link: heroCtaLink.trim(),
            },
            ...(hero2ImageUrl.trim() ? [{
              title: hero2Title.trim(),
              image_url: hero2ImageUrl.trim(),
              cta_text: hero2CtaText.trim(),
              cta_link: hero2CtaLink.trim(),
            }] : []),
            ...(hero3ImageUrl.trim() ? [{
              title: hero3Title.trim(),
              image_url: hero3ImageUrl.trim(),
              cta_text: hero3CtaText.trim(),
              cta_link: hero3CtaLink.trim(),
            }] : [])
          ],
          editorial: {
            title: editorialTitle.trim(),
            subtitle: editorialSubtitle.trim(),
            banner_image: editorialBannerImage.trim(),
            cta_text: editorialCtaText.trim(),
            cta_link: editorialCtaLink.trim(),
            grid_images: [
              editorialGrid1.trim(),
              editorialGrid2.trim(),
              editorialGrid3.trim(),
              editorialGrid4.trim(),
            ]
          },
          featured_collections: [
            { title: col1Title.trim(), image_url: col1Image.trim() },
            { title: col2Title.trim(), image_url: col2Image.trim() },
            { title: col3Title.trim(), image_url: col3Image.trim() },
          ],
          testimonials: [
            { quote: t1Quote.trim(), author: t1Author.trim(), image_url: t1Image.trim(), product_name: t1Product.trim() },
            { quote: t2Quote.trim(), author: t2Author.trim(), image_url: t2Image.trim(), product_name: t2Product.trim() },
            { quote: t3Quote.trim(), author: t3Author.trim(), image_url: t3Image.trim(), product_name: t3Product.trim() },
          ],
          lifestyle: {
            image_url: lifestyleImage.trim(),
            text: lifestyleText.trim(),
            cta_text: lifestyleCtaText.trim(),
            cta_link: lifestyleCtaLink.trim(),
          },
          social: {
            title: socialTitle.trim(),
            handle: socialHandle.trim(),
            images: [
              socialImg1.trim(),
              socialImg2.trim(),
              socialImg3.trim(),
              socialImg4.trim(),
              socialImg5.trim(),
            ]
          }
        },
        shipping: {
          default_rate: Number(defaultRate),
          default_base_weight: Number(defaultBaseWeight),
          default_extra_weight_rate: Number(defaultExtraWeightRate),
          free_shipping_enabled: freeShippingEnabled,
          free_shipping_min_amount: Number(freeShippingMinAmount),
          rates: shippingRates
        }
      };

      console.log("PAYLOAD BEING SENT TO SUPABASE:", JSON.stringify(storeSettings, null, 2));

      const { error } = await supabase
        .from('tenants')
        .update({
          name: name.trim(),
          logo_url: logoUrl.trim() || null,
          primary_color: primaryColor,
          accent_color: accentColor,
          currency_symbol: currencySymbol.trim(),
          timezone,
          reservation_duration_seconds: Math.max(60, reservationDurationMins * 60),
          store_settings: storeSettings
        })
        .eq('id', tenant!.id);

      if (error) throw error;
      setSuccessMsg('Settings updated successfully! Refreshing to apply changes...');
      
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update store settings.');
    } finally {
      setIsSaving(false);
    }
  }

  const tenantId = tenant?.id || '';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Store Settings</h2>
          <p className="text-white/40 text-xs mt-0.5">Customize your storefront branding, layout details, operating hours, and banner configurations.</p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </div>

      {successMsg && (
        <div className="text-emerald-400 text-xs bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {errorMsg}
        </div>
      )}

      {!canEdit && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          You do not have permissions to edit Settings. View only mode is active.
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'branding'
              ? 'border-[#fb7a90] text-[#fb7a90]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" /> Branding & General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-[#fb7a90] text-[#fb7a90]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <PhoneCall className="w-4 h-4" /> Contact & Hours
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'hero'
              ? 'border-[#fb7a90] text-[#fb7a90]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Announcement & Hero
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('homepage')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'homepage'
              ? 'border-[#fb7a90] text-[#fb7a90]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" /> Homepage Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'border-[#fb7a90] text-[#fb7a90]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" /> Shipping Rates
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* TAB 1: BRANDING & GENERAL */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Store Branding</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Store Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={!canEdit}
                  placeholder="KBDF Luxury Store"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Logo Image URL / Photo</label>
                <ImageUploadInput
                  value={logoUrl}
                  onChange={setLogoUrl}
                  tenantId={tenantId}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      disabled={!canEdit}
                      className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer disabled:opacity-50"
                    />
                    <span className="font-mono text-xs text-white/70">{primaryColor}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      disabled={!canEdit}
                      className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer disabled:opacity-50"
                    />
                    <span className="font-mono text-xs text-white/70">{accentColor}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">User Login BG Image</label>
                  <ImageUploadInput
                    value={authBgUrl}
                    onChange={setAuthBgUrl}
                    tenantId={tenantId}
                    placeholder="Optional background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Admin Login BG Image</label>
                  <ImageUploadInput
                    value={adminBgUrl}
                    onChange={setAdminBgUrl}
                    tenantId={tenantId}
                    placeholder="Optional background"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Regional Settings</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  required
                  maxLength={3}
                  disabled={!canEdit}
                  placeholder="₱"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50 font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Timezone</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  disabled={!canEdit}
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                >
                  <option value="Asia/Manila">Manila (GMT+8)</option>
                  <option value="Asia/Singapore">Singapore (GMT+8)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Checkout Reservation Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={reservationDurationMins}
                    onChange={e => setReservationDurationMins(Math.max(1, Number(e.target.value)))}
                    min={1}
                    max={60}
                    disabled={!canEdit}
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50 w-24"
                  />
                  <span className="text-white/50 text-xs">minutes</span>
                </div>
                <p className="text-white/30 text-[10px]">How long items are held during checkout when stock is tight. Default: 5 mins.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & OPERATIONAL HOURS */}
        {activeTab === 'contact' && (
          <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
            <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Contact Details & Operations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Official Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={!canEdit}
                    placeholder="clientcare@kbdf.com"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Store Telephone/Mobile</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={!canEdit}
                    placeholder="+63 2 8123 4567"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Store Address</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    disabled={!canEdit}
                    rows={3}
                    placeholder="123 Luxury Avenue, Metro Manila, Philippines"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Monday - Friday Hours</label>
                  <input
                    type="text"
                    value={monFriHours}
                    onChange={e => setMonFriHours(e.target.value)}
                    disabled={!canEdit}
                    placeholder="10:00 AM - 9:00 PM"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Saturday Hours</label>
                  <input
                    type="text"
                    value={satHours}
                    onChange={e => setSatHours(e.target.value)}
                    disabled={!canEdit}
                    placeholder="10:00 AM - 10:00 PM"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Sunday Hours</label>
                  <input
                    type="text"
                    value={sunHours}
                    onChange={e => setSunHours(e.target.value)}
                    disabled={!canEdit}
                    placeholder="11:00 AM - 8:00 PM"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENT BAR & HERO BANNER */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Announcement Header</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Promo Text Bar</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Free Shipping for Orders Over $500"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Main Hero Banner</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Hero Banner Title</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={e => setHeroTitle(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Payday Special Offer"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Hero Banner Image URL / Photo</label>
                <ImageUploadInput
                  value={heroImageUrl}
                  onChange={setHeroImageUrl}
                  tenantId={tenantId}
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Button CTA Text</label>
                  <input
                    type="text"
                    value={heroCtaText}
                    onChange={e => setHeroCtaText(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Shop Now"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Button Link Route</label>
                  <input
                    type="text"
                    value={heroCtaLink}
                    onChange={e => setHeroCtaLink(e.target.value)}
                    disabled={!canEdit}
                    placeholder="/shop"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Hero Banner 2 (Optional)</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Hero Banner Title</label>
                <input
                  type="text"
                  value={hero2Title}
                  onChange={e => setHero2Title(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Exclusive Bags"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Hero Banner Image URL / Photo</label>
                <ImageUploadInput
                  value={hero2ImageUrl}
                  onChange={setHero2ImageUrl}
                  tenantId={tenantId}
                  placeholder="Leave empty to disable"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Button CTA Text</label>
                  <input
                    type="text"
                    value={hero2CtaText}
                    onChange={e => setHero2CtaText(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Discover"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Button Link Route</label>
                  <input
                    type="text"
                    value={hero2CtaLink}
                    onChange={e => setHero2CtaLink(e.target.value)}
                    disabled={!canEdit}
                    placeholder="/shop"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Hero Banner 3 (Optional)</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Hero Banner Title</label>
                <input
                  type="text"
                  value={hero3Title}
                  onChange={e => setHero3Title(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Limited Edition"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Hero Banner Image URL / Photo</label>
                <ImageUploadInput
                  value={hero3ImageUrl}
                  onChange={setHero3ImageUrl}
                  tenantId={tenantId}
                  placeholder="Leave empty to disable"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Button CTA Text</label>
                  <input
                    type="text"
                    value={hero3CtaText}
                    onChange={e => setHero3CtaText(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Shop Now"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Button Link Route</label>
                  <input
                    type="text"
                    value={hero3CtaLink}
                    onChange={e => setHero3CtaLink(e.target.value)}
                    disabled={!canEdit}
                    placeholder="/shop"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOMEPAGE SECTIONS */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            
            {/* Editorial Grid */}
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Editorial Section (New In)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Editorial Banner Title</label>
                  <input
                    type="text"
                    value={editorialTitle}
                    onChange={e => setEditorialTitle(e.target.value)}
                    disabled={!canEdit}
                    placeholder="New In"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Editorial Subtitle</label>
                  <input
                    type="text"
                    value={editorialSubtitle}
                    onChange={e => setEditorialSubtitle(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Discover the latest arrivals"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Editorial Banner Image URL / Photo</label>
                  <ImageUploadInput
                    value={editorialBannerImage}
                    onChange={setEditorialBannerImage}
                    tenantId={tenantId}
                    placeholder="https://example.com/image.png"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-white/60 text-[10px] uppercase">Button Text</label>
                    <input type="text" value={editorialCtaText} onChange={e => setEditorialCtaText(e.target.value)} disabled={!canEdit} className="bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-white/60 text-[10px] uppercase">Link Route</label>
                    <input type="text" value={editorialCtaLink} onChange={e => setEditorialCtaLink(e.target.value)} disabled={!canEdit} className="bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider block mb-2">Editorial Grid Images (4 URLs / Photos)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploadInput value={editorialGrid1} onChange={setEditorialGrid1} tenantId={tenantId} placeholder="Grid Image 1 URL" />
                  <ImageUploadInput value={editorialGrid2} onChange={setEditorialGrid2} tenantId={tenantId} placeholder="Grid Image 2 URL" />
                  <ImageUploadInput value={editorialGrid3} onChange={setEditorialGrid3} tenantId={tenantId} placeholder="Grid Image 3 URL" />
                  <ImageUploadInput value={editorialGrid4} onChange={setEditorialGrid4} tenantId={tenantId} placeholder="Grid Image 4 URL" />
                </div>
              </div>
            </div>

            {/* Featured Collections */}
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Featured Collections (3 Cards)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Collection 1</span>
                  <input type="text" value={col1Title} onChange={e => setCol1Title(e.target.value)} disabled={!canEdit} placeholder="Title (e.g. All Flats)" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                  <ImageUploadInput value={col1Image} onChange={setCol1Image} tenantId={tenantId} placeholder="Image URL / Photo" />
                </div>

                <div className="space-y-2 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Collection 2</span>
                  <input type="text" value={col2Title} onChange={e => setCol2Title(e.target.value)} disabled={!canEdit} placeholder="Title (e.g. Tote Bags)" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                  <ImageUploadInput value={col2Image} onChange={setCol2Image} tenantId={tenantId} placeholder="Image URL / Photo" />
                </div>

                <div className="space-y-2 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Collection 3</span>
                  <input type="text" value={col3Title} onChange={e => setCol3Title(e.target.value)} disabled={!canEdit} placeholder="Title (e.g. Sneakers)" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                  <ImageUploadInput value={col3Image} onChange={setCol3Image} tenantId={tenantId} placeholder="Image URL / Photo" />
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Customer Testimonials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Review 1</span>
                    <textarea value={t1Quote} onChange={e => setT1Quote(e.target.value)} disabled={!canEdit} placeholder="Quote content..." rows={3} className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white resize-none mb-1" />
                    <input type="text" value={t1Author} onChange={e => setT1Author(e.target.value)} disabled={!canEdit} placeholder="Author Name" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                    <input type="text" value={t1Product} onChange={e => setT1Product(e.target.value)} disabled={!canEdit} placeholder="Product Label (e.g. CLASSIC WALLET)" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-2" />
                  </div>
                  <ImageUploadInput value={t1Image} onChange={setT1Image} tenantId={tenantId} placeholder="Product Thumbnail Image URL" />
                </div>

                <div className="space-y-2 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Review 2</span>
                    <textarea value={t2Quote} onChange={e => setT2Quote(e.target.value)} disabled={!canEdit} placeholder="Quote content..." rows={3} className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white resize-none mb-1" />
                    <input type="text" value={t2Author} onChange={e => setT2Author(e.target.value)} disabled={!canEdit} placeholder="Author Name" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                    <input type="text" value={t2Product} onChange={e => setT2Product(e.target.value)} disabled={!canEdit} placeholder="Product Label (e.g. KESHI SLIDES)" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-2" />
                  </div>
                  <ImageUploadInput value={t2Image} onChange={setT2Image} tenantId={tenantId} placeholder="Product Thumbnail Image URL" />
                </div>

                <div className="space-y-2 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Review 3</span>
                    <textarea value={t3Quote} onChange={e => setT3Quote(e.target.value)} disabled={!canEdit} placeholder="Quote content..." rows={3} className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white resize-none mb-1" />
                    <input type="text" value={t3Author} onChange={e => setT3Author(e.target.value)} disabled={!canEdit} placeholder="Author Name" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                    <input type="text" value={t3Product} onChange={e => setT3Product(e.target.value)} disabled={!canEdit} placeholder="Product Label (e.g. EVERYDAY SNEAKERS)" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-2" />
                  </div>
                  <ImageUploadInput value={t3Image} onChange={setT3Image} tenantId={tenantId} placeholder="Product Thumbnail Image URL" />
                </div>
              </div>
            </div>

            {/* Lifestyle Banner */}
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Lifestyle Banner</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Background Image URL / Photo</label>
                  <ImageUploadInput value={lifestyleImage} onChange={setLifestyleImage} tenantId={tenantId} placeholder="Background URL / Photo" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">CTA Button Link</label>
                  <input type="text" value={lifestyleCtaLink} onChange={e => setLifestyleCtaLink(e.target.value)} disabled={!canEdit} placeholder="/shop" className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Lifestyle Headline Text (HTML Enabled)</label>
                  <textarea value={lifestyleText} onChange={e => setLifestyleText(e.target.value)} disabled={!canEdit} rows={2} placeholder="Where style meets <span class='text-brand-peach italic'>value</span>..." className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2 text-sm text-white resize-none" />
                </div>
              </div>
            </div>

            {/* Social Grid */}
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Social Feed Grid</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Section Title</label>
                  <input type="text" value={socialTitle} onChange={e => setSocialTitle(e.target.value)} disabled={!canEdit} placeholder="As Seen On @kbdf.ph" className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Social Handle</label>
                  <input type="text" value={socialHandle} onChange={e => setSocialHandle(e.target.value)} disabled={!canEdit} placeholder="@kbdf.ph" className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider block">Grid Post Images (5 URLs / Photos)</label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <ImageUploadInput value={socialImg1} onChange={setSocialImg1} tenantId={tenantId} placeholder="Post 1 URL" />
                  <ImageUploadInput value={socialImg2} onChange={setSocialImg2} tenantId={tenantId} placeholder="Post 2 URL" />
                  <ImageUploadInput value={socialImg3} onChange={setSocialImg3} tenantId={tenantId} placeholder="Post 3 URL" />
                  <ImageUploadInput value={socialImg4} onChange={setSocialImg4} tenantId={tenantId} placeholder="Post 4 URL" />
                  <ImageUploadInput value={socialImg5} onChange={setSocialImg5} tenantId={tenantId} placeholder="Post 5 URL" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SHIPPING RATES */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            
            {/* General Shipping Settings */}
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">General Shipping Configurations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Default Shipping Fee ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={defaultRate} 
                    onChange={e => setDefaultRate(Number(e.target.value))} 
                    disabled={!canEdit} 
                    placeholder="150" 
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" 
                  />
                  <p className="text-[10px] text-white/40">This rate applies if the customer selects an address outside of custom defined rates.</p>

                  <div className="grid grid-cols-2 gap-3 mt-2 border-t border-white/5 pt-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-white/65 text-[10px] font-semibold uppercase">Base Weight Limit (kg)</label>
                      <input 
                        type="number" 
                        value={defaultBaseWeight} 
                        onChange={e => setDefaultBaseWeight(Number(e.target.value))} 
                        disabled={!canEdit}
                        min="0"
                        step="0.1"
                        placeholder="1.0" 
                        className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-white/65 text-[10px] font-semibold uppercase">Extra Weight Fee (₱ / kg)</label>
                      <input 
                        type="number" 
                        value={defaultExtraWeightRate} 
                        onChange={e => setDefaultExtraWeightRate(Number(e.target.value))} 
                        disabled={!canEdit}
                        min="0"
                        placeholder="50" 
                        className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 border border-white/5 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={freeShippingEnabled} 
                      onChange={e => setFreeShippingEnabled(e.target.checked)} 
                      disabled={!canEdit} 
                      className="rounded bg-[#0f1117] border-white/10 text-brand-pink focus:ring-brand-pink w-4 h-4" 
                    />
                    Enable Free Shipping Threshold
                  </label>
                  {freeShippingEnabled && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <label className="text-white/60 text-[10px] font-medium uppercase">Minimum Order Total for Free Shipping ({currencySymbol})</label>
                      <input 
                        type="number" 
                        value={freeShippingMinAmount} 
                        onChange={e => setFreeShippingMinAmount(Number(e.target.value))} 
                        disabled={!canEdit} 
                        placeholder="5000" 
                        className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Location Rates */}
            <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
              <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Custom Region & Province Rates</h3>
              
              {/* Existing Custom Rates */}
              <div className="space-y-3">
                {shippingRates.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No custom location rates defined. All shipments will use the default shipping fee.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {shippingRates.map((rate, idx) => (
                      <div key={rate.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between border border-white/5 bg-[#0f1117]/40 p-4 rounded-xl gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold text-sm">{rate.name}</span>
                            <span className="bg-brand-pink/10 text-brand-pink text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Base: {currencySymbol}{rate.rate}
                            </span>
                            <span className="bg-white/5 text-white/60 text-[10px] px-2 py-0.5 rounded-full">
                              Up to {rate.base_weight !== undefined ? rate.base_weight : 1.0}kg
                            </span>
                            <span className="bg-white/5 text-white/60 text-[10px] px-2 py-0.5 rounded-full">
                              +{currencySymbol}{rate.extra_weight_rate !== undefined ? rate.extra_weight_rate : 50}/extra kg
                            </span>
                          </div>
                          <p className="text-[10px] text-white/40 mt-1 max-w-xl line-clamp-2">
                            Provinces: {rate.provinces.join(', ')}
                          </p>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => setShippingRates(shippingRates.filter(r => r.id !== rate.id))}
                            className="text-red-400 hover:text-red-500 font-bold text-xs uppercase tracking-wider border border-red-500/20 hover:border-red-500/50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Rate Form */}
              {canEdit && (
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <h4 className="text-white font-medium text-xs uppercase tracking-wider">Add Custom Location Rate</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-white/60 text-[10px] font-medium uppercase">Rate Name (e.g. Visayas)</label>
                      <input 
                        type="text" 
                        value={newRateName} 
                        onChange={e => setNewRateName(e.target.value)} 
                        placeholder="Visayas" 
                        className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-white/60 text-[10px] font-medium uppercase">Base Rate Amount ({currencySymbol})</label>
                      <input 
                        type="number" 
                        value={newRateValue} 
                        onChange={e => setNewRateValue(Number(e.target.value))} 
                        placeholder="200" 
                        className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-white/60 text-[10px] font-medium uppercase">Base Weight Limit (kg)</label>
                      <input 
                        type="number" 
                        value={newRateBaseWeight} 
                        onChange={e => setNewRateBaseWeight(Number(e.target.value))} 
                        min="0"
                        step="0.1"
                        placeholder="1.0" 
                        className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-white/60 text-[10px] font-medium uppercase">Extra Weight Fee (₱/kg)</label>
                      <input 
                        type="number" 
                        value={newRateExtraWeightRate} 
                        onChange={e => setNewRateExtraWeightRate(Number(e.target.value))} 
                        min="0"
                        placeholder="50" 
                        className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-[10px] font-medium uppercase">Select Provinces for this Rate</label>
                    
                    {/* Quick Selection Regions */}
                    <div className="flex flex-wrap gap-2 pb-2">
                      <button
                        type="button"
                        onClick={() => {
                          const luzon = ["Abra", "Albay", "Aurora", "Bataan", "Batanes", "Batangas", "Benguet", "Bulacan", "Cagayan", "Camarines Norte", "Camarines Sur", "Catanduanes", "Cavite", "Ifugao", "Ilocos Norte", "Ilocos Sur", "Isabela", "Kalinga", "La Union", "Laguna", "Marinduque", "Masbate", "Mountain Province", "Nueva Ecija", "Nueva Vizcaya", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal", "Romblon", "Sorsogon", "Tarlac", "Zambales"];
                          setNewRateProvinces([...new Set([...newRateProvinces, ...luzon])]);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 transition-all"
                      >
                        + Add All Luzon
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const visayas = ["Aklan", "Antique", "Biliran", "Bohol", "Capiz", "Cebu", "Eastern Samar", "Guimaras", "Iloilo", "Leyte", "Negros Occidental", "Negros Oriental", "Northern Samar", "Samar", "Siquijor", "Southern Leyte"];
                          setNewRateProvinces([...new Set([...newRateProvinces, ...visayas])]);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 transition-all"
                      >
                        + Add All Visayas
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const mindanao = ["Agusan del Norte", "Agusan del Sur", "Basilan", "Bukidnon", "Camiguin", "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Lanao del Norte", "Lanao del Sur", "Maguindanao", "Misamis Occidental", "Misamis Oriental", "Sarangani", "South Cotabato", "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur", "Tawi-Tawi", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"];
                          setNewRateProvinces([...new Set([...newRateProvinces, ...mindanao])]);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 transition-all"
                      >
                        + Add All Mindanao
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewRateProvinces([])}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/20 transition-all"
                      >
                        Clear Selection
                      </button>
                    </div>

                    {/* Provinces Checklist */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-white/10 rounded-xl p-3 bg-[#0f1117] no-scrollbar">
                      {provincesList.map(prov => {
                        const checked = newRateProvinces.includes(prov.name);
                        return (
                          <div key={prov.code} className="flex items-center gap-2">
                            <input 
                              id={`prov-${prov.code}`}
                              type="checkbox" 
                              checked={checked} 
                              onChange={() => {
                                if (checked) {
                                  setNewRateProvinces(newRateProvinces.filter(p => p !== prov.name));
                                } else {
                                  setNewRateProvinces([...newRateProvinces, prov.name]);
                                }
                              }}
                              className="rounded bg-[#0f1117] border-white/10 text-brand-pink focus:ring-brand-pink w-3.5 h-3.5"
                            />
                            <label htmlFor={`prov-${prov.code}`} className="text-xs text-white/70 hover:text-white cursor-pointer select-none">
                              {prov.name}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!newRateName.trim() || newRateValue < 0 || newRateProvinces.length === 0}
                    onClick={() => {
                      const newRate = {
                        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
                        name: newRateName.trim(),
                        rate: newRateValue,
                        base_weight: newRateBaseWeight,
                        extra_weight_rate: newRateExtraWeightRate,
                        provinces: newRateProvinces
                      };
                      setShippingRates([...shippingRates, newRate]);
                      setNewRateName('');
                      setNewRateValue(0);
                      setNewRateBaseWeight(1.0);
                      setNewRateExtraWeightRate(50);
                      setNewRateProvinces([]);
                    }}
                    className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                  >
                    Add Rate to Policy
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
