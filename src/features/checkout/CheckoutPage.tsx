import { useState, useEffect } from 'react';
import { useCart } from '../cart/CartContext';
import { useTenant } from '../../core/context/TenantContext';
import { supabase, TENANT_ID } from '../../lib/supabase/supabaseClient';
import { LOCATION_PRESETS } from '../cart/locationData';
import { ImageUploadInput } from '../admin/components/ImageUploadInput';
import { useUserAuth } from '../../core/context/UserAuthContext';
import { useNotification } from '../../core/context/NotificationContext';
import { Check, X, Clipboard, CreditCard, ShoppingBag, MapPin, Truck, ChevronRight, Download, Loader2, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'qr' | 'bank_transfer' | 'cod' | 'custom';
  account_name: string | null;
  account_number: string | null;
  qr_code_url: string | null;
  instructions: string | null;
}

export function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { tenant } = useTenant();
  const { user, signIn, signUp } = useUserAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // Checkout Auth decision: 'guest' | 'auth' | null
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'auth' | null>(user ? 'auth' : null);
  
  // Login form states inside Checkout
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [trackingCode, setTrackingCode] = useState('');

  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [discountAmt, setDiscountAmt] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const calculateDiscount = (promo: any, subtotal: number) => {
    if (promo.discount_type === 'percentage') {
      return (subtotal * promo.discount_value) / 100;
    } else {
      return promo.discount_value;
    }
  };

  useEffect(() => {
    if (appliedPromo) {
      const discount = calculateDiscount(appliedPromo, cartTotal);
      setDiscountAmt(Math.min(discount, cartTotal));
    } else {
      setDiscountAmt(0);
    }
  }, [appliedPromo, cartTotal]);

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    setIsApplyingPromo(true);
    try {
      const codeClean = promoCodeInput.trim().toUpperCase();
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('code', codeClean)
        .single();

      if (error || !data) {
        showError('Invalid promo code. Please check spelling.');
        setAppliedPromo(null);
        return;
      }

      if (!data.is_active) {
        showError('This promo code is no longer active.');
        setAppliedPromo(null);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        showError('This promo code has expired.');
        setAppliedPromo(null);
        return;
      }

      if (data.max_uses !== null && data.used_count >= data.max_uses) {
        showError('This promo code has reached its usage limit.');
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(data);
      showSuccess(`Promo code ${data.code} applied successfully!`);
    } catch (err: any) {
      console.error(err);
      showError('Failed to apply promo code.');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setDiscountAmt(0);
  };

  // Step 1: Customer Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fbLink, setFbLink] = useState('');

  // Step 1: Address Details
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  // Custom (Other) Text inputs
  const [customProvince, setCustomProvince] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customBarangay, setCustomBarangay] = useState('');

  // Step 2: Delivery Option
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'pickup'>('standard');

  // Step 3: Payment Option
  const [selectedMethodId, setSelectedMethodId] = useState<string>('walk_in');
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState('');

  // Currency Symbol
  const currencySymbol = tenant?.currency_symbol || '₱';
  const tenantId = tenant?.id || TENANT_ID || '';

  // Prefill details if user changes
  useEffect(() => {
    if (user) {
      setCheckoutMode('auth');
      setEmail(user.email || '');
      
      const fullName = user.user_metadata?.full_name || '';
      if (fullName) {
        const parts = fullName.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
    }
  }, [user]);

  // Load Admin payment methods
  useEffect(() => {
    if (tenantId) {
      supabase
        .from('payment_methods')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .then(({ data }: any) => {
          if (data) setPaymentMethods(data);
        });
    }
  }, [tenantId]);

  const authPasswordCriteria = [
    { label: "At least 6 characters", met: authPassword.length >= 6 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(authPassword) },
    { label: "At least one number", met: /[0-9]/.test(authPassword) },
    { label: "At least one special symbol (e.g. @, #, $, !)", met: /[^A-Za-z0-9]/.test(authPassword) }
  ];
  const allAuthCriteriaMet = authPasswordCriteria.every(c => c.met);

  // Handle local Auth submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || (authTab === 'register' && (!authName || !authConfirmPassword))) {
      setAuthError('Please fill in all inputs.');
      return;
    }

    if (authTab === 'register') {
      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }
      if (!allAuthCriteriaMet) {
        setAuthError('Please satisfy all password complexity requirements.');
        return;
      }
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      if (authTab === 'login') {
        await signIn(authEmail, authPassword);
      } else {
        await signUp(authEmail, authPassword, authName);
        showSuccess('Verification email sent! You can continue checkout.');
        setAuthTab('login');
        setAuthName('');
        setAuthPassword('');
        setAuthConfirmPassword('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle province change
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setCity('');
    setBarangay('');
  };

  // Handle city change
  const handleCityChange = (val: string) => {
    setCity(val);
    setBarangay('');
  };

  // Get active Cities based on selected Province
  const activeCities = province && LOCATION_PRESETS[province] 
    ? Object.keys(LOCATION_PRESETS[province].cities) 
    : [];

  // Get active Barangays based on selected City
  const activeBarangays = province && city && LOCATION_PRESETS[province]?.cities[city]
    ? LOCATION_PRESETS[province].cities[city]
    : [];

  const finalProvince = province === 'Other' ? customProvince : province;
  const finalCity = province === 'Other' ? customCity : city;
  const finalBarangay = province === 'Other' ? customBarangay : barangay;

  // Selected Payment Method Object
  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethodId);

  // Validate fields for Step 1
  const isStep1Valid = () => {
    const isContactValid = firstName.trim() && lastName.trim() && email.trim() && phone.trim();
    const isAddressPresetValid = province && province !== 'Other' && city && barangay && streetAddress.trim();
    const isAddressCustomValid = province === 'Other' && customProvince.trim() && customCity.trim() && customBarangay.trim() && streetAddress.trim();
    return isContactValid && (isAddressPresetValid || isAddressCustomValid);
  };

  // Validate fields for Step 3
  const isStep3Valid = () => {
    if (selectedMethodId === 'walk_in') return true;
    if (selectedPaymentMethod?.type === 'cod') return true;
    return true;
  };

  // Order Placement
  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsPlacing(true);

    try {
      // 1. Generate Tracking Code: TRK-[Timestamp]-[Random]
      const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `TRK-${Date.now().toString().slice(-6)}-${randStr}`;

      const orderPayload = {
        tenant_id: tenantId,
        customer_id: user?.id || null, // Link customer if authenticated!
        tracking_number: code,
        customer_first_name: firstName.trim(),
        customer_last_name: lastName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        customer_fb_link: fbLink.trim() || null,
        shipping_province: finalProvince.trim(),
        shipping_city: finalCity.trim(),
        shipping_barangay: finalBarangay.trim(),
        shipping_street: streetAddress.trim(),
        shipping_landmark: landmark.trim() || null,
        delivery_method: deliveryMethod,
        payment_method_id: selectedMethodId === 'walk_in' ? null : selectedMethodId,
        payment_method_type: selectedMethodId === 'walk_in' ? 'walk_in' : (selectedPaymentMethod?.type || 'custom'),
        proof_of_payment_url: proofOfPaymentUrl || null,
        subtotal: cartTotal,
        shipping_fee: 0,
        total: Math.max(0, cartTotal - discountAmt),
        promo_code_id: appliedPromo ? appliedPromo.id : null,
        discount_amount: discountAmt,
        status: 'pending_verification',
        notes: ''
      };

      // 2. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      // Increment promo usage counter if a promo was used
      if (appliedPromo) {
        await supabase.rpc('increment_promo_code_usage', { promo_code_id: appliedPromo.id });
      }

      // 3. Insert Order Items
      const itemsPayload = items.map(item => ({
        order_id: orderData.id,
        item_id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // 4. Cleanup & Proceed
      setTrackingCode(code);
      clearCart();
      setStep(5);
    } catch (err: any) {
      console.error('Failed to create order:', err);
      showError('Order Placement Failed: ' + (err.message || err));
    } finally {
      setIsPlacing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    showSuccess('Tracking number copied to clipboard!');
  };

  if (items.length === 0 && step !== 5) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-surface-white flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-12 h-12 text-brand-pink mb-4" strokeWidth={1} />
        <h2 className="text-xl font-serif text-typography-primary mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-typography-muted mb-6 uppercase tracking-wider">Please add items to your cart before checking out.</p>
        <Link to="/shop" className="bg-brand-navy hover:bg-brand-pink text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold transition-all">Go Shop</Link>
      </div>
    );
  }

  // STEP 0: Auth Decision Screen (Renders if user not logged in and hasn't chosen guest mode)
  if (!user && checkoutMode === null) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-surface-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif text-typography-primary mb-2">Secure Checkout</h2>
            <p className="text-xs uppercase tracking-widest text-typography-muted font-bold">Choose how you want to complete your order</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto items-stretch">
            {/* Guest Checkout Card */}
            <div className="border border-surface-light hover:border-brand-pink rounded-3xl p-8 bg-surface-offWhite flex flex-col justify-between transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif text-typography-primary">Checkout as Guest</h3>
                <p className="text-xs text-typography-muted">You can place your order instantly. You will receive a tracking number to query status updates later.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setCheckoutMode('guest')}
                className="w-full bg-brand-navy hover:bg-brand-pink text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all mt-8"
              >
                Continue as Guest
              </button>
            </div>

            {/* Login Checkout Card */}
            <div className="border border-surface-light hover:border-brand-pink rounded-3xl p-8 bg-surface-offWhite flex flex-col justify-between transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif text-typography-primary">Log In or Register</h3>
                <p className="text-xs text-typography-muted">Save your orders automatically. You can track your purchase history directly under your profile dashboard.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setCheckoutMode('auth')}
                className="w-full bg-gradient-to-r from-[#fb7a90] to-[#f16881] hover:opacity-90 text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all mt-8"
              >
                Sign In to Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renders the Login Form inside Checkout if selected auth and not yet logged in
  if (!user && checkoutMode === 'auth') {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-surface-white">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif text-typography-primary mb-2">
              {authTab === 'login' ? 'Sign In to Checkout' : 'Create Account'}
            </h2>
            <p className="text-xs uppercase tracking-widest text-typography-muted font-bold">
              {authTab === 'login' ? 'Access your prefilled shipping profiles' : 'Register to save order history'}
            </p>
          </div>

          {authError && (
            <div className="text-red-500 bg-red-50 border border-red-200/50 p-4 rounded-xl flex items-center gap-2 text-xs mb-6">
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5 bg-surface-offWhite border border-surface-light p-6 rounded-2xl">
            {authTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-typography-primary">Full Name *</label>
                <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} required placeholder="Jane Doe" className="w-full bg-white border border-surface-light rounded-xl px-4 py-2.5 text-sm text-typography-primary outline-none focus:border-brand-pink" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-typography-primary">Email Address *</label>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required placeholder="jane.doe@example.com" className="w-full bg-white border border-surface-light rounded-xl px-4 py-2.5 text-sm text-typography-primary outline-none focus:border-brand-pink" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-typography-primary">Password *</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-white border border-surface-light rounded-xl px-4 py-2.5 text-sm text-typography-primary outline-none focus:border-brand-pink" />
              {authTab === 'register' && (
                <div className="mt-2 space-y-1 bg-white border border-surface-light rounded-xl p-3 text-[10px]">
                  <span className="font-bold text-typography-primary uppercase tracking-wider block mb-1">Password Requirements:</span>
                  {authPasswordCriteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-semibold">
                      {c.met ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-typography-muted/40 flex-shrink-0" />
                      )}
                      <span className={c.met ? "text-emerald-600 line-through opacity-70" : "text-typography-muted"}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {authTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-typography-primary">Confirm Password *</label>
                <input type="password" value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-white border border-surface-light rounded-xl px-4 py-2.5 text-sm text-typography-primary outline-none focus:border-brand-pink" />
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-brand-navy hover:bg-brand-pink text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {authTab === 'login' ? 'Sign In' : 'Register'}
            </button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-light"></div>
              </div>
              <span className="relative bg-surface-offWhite px-3 text-[10px] uppercase text-typography-muted font-bold tracking-widest">Or</span>
            </div>

            <button 
              type="button" 
              onClick={() => showInfo("Google Login is coming soon! Please sign in or register using your Email Address and Password.")}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-surface-offWhite border border-surface-light text-typography-primary py-3 text-xs font-bold rounded-xl transition-all"
            >
              Google Login (Coming Soon)
            </button>
          </form>

          <div className="mt-8 flex justify-between items-center text-xs">
            <button onClick={() => setCheckoutMode('guest')} className="text-typography-muted hover:text-brand-pink font-semibold">Continue as Guest instead</button>
            <button 
              onClick={() => setAuthTab(authTab === 'login' ? 'register' : 'login')} 
              className="text-brand-pink hover:text-brand-navy font-bold border-b border-brand-pink pb-0.5"
            >
              {authTab === 'login' ? 'Register Account' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Wizard Progress Stepper */}
        {step < 5 && (
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-12 border-b border-surface-light pb-6 overflow-x-auto no-scrollbar">
            <button onClick={() => setStep(1)} className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${step >= 1 ? 'text-brand-pink' : 'text-typography-muted'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">1</span> Contact & Address
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-typography-muted flex-shrink-0" />
            <button onClick={() => isStep1Valid() && setStep(2)} disabled={!isStep1Valid()} className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${step >= 2 ? 'text-brand-pink' : 'text-typography-muted'} disabled:opacity-50`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">2</span> Delivery
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-typography-muted flex-shrink-0" />
            <button onClick={() => isStep1Valid() && setStep(3)} disabled={!isStep1Valid()} className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${step >= 3 ? 'text-brand-pink' : 'text-typography-muted'} disabled:opacity-50`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">3</span> Payment
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-typography-muted flex-shrink-0" />
            <button onClick={() => isStep1Valid() && isStep3Valid() && setStep(4)} disabled={!isStep1Valid() || !isStep3Valid()} className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${step >= 4 ? 'text-brand-pink' : 'text-typography-muted'} disabled:opacity-50`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">4</span> Review
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT: Stepped Inputs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* STEP 1: CONTACT DETAILS & SHIPPING */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif text-typography-primary flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-pink" strokeWidth={1.5} /> Contact & Shipping Details
                  </h2>
                  <p className="text-[10px] tracking-wider text-typography-muted uppercase mt-1">Please fill in your primary details below</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">First Name *</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Jane" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">Last Name *</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Doe" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">Email Address *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane.doe@example.com" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">Contact Number *</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+63 917 123 4567" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">Facebook Profile Link (Optional)</label>
                    <input type="url" value={fbLink} onChange={e => setFbLink(e.target.value)} placeholder="https://facebook.com/janedoe" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" />
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-light space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary">Shipping Address</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Province Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">Province *</label>
                      <select value={province} onChange={e => handleProvinceChange(e.target.value)} className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink">
                        <option value="">Select Province</option>
                        <option value="Metro Manila">Metro Manila</option>
                        <option value="Cebu">Cebu</option>
                        <option value="Davao">Davao</option>
                        <option value="Other">Other (Custom)</option>
                      </select>
                    </div>

                    {/* City Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">City / Municipality *</label>
                      {province === 'Other' ? (
                        <input type="text" value={customCity} onChange={e => setCustomCity(e.target.value)} placeholder="Cagayan de Oro" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink" />
                      ) : (
                        <select value={city} onChange={e => handleCityChange(e.target.value)} disabled={!province} className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink disabled:opacity-50">
                          <option value="">Select City</option>
                          {activeCities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </div>

                    {/* Barangay Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">Barangay *</label>
                      {province === 'Other' ? (
                        <input type="text" value={customBarangay} onChange={e => setCustomBarangay(e.target.value)} placeholder="Nazareth" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink" />
                      ) : (
                        <select value={barangay} onChange={e => setBarangay(e.target.value)} disabled={!city} className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink disabled:opacity-50">
                          <option value="">Select Barangay</option>
                          {activeBarangays.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      )}
                    </div>

                    {province === 'Other' && (
                      <div className="flex flex-col gap-1.5 sm:col-span-3">
                        <label className="text-[10px] font-bold uppercase text-typography-primary">Custom Province Name *</label>
                        <input type="text" value={customProvince} onChange={e => setCustomProvince(e.target.value)} placeholder="Misamis Oriental" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">Street Address / House No. *</label>
                      <textarea value={streetAddress} onChange={e => setStreetAddress(e.target.value)} rows={2} placeholder="Unit 4B, Emerald Condominium, St. Jude Street" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink resize-none" />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">Famous Landmark (Optional)</label>
                      <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Near Emerald Public Market / Behind Jollibee" className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button type="button" onClick={() => setStep(2)} disabled={!isStep1Valid()} className="flex items-center gap-2 bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-6 py-3 font-semibold text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERY OPTIONS */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif text-typography-primary flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-pink" strokeWidth={1.5} /> Choose Delivery Option
                  </h2>
                  <p className="text-[10px] tracking-wider text-typography-muted uppercase mt-1">Select your preferred delivery route</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => { setStep(3); setDeliveryMethod('standard'); }} className={`border rounded-2xl p-6 text-left transition-all ${deliveryMethod === 'standard' ? 'border-brand-pink bg-brand-pink/5' : 'border-surface-light hover:border-brand-navy'}`}>
                    <span className="font-bold text-sm text-typography-primary block">Standard Delivery</span>
                    <span className="text-xs text-typography-muted block mt-1">Shipped straight to your doorstep.</span>
                    <span className="text-xs font-semibold text-brand-pink block mt-4 uppercase">Free Shipping</span>
                  </button>

                  <button type="button" onClick={() => { setStep(3); setDeliveryMethod('pickup'); }} className={`border rounded-2xl p-6 text-left transition-all ${deliveryMethod === 'pickup' ? 'border-brand-pink bg-brand-pink/5' : 'border-surface-light hover:border-brand-navy'}`}>
                    <span className="font-bold text-sm text-typography-primary block">Store Pick-up</span>
                    <span className="text-xs text-typography-muted block mt-1">Pick up directly at our physical branch.</span>
                    <span className="text-xs font-semibold text-[#fb7a90] block mt-4 uppercase">Ready in 24 Hours</span>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-surface-light">
                  <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold uppercase tracking-wider text-typography-muted hover:text-brand-navy">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-6 py-3 font-semibold text-xs uppercase tracking-widest transition-all">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif text-typography-primary flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-pink" strokeWidth={1.5} /> Choose Payment Method
                  </h2>
                  <p className="text-[10px] tracking-wider text-typography-muted uppercase mt-1">Select payment option configured for this store</p>
                </div>

                <div className="space-y-3">
                  {/* Default Walk In */}
                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedMethodId === 'walk_in' ? 'border-brand-pink bg-brand-pink/5' : 'border-surface-light'}`}>
                    <input type="radio" name="paymentMethod" checked={selectedMethodId === 'walk_in'} onChange={() => setSelectedMethodId('walk_in')} className="mt-1" />
                    <div>
                      <span className="font-bold text-sm text-typography-primary block">Walk in (Cash on Pick-up / Cash on Delivery)</span>
                      <span className="text-xs text-typography-muted">Pay with cash upon acquiring the item.</span>
                    </div>
                  </label>

                  {paymentMethods.map(method => (
                    <label key={method.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedMethodId === method.id ? 'border-brand-pink bg-brand-pink/5' : 'border-surface-light'}`}>
                      <input type="radio" name="paymentMethod" checked={selectedMethodId === method.id} onChange={() => setSelectedMethodId(method.id)} className="mt-1" />
                      <div className="flex-1">
                        <span className="font-bold text-sm text-typography-primary block uppercase">{method.name} ({method.type.replace('_', ' ')})</span>
                        {method.instructions && <p className="text-xs text-typography-muted mt-1">{method.instructions}</p>}
                        {method.account_name && <p className="text-xs text-typography-primary mt-2"><strong>Account Name:</strong> {method.account_name}</p>}
                        {method.account_number && <p className="text-xs text-typography-primary"><strong>Account Number:</strong> {method.account_number}</p>}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Direct QR display and upload receipts */}
                {selectedMethodId !== 'walk_in' && selectedPaymentMethod && (selectedPaymentMethod.type === 'qr' || selectedPaymentMethod.type === 'bank_transfer') && (
                  <div className="border border-surface-light bg-surface-offWhite p-6 rounded-2xl space-y-6">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary border-b border-surface-light pb-2">Digital Transfer Details</h3>
                    
                    {selectedPaymentMethod.qr_code_url && (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-48 h-48 bg-white border border-surface-light p-2 rounded-xl">
                          <img src={selectedPaymentMethod.qr_code_url} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                        <a 
                          href={selectedPaymentMethod.qr_code_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          download="payment-qr.jpg" 
                          className="flex items-center gap-2 text-xs text-brand-pink hover:text-brand-navy transition-all font-semibold"
                        >
                          <Download className="w-4 h-4" /> Download QR Code Image
                        </a>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-typography-primary block">Upload Proof of Payment (Receipt Photo)</label>
                      <ImageUploadInput
                        value={proofOfPaymentUrl}
                        onChange={setProofOfPaymentUrl}
                        tenantId={tenantId}
                        placeholder="Select receipt file..."
                      />
                      <p className="text-[10px] text-typography-muted italic">Compresses image in browser and uploads directly to verify your payment quicker.</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-surface-light">
                  <button type="button" onClick={() => setStep(2)} className="text-xs font-semibold uppercase tracking-wider text-typography-muted hover:text-brand-navy">Back</button>
                  <button type="button" onClick={() => setStep(4)} className="flex items-center gap-2 bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-6 py-3 font-semibold text-xs uppercase tracking-widest transition-all">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: ORDER REVIEW */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif text-typography-primary flex items-center gap-2">
                    <Check className="w-5 h-5 text-brand-pink" strokeWidth={1.5} /> Review and Place Order
                  </h2>
                  <p className="text-[10px] tracking-wider text-typography-muted uppercase mt-1">Please confirm all checkout details are correct</p>
                </div>

                <div className="border border-surface-light rounded-2xl p-6 space-y-4 text-sm text-typography-primary">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <strong className="block text-[10px] uppercase text-typography-muted mb-1">Customer Info</strong>
                      <p className="font-semibold">{firstName} {lastName}</p>
                      <p>{email}</p>
                      <p>{phone}</p>
                      {fbLink && <a href={fbLink} target="_blank" rel="noreferrer" className="text-brand-pink text-xs hover:underline mt-1 block">Facebook Profile</a>}
                    </div>

                    <div>
                      <strong className="block text-[10px] uppercase text-typography-muted mb-1">Shipping Details</strong>
                      <p className="font-semibold">{deliveryMethod === 'pickup' ? 'Store Pick-up' : 'Standard Delivery'}</p>
                      {deliveryMethod !== 'pickup' && (
                        <>
                          <p>{streetAddress}</p>
                          <p>{finalBarangay}, {finalCity}</p>
                          <p>{finalProvince}</p>
                          {landmark && <p className="text-xs italic mt-1 text-typography-muted">Landmark: {landmark}</p>}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-surface-light grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <strong className="block text-[10px] uppercase text-typography-muted mb-1">Payment Method</strong>
                      <p className="font-semibold uppercase">
                        {selectedMethodId === 'walk_in' ? 'Walk in (Cash / Pick-up)' : selectedPaymentMethod?.name}
                      </p>
                      {proofOfPaymentUrl ? (
                        <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">Proof Uploaded</span>
                      ) : selectedMethodId !== 'walk_in' ? (
                        <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">No Proof Uploaded</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-surface-light">
                  <button type="button" onClick={() => setStep(3)} className="text-xs font-semibold uppercase tracking-wider text-typography-muted hover:text-brand-navy">Back</button>
                  <button 
                    type="button" 
                    onClick={handlePlaceOrder}
                    disabled={isPlacing} 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-8 py-3.5 font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isPlacing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                      </>
                    ) : (
                      'Confirm & Place Order'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: ORDER SUCCESS SCREEN */}
            {step === 5 && (
              <div className="border border-surface-light rounded-3xl p-8 md:p-12 text-center bg-surface-offWhite flex flex-col items-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                  <Check className="w-8 h-8" strokeWidth={2.5} />
                </div>

                <div>
                  <h2 className="text-2xl font-serif text-typography-primary">Order Placed Successfully!</h2>
                  <p className="text-xs text-typography-muted uppercase tracking-widest mt-1">Thank you for your business</p>
                </div>

                <div className="bg-white border border-surface-light p-6 rounded-2xl max-w-md w-full space-y-4">
                  <span className="text-[10px] uppercase font-bold text-typography-muted tracking-widest block">Your Tracking Number</span>
                  <div className="flex items-center justify-center gap-3 bg-surface-offWhite p-4 rounded-xl border border-surface-light">
                    <span className="font-mono text-lg font-bold text-typography-primary tracking-widest">{trackingCode}</span>
                    <button onClick={copyToClipboard} className="text-brand-pink hover:text-brand-navy transition-all" title="Copy tracking code">
                      <Clipboard className="w-5 h-5" />
                    </button>
                  </div>
                  {user ? (
                    <div className="text-left text-xs text-emerald-500 bg-emerald-50 border border-emerald-200/50 p-4 rounded-xl">
                      <strong className="block text-[10px] uppercase tracking-wider">Order Linked to Profile:</strong>
                      <p>Since you are logged in, this order has been saved to your profile history. You can view its progress anytime under your <strong>My Orders</strong> history page.</p>
                    </div>
                  ) : (
                    <div className="text-left text-xs text-red-500 bg-red-50 border border-red-200/50 p-4 rounded-xl space-y-1">
                      <strong className="block text-[10px] uppercase tracking-wider">⚠️ CRITICAL REQUIREMENT:</strong>
                      <p>Please write down, screenshot, or copy this tracking number now! You will need it to query your order updates on the <strong>Track Order</strong> page.</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  <Link to={user ? "/orders" : "/track"} className="bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-8 py-3.5 font-bold text-xs uppercase tracking-widest transition-all">
                    {user ? "View My Orders" : "Track Order"}
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Order Summary */}
          {step < 5 && (
            <div className="bg-surface-offWhite border border-surface-light rounded-2xl p-6 h-max space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary border-b border-surface-light pb-2">Order Summary</h3>
              
              <div className="divide-y divide-surface-light max-h-80 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedSize || ''}`} className="flex gap-3 py-3 items-center">
                    <div className="w-12 h-16 bg-surface-light flex-shrink-0 rounded overflow-hidden">
                      <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-typography-primary truncate">{item.title}</p>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <p className="text-[10px] text-typography-muted">Qty: {item.quantity}</p>
                        {item.selectedSize && (
                          <p className="text-[10px] font-semibold text-brand-pink">Size: {item.selectedSize}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-typography-primary">{currencySymbol}{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-surface-light space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-typography-muted">Subtotal</span>
                  <span className="font-semibold text-typography-primary">{currencySymbol}{cartTotal.toLocaleString()}</span>
                </div>

                {/* Promo Code Entry / Discount Display */}
                {appliedPromo ? (
                  <div className="flex justify-between text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-xl items-center">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Promo ({appliedPromo.code})</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">-{currencySymbol}{discountAmt.toLocaleString()}</span>
                      <button 
                        onClick={handleRemovePromo} 
                        className="text-emerald-600 hover:text-red-500 font-bold text-xs bg-white/20 w-4 h-4 rounded-full flex items-center justify-center transition-colors" 
                        title="Remove promo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="bg-white border border-surface-light rounded-xl px-3 py-2 text-xs text-typography-primary outline-none focus:border-brand-pink flex-1 uppercase placeholder:text-typography-muted"
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      disabled={isApplyingPromo || !promoCodeInput.trim()}
                      className="bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-4 py-2 font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-50"
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-typography-muted">Delivery</span>
                  <span className="font-semibold text-brand-pink uppercase">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-4 border-t border-surface-light">
                  <span>Total</span>
                  <span className="text-typography-primary">{currencySymbol}{Math.max(0, cartTotal - discountAmt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
export default CheckoutPage;
