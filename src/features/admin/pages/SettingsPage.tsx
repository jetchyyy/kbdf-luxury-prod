import { useState, useEffect } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { Save, AlertCircle, Layout, PhoneCall, Image as ImageIcon, Settings } from 'lucide-react';
import { ImageUploadInput } from '../components/ImageUploadInput';

export function SettingsPage() {
  const { tenant } = useAdminUser();
  const { canEdit } = usePermissions('settings');

  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'hero' | 'homepage'>('branding');

  // Tab 1: Branding
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2f4065');
  const [accentColor, setAccentColor] = useState('#fb7a90');
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  const [timezone, setTimezone] = useState('Asia/Manila');

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

  // Testimonials (2 items)
  const [t1Quote, setT1Quote] = useState('');
  const [t1Author, setT1Author] = useState('');
  const [t1Image, setT1Image] = useState('');
  const [t2Quote, setT2Quote] = useState('');
  const [t2Author, setT2Author] = useState('');
  const [t2Image, setT2Image] = useState('');

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

      const settings = (tenant.store_settings as any) || {};
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      
      const hours = settings.hours || {};
      setMonFriHours(hours.monday_friday || '10:00 AM - 9:00 PM');
      setSatHours(hours.saturday || '10:00 AM - 10:00 PM');
      setSunHours(hours.sunday || '11:00 AM - 8:00 PM');

      // Homepage Settings
      const homepage = settings.homepage || {};
      setAnnouncementText(homepage.announcement_text || 'Free Shipping for Orders Over $500');

      const hero = homepage.hero || {};
      setHeroTitle(hero.title || 'Payday Special Offer');
      setHeroImageUrl(hero.image_url || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop');
      setHeroCtaText(hero.cta_text || 'Shop Now');
      setHeroCtaLink(hero.cta_link || '/shop');

      const editorial = homepage.editorial || {};
      setEditorialTitle(editorial.title || 'New In');
      setEditorialSubtitle(editorial.subtitle || 'Discover the latest arrivals');
      setEditorialBannerImage(editorial.banner_image || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1200');
      setEditorialCtaText(editorial.cta_text || 'Shop Now');
      setEditorialCtaLink(editorial.cta_link || '/shop');
      
      const gridImages = editorial.grid_images || [];
      setEditorialGrid1(gridImages[0] || 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600');
      setEditorialGrid2(gridImages[1] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600');
      setEditorialGrid3(gridImages[2] || 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600');
      setEditorialGrid4(gridImages[3] || 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600');

      const cols = homepage.featured_collections || [];
      setCol1Title(cols[0]?.title || 'All Flats');
      setCol1Image(cols[0]?.image_url || 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800');
      setCol2Title(cols[1]?.title || 'Tote Bags');
      setCol2Image(cols[1]?.image_url || 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800');
      setCol3Title(cols[2]?.title || 'Sneakers');
      setCol3Image(cols[2]?.image_url || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800');

      const tests = homepage.testimonials || [];
      setT1Quote(tests[0]?.quote || 'The bag is absolutely gorgeous! It arrived in perfect condition and the packaging was so luxurious. Will definitely order again.');
      setT1Author(tests[0]?.author || 'Sarah T.');
      setT1Image(tests[0]?.image_url || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200');

      setT2Quote(tests[1]?.quote || 'Excellent transaction. The preloved condition of the watches here is unparalleled. Authentic and premium.');
      setT2Author(tests[1]?.author || 'John D.');
      setT2Image(tests[1]?.image_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200');

      const lifestyle = homepage.lifestyle || {};
      setLifestyleImage(lifestyle.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000');
      setLifestyleText(lifestyle.text || 'Where style meets <span class="text-brand-peach italic">value</span> - shoes, bags, and wallets that make you stand out.');
      setLifestyleCtaText(lifestyle.cta_text || 'Shop Now');
      setLifestyleCtaLink(lifestyle.cta_link || '/shop');

      const social = homepage.social || {};
      setSocialTitle(social.title || 'As Seen On @kbdf.ph');
      setSocialHandle(social.handle || '@kbdf.ph');
      
      const socImgs = social.images || [];
      setSocialImg1(socImgs[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400');
      setSocialImg2(socImgs[1] || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400');
      setSocialImg3(socImgs[2] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400');
      setSocialImg4(socImgs[3] || 'https://images.unsplash.com/photo-1485230895905-ef0e1261d15c?w=400');
      setSocialImg5(socImgs[4] || 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400');
    }
  }, [tenant]);

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
        homepage: {
          announcement_text: announcementText.trim(),
          hero: {
            title: heroTitle.trim(),
            image_url: heroImageUrl.trim(),
            cta_text: heroCtaText.trim(),
            cta_link: heroCtaLink.trim(),
          },
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
            { quote: t1Quote.trim(), author: t1Author.trim(), image_url: t1Image.trim() },
            { quote: t2Quote.trim(), author: t2Author.trim(), image_url: t2Image.trim() },
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
        }
      };

      const { error } = await supabase
        .from('tenants')
        .update({
          name: name.trim(),
          logo_url: logoUrl.trim() || null,
          primary_color: primaryColor,
          accent_color: accentColor,
          currency_symbol: currencySymbol.trim(),
          timezone,
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
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Store Settings</h2>
          <p className="text-white/40 text-xs mt-0.5">Customize your storefront branding, layout details, operating hours, and banner configurations.</p>
        </div>

        {canEdit && (
          <button
            type="submit"
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
                  placeholder="https://images.unsplash.com/photo-..."
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
                    placeholder="https://images.unsplash.com/photo-..."
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Review 1</span>
                  <textarea value={t1Quote} onChange={e => setT1Quote(e.target.value)} disabled={!canEdit} placeholder="Quote content..." rows={2} className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white resize-none mb-1" />
                  <input type="text" value={t1Author} onChange={e => setT1Author(e.target.value)} disabled={!canEdit} placeholder="Author Name" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                  <ImageUploadInput value={t1Image} onChange={setT1Image} tenantId={tenantId} placeholder="Product Thumbnail Image URL / Photo" />
                </div>

                <div className="space-y-2 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Review 2</span>
                  <textarea value={t2Quote} onChange={e => setT2Quote(e.target.value)} disabled={!canEdit} placeholder="Quote content..." rows={2} className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white resize-none mb-1" />
                  <input type="text" value={t2Author} onChange={e => setT2Author(e.target.value)} disabled={!canEdit} placeholder="Author Name" className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-1" />
                  <ImageUploadInput value={t2Image} onChange={setT2Image} tenantId={tenantId} placeholder="Product Thumbnail Image URL / Photo" />
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

      </div>
    </form>
  );
}
