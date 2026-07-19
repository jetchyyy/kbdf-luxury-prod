import { useEffect, useState } from "react";
import { useUserAuth } from "../../core/context/UserAuthContext";
import { useTenant } from "../../core/context/TenantContext";
import { useNotification } from "../../core/context/NotificationContext";
import { supabase } from "../../lib/supabase/supabaseClient";
import { 
  Check, Calendar, ShoppingBag, MapPin, CreditCard, ChevronDown, 
  ChevronUp, AlertCircle, Loader2, Coins, ArrowUpRight, Upload, X, CheckCircle,
  Heart, Info, User
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { ImageUploadInput } from "../admin/components/ImageUploadInput";
import { useFavorites } from "../favorites/FavoritesContext";
import { fetchProvinces, fetchCities, fetchBarangays } from "../cart/locationData";
import type { PSGCLocation } from "../cart/locationData";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

interface Order {
  id: string;
  tenant_id: string;
  tracking_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_barangay: string;
  shipping_street: string;
  shipping_landmark: string | null;
  delivery_method: string;
  payment_method_type: string;
  proof_of_payment_url: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: 'pending_verification' | 'verified' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  notes: string | null;
  pickup_location: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface LeewayAccount {
  id: string;
  tenant_id: string;
  customer_id: string;
  order_id: string;
  total_amount: number;
  down_payment_amount: number;
  remaining_balance: number;
  payment_schedule: 'weekly' | 'monthly' | 'flexible';
  status: 'active' | 'completed' | 'defaulted';
  created_at: string;
  order?: {
    tracking_number: string;
    order_items: { title: string }[];
  } | null;
}

interface LeewayPayment {
  id: string;
  tenant_id: string;
  leeway_account_id: string;
  amount: number;
  proof_of_payment_url: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  payment_type: 'down_payment' | 'installment';
  admin_notes: string | null;
  created_at: string;
  leeway_account?: {
    order?: {
      tracking_number: string;
    } | null;
  } | null;
}

export function CustomerOrdersPage() {
  const { user, isLoading: authLoading } = useUserAuth();
  const { tenant } = useTenant();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const { setCartItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'orders' | 'leeway' | 'favorites' | 'profile'>('orders');
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [receiptUrlMap, setReceiptUrlMap] = useState<{ [orderId: string]: string }>({});

  // Profile state
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileFbLink, setProfileFbLink] = useState('');
  const [profileProvince, setProfileProvince] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileBarangay, setProfileBarangay] = useState('');
  const [profileStreetAddress, setProfileStreetAddress] = useState('');
  const [profileLandmark, setProfileLandmark] = useState('');

  // PSGC Dynamic Locations
  const [provincesList, setProvincesList] = useState<PSGCLocation[]>([]);
  const [citiesList, setCitiesList] = useState<PSGCLocation[]>([]);
  const [barangaysList, setBarangaysList] = useState<string[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [profileCustomProvince, setProfileCustomProvince] = useState('');
  const [profileCustomCity, setProfileCustomCity] = useState('');
  const [profileCustomBarangay, setProfileCustomBarangay] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'favorites') {
      setActiveTab('favorites');
    } else if (tab === 'leeway') {
      setActiveTab('leeway');
    } else if (tab === 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.id) {
      setLoadingProfile(true);
      supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }: { data: any; error: any }) => {
          if (error) {
            console.error("Error loading profile:", error);
          } else if (data) {
            if (data.first_name) setProfileFirstName(data.first_name);
            if (data.last_name) setProfileLastName(data.last_name);
            if (data.phone) setProfilePhone(data.phone);
            if (data.fb_link) setProfileFbLink(data.fb_link);
            if (data.province) setProfileProvince(data.province);
            if (data.city) setProfileCity(data.city);
            if (data.barangay) setProfileBarangay(data.barangay);
            if (data.street_address) setProfileStreetAddress(data.street_address);
            if (data.landmark) setProfileLandmark(data.landmark);
            if (data.custom_province) setProfileCustomProvince(data.custom_province);
            if (data.custom_city) setProfileCustomCity(data.custom_city);
            if (data.custom_barangay) setProfileCustomBarangay(data.custom_barangay);
          }
          setLoadingProfile(false);
        });
    }
  }, [user]);

  // Fetch initial provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingLocations(true);
      const data = await fetchProvinces();
      setProvincesList(data);
      setLoadingLocations(false);
    };
    loadProvinces();
  }, []);

  // Synchronize province name from database to code and fetch cities
  useEffect(() => {
    if (provincesList.length > 0 && profileProvince && profileProvince !== 'Other' && !selectedProvinceCode) {
      const match = provincesList.find(p => p.name.toLowerCase() === profileProvince.toLowerCase());
      if (match) {
        setSelectedProvinceCode(match.code);
        fetchCities(match.code).then(citiesData => {
          setCitiesList(citiesData);
        });
      }
    }
  }, [provincesList, profileProvince, selectedProvinceCode]);

  // Synchronize city name from database to code and fetch barangays
  useEffect(() => {
    if (citiesList.length > 0 && profileCity && !selectedCityCode) {
      const match = citiesList.find(c => c.name.toLowerCase() === profileCity.toLowerCase());
      if (match) {
        setSelectedCityCode(match.code);
        fetchBarangays(match.code).then(brgys => {
          setBarangaysList(brgys);
        });
      }
    }
  }, [citiesList, profileCity, selectedCityCode]);

  const handleProfileProvinceChange = async (code: string) => {
    if (!code) {
      setProfileProvince('');
      setSelectedProvinceCode('');
      setCitiesList([]);
      setProfileCity('');
      setSelectedCityCode('');
      setBarangaysList([]);
      setProfileBarangay('');
      return;
    }

    if (code === 'Other') {
      setProfileProvince('Other');
      setSelectedProvinceCode('Other');
      setCitiesList([]);
      setProfileCity('');
      setSelectedCityCode('');
      setBarangaysList([]);
      setProfileBarangay('');
      return;
    }

    const prov = provincesList.find(p => p.code === code);
    if (prov) {
      setProfileProvince(prov.name);
      setSelectedProvinceCode(code);
      setProfileCity('');
      setSelectedCityCode('');
      setBarangaysList([]);
      setProfileBarangay('');

      const citiesData = await fetchCities(code);
      setCitiesList(citiesData);
    }
  };

  const handleProfileCityChange = async (code: string) => {
    if (!code) {
      setProfileCity('');
      setSelectedCityCode('');
      setBarangaysList([]);
      setProfileBarangay('');
      return;
    }

    const c = citiesList.find(item => item.code === code);
    if (c) {
      setProfileCity(c.name);
      setSelectedCityCode(code);
      setProfileBarangay('');

      const brgys = await fetchBarangays(code);
      setBarangaysList(brgys);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const cleanedPhone = profilePhone.replace(/\D/g, '');
    if (cleanedPhone.length !== 11) {
      showError("Contact number must be exactly 11 digits.");
      return;
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .upsert({
          id: user.id,
          tenant_id: tenant?.id || '',
          first_name: profileFirstName.trim(),
          last_name: profileLastName.trim(),
          email: user.email || '',
          phone: profilePhone.trim(),
          fb_link: profileFbLink.trim() || null,
          province: profileProvince,
          city: profileCity,
          barangay: profileBarangay,
          street_address: profileStreetAddress.trim(),
          landmark: profileLandmark.trim() || null,
          custom_province: profileCustomProvince.trim(),
          custom_city: profileCustomCity.trim(),
          custom_barangay: profileCustomBarangay.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      showSuccess("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      showError("Failed to update profile: " + (err.message || err));
    } finally {
      setSavingProfile(false);
    }
  };

  // Leeway states
  const [leewayAccounts, setLeewayAccounts] = useState<LeewayAccount[]>([]);
  const [leewayPayments, setLeewayPayments] = useState<LeewayPayment[]>([]);
  const [loadingLeeway, setLoadingLeeway] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [leewayRequestStatus, setLeewayRequestStatus] = useState<'not_requested' | 'pending' | 'approved' | 'rejected' | null>(null);
  const [leewayRequestedItems, setLeewayRequestedItems] = useState<any[]>([]);
  const [isRequestingLeeway, setIsRequestingLeeway] = useState(false);

  // Leeway payment submission modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [submitReceiptUrl, setSubmitReceiptUrl] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Favorites states
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedFavIds, setSelectedFavIds] = useState<string[]>([]);
  const [selectedFavSizes, setSelectedFavSizes] = useState<{ [itemId: string]: string }>({});
  const [isCheckingOutBulk, setIsCheckingOutBulk] = useState(false);


  const handleToggleSelect = (itemId: string) => {
    setSelectedFavIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSizeChange = (itemId: string, size: string) => {
    setSelectedFavSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  const handleCheckoutSelected = async () => {
    if (selectedFavIds.length === 0) {
      showError('Please select at least one item to check out.');
      return;
    }

    setIsCheckingOutBulk(true);
    try {
      const selectedItems = favorites.filter(fav => selectedFavIds.includes(fav.item_id));
      
      // Validate sizes
      for (const fav of selectedItems) {
        const hasSizes = fav.product.sizes && fav.product.sizes.length > 0;
        if (hasSizes) {
          const chosenSize = selectedFavSizes[fav.item_id];
          if (!chosenSize) {
            showError(`Please select a size for ${fav.product.title}`);
            setIsCheckingOutBulk(false);
            return;
          }
        }
      }

      // Check stock status in real-time
      const { data: dbProducts, error } = await supabase
        .from('items')
        .select('*')
        .in('id', selectedFavIds);

      if (error) throw error;

      const cartItemsToSet = selectedItems.map(fav => {
        const dbProd = dbProducts.find((p: any) => p.id === fav.item_id);
        const hasSizes = fav.product.sizes && fav.product.sizes.length > 0;
        const selectedSize = hasSizes ? selectedFavSizes[fav.item_id] : null;

        if (dbProd) {
          if (dbProd.stock_status === 'out_of_stock' || dbProd.quantity <= 0) {
            throw new Error(`${fav.product.title} is now out of stock.`);
          }
          if (hasSizes) {
            const sizeObj = dbProd.sizes?.find((s: any) => s.size === selectedSize);
            if (!sizeObj || sizeObj.quantity <= 0) {
              throw new Error(`Size ${selectedSize} for ${fav.product.title} is now out of stock.`);
            }
          }
        }

        return {
          id: fav.product.id,
          title: fav.product.title,
          price: fav.product.price,
          quantity: 1,
          selectedSize: selectedSize || null,
          image_urls: fav.product.image_urls,
          brand: fav.product.brand,
          stock_status: dbProd?.stock_status || fav.product.stock_status,
          stock_quantity: dbProd ? Number(dbProd.quantity) : fav.product.stock_quantity,
          sizes: dbProd?.sizes || fav.product.sizes,
          slug: fav.product.slug,
          description: fav.product.description || ''
        } as any;
      });

      setCartItems(cartItemsToSet);
      showSuccess('Selected favorites added to bag!');
      navigate('/checkout');
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to checkout selected items.');
    } finally {
      setIsCheckingOutBulk(false);
    }
  };

  const currencySymbol = tenant?.currency_symbol || '₱';

  useEffect(() => {
    if (user) {
      loadCustomerOrders();
    }
  }, [user]);

  useEffect(() => {
    if (user && tenant?.id) {
      loadCustomerLeewayData();
    }
  }, [user, tenant?.id]);

  // Load payment methods for downpayment/installment instructions
  useEffect(() => {
    if (tenant?.id) {
      supabase
        .from("payment_methods")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .then(({ data }: any) => {
          if (data) setPaymentMethods(data);
        });
    }
  }, [tenant]);

  const loadCustomerOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);

      // Initialize receipt URL inputs
      const initialMap: { [orderId: string]: string } = {};
      data?.forEach((o: Order) => {
        initialMap[o.id] = o.proof_of_payment_url || "";
      });
      setReceiptUrlMap(initialMap);
    } catch (err) {
      console.error("Error loading customer orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadCustomerLeewayData = async () => {
    if (!tenant?.id) return;
    setLoadingLeeway(true);
    try {
      
      const { data: requestData } = await supabase
        .from("leeway_requests")
        .select("status, requested_items")
        .eq("tenant_id", tenant.id)
        .eq("customer_id", user!.id)
        .maybeSingle();

      if (requestData) {
        const itemsList = requestData.requested_items || [];
        const mappedItems = itemsList.map((i: any) => ({
          ...i,
          status: i.status || requestData.status || 'pending'
        }));

        if (mappedItems.length > 0) {
          const itemIds = mappedItems.map((i: any) => i.id);
          const { data: products } = await supabase
            .from('items')
            .select('id, image_urls')
            .in('id', itemIds);

          if (products) {
            mappedItems.forEach((mi: any) => {
              const prod = products.find((p: any) => p.id === mi.id);
              if (prod) {
                mi.image_urls = prod.image_urls || [];
              }
            });
          }
        }

        setLeewayRequestStatus(requestData.status as any);
        setLeewayRequestedItems(mappedItems);
      } else {
        setLeewayRequestStatus('not_requested');
        setLeewayRequestedItems([]);
      }

      const { data: accountsData, error: accError } = await supabase
        .from("leeway_accounts")
        .select("*, order:orders(tracking_number, order_items(title))")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (accError) throw accError;
      setLeewayAccounts(accountsData || []);

      if (accountsData && accountsData.length > 0) {
        const accIds = accountsData.map((a: any) => a.id);
        const { data: paymentsData, error: payError } = await supabase
          .from("leeway_payments")
          .select("*, leeway_account:leeway_accounts(order:orders(tracking_number))")
          .in("leeway_account_id", accIds)
          .order("created_at", { ascending: false });

        if (payError) throw payError;
        setLeewayPayments(paymentsData || []);
      } else {
        setLeewayPayments([]);
      }
    } catch (err) {
      console.error("Error loading customer leeway data:", err);
    } finally {
      setLoadingLeeway(false);
    }
  };

  const handleRequestLeeway = async () => {
    if (!user || !tenant?.id) return;
    setIsRequestingLeeway(true);
    try {
      const { error } = await supabase
        .from("leeway_requests")
        .insert({
          tenant_id: tenant.id,
          customer_id: user.id,
          status: 'pending',
          customer_name: user.user_metadata?.full_name || user.email || 'Unknown',
          customer_email: user.email
        });

      if (error) throw error;
      setLeewayRequestStatus('pending');
      showSuccess("Leeway pre-approval request submitted successfully!");
    } catch (err: any) {
      console.error(err);
      showError("Failed to submit leeway request: " + (err.message || err));
    } finally {
      setIsRequestingLeeway(false);
    }
  };

  const [isCheckingOutLeeway, setIsCheckingOutLeeway] = useState(false);

  const handleCheckoutApprovedItems = async () => {
    setIsCheckingOutLeeway(true);
    try {
      const approvedItems = leewayRequestedItems.filter((i: any) => i.status === 'approved');
      if (approvedItems.length === 0) {
        throw new Error("No approved items found to checkout.");
      }

      const itemIds = approvedItems.map((i: any) => i.id);
      
      const { data: products, error } = await supabase
        .from('items')
        .select('*')
        .in('id', itemIds);

      if (error) throw error;
      if (!products || products.length === 0) {
        throw new Error("Approved items could not be loaded from store catalog. They may have been deleted or deactivated.");
      }

      const cartItemsToSet = approvedItems.map((reqItem: any) => {
        const product = products.find((p: any) => p.id === reqItem.id);
        if (!product) {
          return {
            id: reqItem.id,
            title: reqItem.title,
            price: reqItem.price,
            quantity: reqItem.quantity,
            selectedSize: reqItem.size,
            image_urls: [],
            slug: '',
            is_active: false
          } as any;
        }

        return {
          ...product,
          quantity: reqItem.quantity,
          selectedSize: reqItem.size
        };
      });

      setCartItems(cartItemsToSet);
      setIsRedirectModalOpen(true);
    } catch (err: any) {
      console.error(err);
      showError("Failed to prepare leeway checkout: " + (err.message || err));
    } finally {
      setIsCheckingOutLeeway(false);
    }
  };

  const handleUpdateReceipt = async (orderId: string) => {
    const newUrl = receiptUrlMap[orderId];
    try {
      const { error } = await supabase
        .from("orders")
        .update({ proof_of_payment_url: newUrl })
        .eq("id", orderId);

      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, proof_of_payment_url: newUrl } : o));
      showSuccess("Payment receipt uploaded successfully!");
    } catch (err: any) {
      showError("Failed to update receipt: " + (err.message || err));
    }
  };

  const handleSubmitLeewayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      showError("Please select a leeway plan.");
      return;
    }
    if (paymentAmount <= 0) {
      showError("Amount must be greater than 0.");
      return;
    }
    if (!submitReceiptUrl) {
      showError("Please upload a proof of payment receipt.");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const payload = {
        tenant_id: tenant!.id,
        leeway_account_id: selectedAccountId,
        amount: Number(paymentAmount),
        proof_of_payment_url: submitReceiptUrl,
        status: 'pending_verification',
        payment_type: 'installment',
      };

      const { error } = await supabase
        .from("leeway_payments")
        .insert(payload);

      if (error) throw error;

      showSuccess("Installment payment submitted successfully! Awaiting verification.");
      setPaymentAmount(0);
      setSubmitReceiptUrl("");
      setIsSubmitModalOpen(false);
      loadCustomerLeewayData();
    } catch (err: any) {
      console.error(err);
      showError("Failed to submit leeway payment: " + (err.message || err));
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // Timeline helpers
  const getStepsForOrder = (order: Order) => {
    const isPickup = order.delivery_method?.toLowerCase().trim() === 'pickup';
    return [
      { key: 'pending_verification', label: 'Ordered' },
      { key: 'verified', label: 'Paid' },
      { key: 'processing', label: 'Processing' },
      { key: 'shipped', label: isPickup ? 'Ready for Pick Up' : 'Shipped' },
      { key: 'completed', label: isPickup ? 'Picked Up' : 'Completed' }
    ];
  };

  const getStepIndex = (order: Order) => {
    if (order.status === 'cancelled') return -1;
    const orderSteps = getStepsForOrder(order);
    return orderSteps.findIndex(s => s.key === order.status);
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'bg-amber-50 text-amber-500 border-amber-200';
      case 'verified':
        return 'bg-blue-50 text-blue-500 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-500 border-purple-200';
      case 'shipped':
        return 'bg-brand-pink/5 text-brand-pink border-brand-pink/20';
      case 'completed':
        return 'bg-emerald-50 text-emerald-500 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-500 border-red-200';
      default:
        return 'bg-surface-light text-typography-muted border-surface-light';
    }
  };

  // Outstanding balance calculation
  const totalOutstandingBalance = leewayAccounts
    .filter(a => a.status === 'active')
    .reduce((sum, curr) => sum + Number(curr.remaining_balance), 0);

  if (authLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-surface-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-surface-white flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-12 h-12 text-brand-pink mb-4" strokeWidth={1} />
        <h2 className="text-xl font-serif text-typography-primary mb-2">Access Denied</h2>
        <p className="text-xs text-typography-muted mb-6 uppercase tracking-wider">Please sign in to view your account dashboard.</p>
        <Link to="/auth" className="bg-brand-navy hover:bg-brand-pink text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold transition-all">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-serif text-typography-primary mb-3">
            Account Dashboard
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-typography-muted font-bold">
            Manage your purchase records and active leeway schedules
          </p>
        </div>

        {/* Tab Toggles */}
        <div className="flex flex-wrap justify-center gap-8 border-b border-surface-light mb-12">
          <button
            onClick={() => {
              setActiveTab('orders');
              setSearchParams({});
            }}
            className={`pb-4 text-[10px] uppercase tracking-[0.15em] font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'orders' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-typography-muted hover:text-typography-primary hover:border-typography-primary/30'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Order History
          </button>
          <button
            onClick={() => {
              setActiveTab('leeway');
              setSearchParams({ tab: 'leeway' });
            }}
            className={`pb-4 text-[10px] uppercase tracking-[0.15em] font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'leeway' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-typography-muted hover:text-typography-primary hover:border-typography-primary/30'
            }`}
          >
            <Coins className="w-4 h-4" /> Leeway Installments
          </button>
          <button
            onClick={() => {
              setActiveTab('favorites');
              setSearchParams({ tab: 'favorites' });
            }}
            className={`pb-4 text-[10px] uppercase tracking-[0.15em] font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'favorites' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-typography-muted hover:text-typography-primary hover:border-typography-primary/30'
            }`}
          >
            <Heart className="w-4 h-4" /> Favorites List
          </button>
          <button
            onClick={() => {
              setActiveTab('profile');
              setSearchParams({ tab: 'profile' });
            }}
            className={`pb-4 text-[10px] uppercase tracking-[0.15em] font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'profile' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-typography-muted hover:text-typography-primary hover:border-typography-primary/30'
            }`}
          >
            <User className="w-4 h-4" /> Profile Details
          </button>
        </div>

        {/* Tab 1: Order History */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-surface-offWhite border border-surface-light rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 bg-surface-offWhite rounded-3xl border border-surface-light">
                <div className="w-16 h-16 rounded-full bg-surface-white border border-surface-light flex items-center justify-center mb-6 shadow-sm">
                  <ShoppingBag className="w-6 h-6 text-brand-navy" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-serif text-typography-primary mb-3">Your Collection is Empty</h3>
                <p className="text-[10px] text-typography-muted uppercase tracking-[0.2em] mb-10 text-center max-w-sm font-bold leading-relaxed">
                  You haven't placed any orders yet. Discover our latest arrivals and begin your luxury experience.
                </p>
                <Link to="/shop" className="border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-10 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors">
                  Explore Collections
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  const activeIndex = getStepIndex(order);

                  return (
                    <div key={order.id} className="border border-surface-light rounded-2xl overflow-hidden bg-surface-offWhite transition-all">
                      
                      {/* Accordion toggle header */}
                      <button 
                        onClick={() => toggleExpandOrder(order.id)}
                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 text-left gap-4 hover:bg-surface-light/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="font-mono text-sm font-bold text-typography-primary tracking-wider">{order.tracking_number}</span>
                          <div className="flex items-center gap-3 text-xs text-typography-muted">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            <span>•</span>
                            <span>{order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}</span>
                            {order.payment_method_type === 'leeway' && (
                              <span className="bg-brand-pink/10 text-brand-pink text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">Leeway</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="font-bold text-sm text-typography-primary block">{currencySymbol}{order.total.toLocaleString()}</span>
                            <span className={`px-2 py-0.5 text-[10px] rounded-full border uppercase font-bold tracking-wider ${getBadgeStyle(order.status)}`}>
                              {order.delivery_method?.toLowerCase().trim() === 'pickup' && order.status === 'shipped' 
                                ? 'Ready for Pick Up' 
                                : order.delivery_method?.toLowerCase().trim() === 'pickup' && order.status === 'completed'
                                ? 'Picked Up'
                                : order.status.replace('_', ' ')}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-typography-muted" /> : <ChevronDown className="w-5 h-5 text-typography-muted" />}
                        </div>
                      </button>                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="border-t border-surface-light p-6 md:p-8 bg-white space-y-10 animate-fadeIn">
                          
                          {order.status === 'cancelled' ? (
                            <div className="bg-red-50/50 border border-red-100 text-red-600 rounded-none p-4 text-center text-xs tracking-wide">
                              This order was cancelled. Please coordinate with administrators.
                            </div>
                          ) : (
                            <div className="relative pt-4 pb-6 px-1 md:px-0">
                              {/* Horizontal line */}
                              <div className="absolute top-7 md:top-8 left-[10%] right-[10%] h-[1px] bg-surface-light z-0" />
                              
                              <div className="flex flex-row justify-between items-start relative w-full gap-1 md:gap-0">
                                {getStepsForOrder(order).map((step, idx) => {
                                  const isCompleted = idx <= activeIndex;
                                  const isCurrent = idx === activeIndex;

                                  return (
                                    <div key={step.key} className="flex flex-col items-center text-center relative z-10 flex-1 w-0">
                                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-all bg-white mb-2 md:mb-3 shrink-0 ${
                                        isCompleted 
                                          ? 'border-brand-navy text-brand-navy shadow-sm' 
                                          : 'border-surface-light text-typography-muted'
                                      }`}>
                                        {isCompleted ? <Check className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} /> : <span className="text-[10px] md:text-xs font-medium">{idx + 1}</span>}
                                      </div>
                                      <span className={`text-[7px] md:text-[9px] uppercase tracking-wider md:tracking-widest leading-tight ${
                                        isCurrent ? 'text-brand-navy font-bold' : 'text-typography-muted font-medium'
                                      }`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {order.notes && (
                            <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-none p-5 text-xs text-typography-primary flex flex-col gap-2">
                              <span className="text-[9px] uppercase font-bold text-brand-navy tracking-widest flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5" /> Store Update Notes
                              </span>
                              <p className="font-medium text-typography-primary leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 text-xs text-typography-primary border-t border-surface-light pt-8">
                            
                            {/* Address details */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-navy border-b border-surface-light pb-2 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} /> Delivery Details
                              </h4>
                              <div className="bg-surface-offWhite/50 p-5 border border-surface-light/50">
                                <p className="font-serif text-sm text-typography-primary mb-3">
                                  {order.delivery_method?.toLowerCase().trim() === 'pickup' ? 'Store Pick Up' : `${order.delivery_method} Delivery`}
                                </p>
                                {order.delivery_method?.toLowerCase().trim() === 'pickup' ? (
                                  <div className="space-y-1">
                                    <strong className="block text-[9px] uppercase tracking-[0.2em] text-typography-muted mb-2">Pick Up Location Address:</strong>
                                    <p className="font-sans leading-relaxed text-typography-primary">
                                      {order.pickup_location || (tenant?.store_settings as any)?.address || "123 Luxury Avenue, Metro Manila, Philippines"}
                                    </p>
                                    <p className="text-[10px] text-brand-navy mt-4 italic font-medium">Please present your tracking ID to the store staff when claiming.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-1 text-typography-muted leading-relaxed">
                                    <p className="text-typography-primary font-medium">{order.shipping_street}</p>
                                    <p>{order.shipping_barangay}, {order.shipping_city}</p>
                                    <p>{order.shipping_province}</p>
                                    {order.shipping_landmark && <p className="mt-3 text-typography-primary italic bg-surface-light/30 px-3 py-2">Landmark: {order.shipping_landmark}</p>}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Payment Route */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-navy border-b border-surface-light pb-2 flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5" strokeWidth={1.5} /> Payment Route
                              </h4>
                              <div className="bg-surface-offWhite/50 p-5 border border-surface-light/50 flex flex-col justify-center h-[calc(100%-2.25rem)]">
                                <p className="font-serif text-sm text-typography-primary uppercase mb-4">{order.payment_method_type.replace('_', ' ')}</p>
                                
                                {order.status === 'pending_verification' ? (
                                  <div className="space-y-3">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-typography-muted block">
                                      {order.proof_of_payment_url ? 'Update payment receipt photo' : 'Upload payment receipt photo'}
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                      <div className="flex-1">
                                        <ImageUploadInput
                                          value={receiptUrlMap[order.id] || ""}
                                          onChange={url => setReceiptUrlMap(prev => ({ ...prev, [order.id]: url }))}
                                          tenantId={order.tenant_id}
                                          placeholder="Select receipt file..."
                                          theme="light"
                                        />
                                      </div>
                                      <button 
                                        onClick={() => handleUpdateReceipt(order.id)}
                                        disabled={receiptUrlMap[order.id] === order.proof_of_payment_url}
                                        className="bg-brand-navy hover:bg-brand-navy/90 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap self-stretch sm:self-start disabled:opacity-50"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : order.proof_of_payment_url && (
                                  <div className="w-24 h-24 bg-surface-offWhite border border-surface-light p-1">
                                    <img src={order.proof_of_payment_url} alt="Proof" className="w-full h-full object-cover mix-blend-multiply" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Items list */}
                            <div className="lg:col-span-2 space-y-4 mt-2">
                              <h4 className="text-[10px] uppercase font-bold tracking-widest text-typography-muted border-b border-surface-light pb-2">
                                Items Purchased
                              </h4>
                              <div className="divide-y divide-surface-light/60">
                                {order.order_items.map(item => (
                                  <div key={item.id} className="flex justify-between items-center py-4">
                                    <div className="space-y-1.5">
                                      <p className="font-serif text-sm text-typography-primary">{item.title}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-typography-muted uppercase tracking-[0.15em]">Qty: {item.quantity}</span>
                                        {item.size && (
                                          <span className="bg-surface-offWhite border border-surface-light px-1.5 py-0.5 rounded text-[9px] font-semibold text-typography-muted uppercase tracking-wider">
                                            Size: {item.size}
                                          </span>
                                        )}
                                        {item.color && (
                                          <span className="bg-brand-pink/5 border border-brand-pink/20 px-1.5 py-0.5 rounded text-[9px] font-semibold text-brand-pink uppercase tracking-wider">
                                            Color: {item.color}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="font-bold font-sans text-sm text-brand-navy">
                                      {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Leeway Installments */}
        {activeTab === 'leeway' && (
          <div className="space-y-8 animate-fadeIn">
            
            {leewayAccounts.length > 0 && (
              <div className="bg-gradient-to-r from-brand-navy to-[#1f2d47] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-pink">Cumulative Outstanding Balance</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide">{currencySymbol}{totalOutstandingBalance.toLocaleString()}</h2>
                  <p className="text-xs text-white/60">Across all active leeway installment plans</p>
                </div>
                
                {leewayAccounts.some(a => a.status === 'active') && (
                  <button
                    onClick={() => {
                      const activeAccs = leewayAccounts.filter(a => a.status === 'active');
                      if (activeAccs.length > 0) {
                        setSelectedAccountId(activeAccs[0].id);
                      }
                      setIsSubmitModalOpen(true);
                    }}
                    className="bg-brand-pink hover:bg-white hover:text-brand-navy text-white rounded-2xl px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all self-start sm:self-auto relative z-10 flex items-center gap-2 shadow-lg"
                  >
                    <Upload className="w-4 h-4" /> Submit Payment Receipt
                  </button>
                )}

                <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-brand-pink/5 -mr-10 -mt-10 blur-xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 w-36 h-36 rounded-full bg-brand-peach/5 -ml-10 -mb-10 blur-xl pointer-events-none" />
              </div>
            )}

            {/* Leeway Pre-Approval Requests Dashboard */}
            <div className="border border-surface-light bg-surface-offWhite rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-light pb-4">
                <div>
                  <h3 className="text-sm font-serif font-bold text-typography-primary flex items-center gap-2">
                    <Coins className="w-4 h-4 text-brand-pink" /> Leeway Pre-Approval Requests
                  </h3>
                  <p className="text-[11px] text-typography-muted mt-0.5 uppercase tracking-wider">
                    Item-by-item installment plan authorization status
                  </p>
                </div>
                {leewayRequestedItems.some(i => i.status === 'approved') && (
                  <button
                    onClick={handleCheckoutApprovedItems}
                    disabled={isCheckingOutLeeway}
                    className="bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-5 py-2.5 text-[9px] uppercase tracking-widest font-bold transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isCheckingOutLeeway && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Checkout Approved Items
                  </button>
                )}
              </div>

              {loadingLeeway ? (
                <div className="py-6 flex justify-center">
                  <Loader2 className="w-6 h-6 text-brand-pink animate-spin" />
                </div>
              ) : leewayRequestedItems.length === 0 ? (
                <div className="text-center py-6 space-y-4">
                  <Coins className="w-10 h-10 text-typography-muted/40 mx-auto" strokeWidth={1} />
                  <p className="text-xs text-typography-muted max-w-md mx-auto uppercase tracking-wider leading-relaxed">
                    You haven't requested leeway pre-approval for any items yet. You can request leeway for items in your shopping bag during the checkout process.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-surface-light max-w-3xl">
                  {leewayRequestedItems.map((item: any, idx: number) => {
                    let statusLabel = 'Review Pending';
                    let statusClass = 'bg-amber-50 text-amber-600 border-amber-200';
                    if (item.status === 'approved') {
                      statusLabel = 'Approved';
                      statusClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                    } else if (item.status === 'rejected') {
                      statusLabel = 'Declined';
                      statusClass = 'bg-red-50 text-red-500 border-red-200';
                    }

                    const imageUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;

                    return (
                      <div key={idx} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-surface-light overflow-hidden border border-surface-light shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand-navy/5">
                                <Coins className="w-5 h-5 text-brand-navy/30" />
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-typography-primary truncate">{item.title}</h4>
                            <p className="text-[10px] text-typography-muted mt-0.5 uppercase tracking-wider">
                              {item.size ? `Size: ${item.size} • ` : ''}Qty: {item.quantity} • Price: {currencySymbol}{Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {loadingLeeway ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-28 bg-surface-offWhite border border-surface-light rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : leewayAccounts.length === 0 ? null : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary mb-4">Active Installment Plans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leewayAccounts.map(account => {
                      const orderItems = account.order?.order_items || [];
                      const itemsTitle = orderItems.map(i => i.title).join(", ") || "KBDF Luxury Items";
                      const progressPercent = account.total_amount > 0 
                        ? ((account.total_amount - account.remaining_balance) / account.total_amount) * 100 
                        : 0;

                      return (
                        <div key={account.id} className="border border-surface-light bg-surface-offWhite p-6 rounded-2xl space-y-4 relative flex flex-col justify-between hover:border-brand-pink transition-all">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-xs font-bold text-typography-primary tracking-wider">{account.order?.tracking_number}</span>
                              <span className={`px-2 py-0.5 text-[8px] rounded uppercase font-bold border ${
                                account.status === 'active' 
                                  ? 'bg-blue-50 text-blue-500 border-blue-200' 
                                  : 'bg-emerald-50 text-emerald-500 border-emerald-200'
                              }`}>
                                {account.status}
                              </span>
                            </div>
                            
                            <div>
                              <p className="font-bold text-sm text-typography-primary line-clamp-1">{itemsTitle}</p>
                              <p className="text-[10px] text-typography-muted mt-0.5 capitalize">Schedule: {account.payment_schedule} plan</p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-surface-light">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-typography-muted">Paid Progress</span>
                              <span className="text-typography-primary">{currencySymbol}{(account.total_amount - account.remaining_balance).toLocaleString()} / {currencySymbol}{account.total_amount.toLocaleString()}</span>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full bg-surface-light h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-brand-pink h-full transition-all duration-500" 
                                style={{ width: `${progressPercent}%` }} 
                              />
                            </div>

                            <div className="flex justify-between items-end pt-1">
                              <div>
                                <span className="text-[9px] uppercase text-typography-muted block">Remaining Balance</span>
                                <span className="font-bold text-sm text-typography-primary">{currencySymbol}{account.remaining_balance.toLocaleString()}</span>
                              </div>

                              {account.status === 'active' && (
                                <button
                                  onClick={() => {
                                    setSelectedAccountId(account.id);
                                    setIsSubmitModalOpen(true);
                                  }}
                                  className="bg-brand-navy hover:bg-brand-pink text-white rounded-lg px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Pay Installment
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submitted Installments Verification logs */}
                <div className="pt-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary mb-4">Installment Payment Submissions</h3>
                  {leewayPayments.length === 0 ? (
                    <p className="text-xs text-typography-muted italic bg-surface-offWhite border border-surface-light p-4 rounded-xl">No payments have been submitted yet.</p>
                  ) : (
                    <div className="border border-surface-light rounded-2xl overflow-hidden bg-surface-offWhite">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-surface-light/40 border-b border-surface-light text-[9px] uppercase tracking-wider font-bold text-typography-muted">
                              <th className="p-4">Submit Date</th>
                              <th className="p-4">Tracking Number</th>
                              <th className="p-4">Amount Paid</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Receipt</th>
                              <th className="p-4">Verification Status</th>
                              <th className="p-4">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-light">
                            {leewayPayments.map(payment => {
                              let statusStyle = '';
                              if (payment.status === 'pending_verification') statusStyle = 'bg-amber-50 text-amber-500 border-amber-200';
                              else if (payment.status === 'verified') statusStyle = 'bg-emerald-50 text-emerald-500 border-emerald-200';
                              else statusStyle = 'bg-red-50 text-red-500 border-red-200';

                              return (
                                <tr key={payment.id} className="hover:bg-surface-light/20 transition-all text-typography-primary font-medium">
                                  <td className="p-4 whitespace-nowrap">{new Date(payment.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                                  <td className="p-4 font-mono font-bold">{payment.leeway_account?.order?.tracking_number}</td>
                                  <td className="p-4 font-bold">{currencySymbol}{payment.amount.toLocaleString()}</td>
                                  <td className="p-4 capitalize">
                                    <span className="text-[9px] font-bold">{payment.payment_type.replace('_', ' ')}</span>
                                  </td>
                                  <td className="p-4">
                                    <a 
                                      href={payment.proof_of_payment_url} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-brand-pink hover:underline font-bold inline-flex items-center gap-0.5"
                                    >
                                      View <ArrowUpRight className="w-3 h-3" />
                                    </a>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-wider ${statusStyle}`}>
                                      {payment.status.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="p-4 text-typography-muted italic text-[11px] max-w-[180px] truncate" title={payment.admin_notes || ""}>
                                    {payment.admin_notes || '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Favorites List */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            {favorites.length === 0 ? (
              <div className="border border-surface-light bg-surface-offWhite rounded-3xl p-12 text-center">
                <Heart className="w-12 h-12 text-typography-muted/40 mx-auto mb-4" strokeWidth={1} />
                <h3 className="text-lg font-serif text-typography-primary">Your Favorites List is Empty</h3>
                <p className="text-xs text-typography-muted mt-1 uppercase tracking-wider mb-6">Heart items while browsing our collections to save them here.</p>
                <Link to="/shop" className="bg-brand-navy hover:bg-brand-pink text-white px-8 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-xl inline-block">Go Shopping</Link>
              </div>
            ) : (
              <div className="bg-white border border-surface-light/50">
                {/* Bulk Actions Header */}
                <div className="px-6 py-5 border-b border-surface-light flex items-center justify-between flex-wrap gap-4">
                  <label className="flex items-center gap-3 text-xs font-bold uppercase text-typography-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedFavIds.length > 0 && selectedFavIds.length === favorites.filter(f => {
                        const hasSizes = f.product.sizes && f.product.sizes.length > 0;
                        return f.product.stock_status !== 'out_of_stock' && f.product.stock_quantity !== 0 && (!hasSizes || (f.product.sizes && f.product.sizes.some(s => s.quantity > 0)));
                      }).length}
                      className="w-4 h-4 rounded-none border-typography-primary text-brand-navy focus:ring-0 focus:ring-offset-0 cursor-pointer transition-colors"
                    />
                    Select All In-Stock
                  </label>
                </div>

                {/* Items List */}
                <div className="divide-y divide-surface-light">
                  {favorites.map((fav) => {
                    const hasSizes = fav.product.sizes && fav.product.sizes.length > 0;
                    const isItemOutOfStock = 
                      fav.product.stock_status === 'out_of_stock' || 
                      fav.product.stock_quantity === 0 || 
                      (hasSizes && (!fav.product.sizes || fav.product.sizes.every(s => s.quantity <= 0)));

                    const selectedSize = selectedFavSizes[fav.item_id] || "";

                    return (
                      <div key={fav.id} className="p-6 flex items-start md:items-center gap-6 flex-wrap md:flex-nowrap hover:bg-surface-offWhite/30 transition-colors group">
                        {/* Checkbox */}
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            disabled={!!isItemOutOfStock}
                            checked={selectedFavIds.includes(fav.item_id)}
                            onChange={() => handleToggleSelect(fav.item_id)}
                            className="w-4 h-4 rounded-none border-typography-primary text-brand-navy focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2 md:mt-0"
                          />
                        </div>

                        {/* Image */}
                        <div className="w-24 h-32 md:w-28 md:h-36 bg-[#f8f5f2] shrink-0">
                          <img
                            src={fav.product.image_urls[0] || "/placeholder.jpg"}
                            alt={fav.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title, Brand, Status */}
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <p className="text-[10px] uppercase font-bold text-typography-muted tracking-[0.2em]">{fav.product.brand}</p>
                          <h4 className="font-serif text-base text-typography-primary group-hover:text-brand-navy transition-colors">
                            <Link to={`/product/${fav.product.slug}`}>{fav.product.title}</Link>
                          </h4>
                          
                          {/* Stock Status Badge */}
                          <div className="pt-2">
                            {isItemOutOfStock ? (
                              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-typography-muted">
                                In Stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Size Selector */}
                        <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-1">
                          {hasSizes ? (
                            <>
                              <label className="text-[10px] font-bold uppercase text-typography-primary tracking-widest mb-1">Size</label>
                              <div className="relative">
                                <select
                                  disabled={!!isItemOutOfStock}
                                  value={selectedSize}
                                  onChange={(e) => handleSizeChange(fav.item_id, e.target.value)}
                                  className="appearance-none bg-transparent border border-typography-primary rounded-none px-4 py-2.5 text-xs text-typography-primary outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy disabled:opacity-30 disabled:border-surface-light min-w-[140px] transition-all cursor-pointer"
                                >
                                <option value="">Select Size...</option>
                                {fav.product.sizes
                                  ?.filter(s => s.quantity > 0)
                                  .map(s => (
                                    <option key={s.size} value={s.size}>
                                      {s.size} ({s.quantity} left)
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-typography-primary">
                                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                              </div>
                            </>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-typography-primary tracking-widest">One Size</span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 text-right min-w-[100px] flex flex-col md:items-end justify-center">
                          <p className="text-sm font-bold text-typography-primary tracking-wider">
                            {currencySymbol}{fav.product.price.toLocaleString()}
                          </p>
                          {fav.product.original_price && (
                            <p className="text-[10px] text-typography-muted line-through tracking-wider mt-1">
                              {currencySymbol}{fav.product.original_price.toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Delete button */}
                        <div className="flex-shrink-0 md:ml-4">
                          <button
                            onClick={() => toggleFavorite(fav.product)}
                            className="text-[10px] uppercase font-bold tracking-widest text-typography-muted hover:text-typography-primary transition-colors underline underline-offset-4 decoration-typography-muted/30 hover:decoration-typography-primary"
                            title="Remove from favorites"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bulk Actions Footer */}
                <div className="px-6 py-5 bg-white border-t border-surface-light flex flex-col md:flex-row items-center justify-between gap-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-typography-muted">
                    {selectedFavIds.length} of {favorites.length} items selected
                  </span>
                  
                  <button
                    onClick={handleCheckoutSelected}
                    disabled={selectedFavIds.length === 0 || isCheckingOutBulk}
                    className="w-full md:w-auto px-10 py-3.5 bg-brand-navy hover:bg-brand-navy/90 text-white disabled:bg-surface-light disabled:text-typography-muted disabled:cursor-not-allowed rounded-none text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                  >
                    {isCheckingOutBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                    {isCheckingOutBulk ? 'Preparing...' : `Checkout Selected (${selectedFavIds.length})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-surface-light rounded-3xl p-6 md:p-8 shadow-sm max-w-2xl">
            <div className="border-b border-surface-light pb-4 mb-6">
              <h2 className="text-xl font-serif text-typography-primary flex items-center gap-2">
                <User className="w-5 h-5 text-brand-pink" strokeWidth={1.5} /> Profile Details
              </h2>
              <p className="text-[10px] tracking-wider text-typography-muted uppercase mt-1">Pre-fill your shipping address and contact details</p>
            </div>

            {loadingProfile ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">First Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={profileFirstName} 
                      onChange={e => setProfileFirstName(e.target.value)} 
                      placeholder="Jane" 
                      className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">Last Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={profileLastName} 
                      onChange={e => setProfileLastName(e.target.value)} 
                      placeholder="Doe" 
                      className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">Contact Number *</label>
                    <input 
                      type="tel" 
                      required 
                      maxLength={11}
                      pattern="\d{11}"
                      value={profilePhone} 
                      onChange={e => setProfilePhone(e.target.value.replace(/\D/g, ''))} 
                      placeholder="09171234567" 
                      title="Contact number must be exactly 11 digits"
                      className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-typography-primary">Facebook Profile Link (Optional)</label>
                    <input 
                      type="url" 
                      value={profileFbLink} 
                      onChange={e => setProfileFbLink(e.target.value)} 
                      placeholder="https://facebook.com/janedoe" 
                      className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-light space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary">Default Shipping Address</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Province Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">
                        Province * {loadingLocations && <span className="text-[9px] lowercase text-brand-pink font-normal">(loading...)</span>}
                      </label>
                      <select 
                        value={selectedProvinceCode || (profileProvince === 'Other' ? 'Other' : '')} 
                        onChange={e => handleProfileProvinceChange(e.target.value)} 
                        className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink"
                      >
                        <option value="">Select Province</option>
                        {provincesList.map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                        <option value="Other">Other (Custom)</option>
                      </select>
                    </div>

                    {/* City Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">City / Municipality *</label>
                      {profileProvince === 'Other' ? (
                        <input 
                          type="text" 
                          value={profileCustomCity} 
                          onChange={e => setProfileCustomCity(e.target.value)} 
                          placeholder="Cagayan de Oro" 
                          className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink" 
                        />
                      ) : (
                        <select 
                          value={selectedCityCode} 
                          onChange={e => handleProfileCityChange(e.target.value)} 
                          disabled={!profileProvince} 
                          className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink disabled:opacity-50"
                        >
                          <option value="">Select City</option>
                          {citiesList.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Barangay Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">Barangay *</label>
                      {profileProvince === 'Other' ? (
                        <input 
                          type="text" 
                          value={profileCustomBarangay} 
                          onChange={e => setProfileCustomBarangay(e.target.value)} 
                          placeholder="Nazareth" 
                          className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink" 
                        />
                      ) : (
                        <select 
                          value={profileBarangay} 
                          onChange={e => setProfileBarangay(e.target.value)} 
                          disabled={!profileCity} 
                          className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink disabled:opacity-50"
                        >
                          <option value="">Select Barangay</option>
                          {barangaysList.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {profileProvince === 'Other' && (
                      <div className="flex flex-col gap-1.5 sm:col-span-3">
                        <label className="text-[10px] font-bold uppercase text-typography-primary">Custom Province Name *</label>
                        <input 
                          type="text" 
                          value={profileCustomProvince} 
                          onChange={e => setProfileCustomProvince(e.target.value)} 
                          placeholder="Misamis Oriental" 
                          className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink" 
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">Street Address / House No. *</label>
                      <textarea 
                        value={profileStreetAddress} 
                        onChange={e => setProfileStreetAddress(e.target.value)} 
                        rows={2} 
                        placeholder="Unit 4B, Emerald Condominium, St. Jude Street" 
                        className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink resize-none" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase text-typography-primary">Famous Landmark (Optional)</label>
                      <input 
                        type="text" 
                        value={profileLandmark} 
                        onChange={e => setProfileLandmark(e.target.value)} 
                        placeholder="Near Emerald Public Market / Behind Jollibee" 
                        className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-light flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingProfile} 
                    className="bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving...
                      </>
                    ) : (
                      'Save Profile Details'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {/* Submit Payment Receipt Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-surface-light rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-8 animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-surface-light flex items-center justify-between">
              <h3 className="text-typography-primary font-serif text-lg">
                Submit Installment Payment
              </h3>
              <button 
                onClick={() => { setIsSubmitModalOpen(false); setSubmitReceiptUrl(""); setPaymentAmount(0); }} 
                className="text-typography-muted hover:text-typography-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitLeewayPayment} className="p-6 space-y-6 overflow-y-auto">
              
              {/* Account Plan Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-typography-primary">Select Installment Plan *</label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  required
                  className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary outline-none focus:border-brand-pink"
                >
                  <option value="">Choose a plan...</option>
                  {leewayAccounts
                    .filter(a => a.status === 'active')
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.order?.tracking_number} (Bal: {currencySymbol}{a.remaining_balance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              {/* Amount input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-typography-primary">Payment Amount (PHP) *</label>
                <input
                  type="number"
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(Math.max(0.01, Number(e.target.value)))}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 1500"
                  className="bg-surface-offWhite border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted/40 outline-none focus:border-brand-pink"
                />
              </div>

              {/* Digital payment instructions */}
              {paymentMethods.length > 0 && (
                <div className="border border-surface-light bg-surface-offWhite p-4 rounded-2xl space-y-4">
                  <span className="text-[10px] uppercase font-bold text-typography-primary tracking-widest block border-b border-surface-light pb-1.5">Transfer instructions</span>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {paymentMethods.map(m => (
                      <div key={m.id} className="text-xs text-typography-primary">
                        <p className="font-bold uppercase text-brand-pink">{m.name} ({m.type.replace('_', ' ')})</p>
                        {m.instructions && <p className="text-[11px] text-typography-muted mt-0.5">{m.instructions}</p>}
                        {m.account_name && <p className="text-[11px] mt-1"><strong>Name:</strong> {m.account_name}</p>}
                        {m.account_number && <p className="text-[11px]"><strong>Number:</strong> {m.account_number}</p>}
                        {m.qr_code_url && (
                          <a href={m.qr_code_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-brand-navy block mt-1 hover:underline">View QR Code image</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Receipt Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-typography-primary">Upload Transfer Receipt (Photo) *</label>
                <ImageUploadInput
                  value={submitReceiptUrl}
                  onChange={setSubmitReceiptUrl}
                  tenantId={tenant!.id}
                  placeholder="Select screenshot file..."
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-surface-light flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsSubmitModalOpen(false); setSubmitReceiptUrl(""); setPaymentAmount(0); }}
                  className="px-5 py-2.5 bg-surface-offWhite text-typography-primary rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-surface-light/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-pink text-white rounded-xl text-xs uppercase font-bold tracking-widest transition-all flex items-center gap-2"
                >
                  {isSubmittingPayment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmittingPayment ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {isRedirectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-surface-light">
            <div className="w-12 h-12 rounded-full bg-brand-pink/10 flex items-center justify-center mx-auto text-brand-pink">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-typography-primary">Shopping Bag Updated</h3>
              <p className="text-xs text-typography-muted leading-relaxed">
                Your approved leeway items have been loaded into your shopping bag. Click below to continue to the checkout form.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsRedirectModalOpen(false);
                  navigate('/checkout?select=leeway');
                }}
                className="w-full bg-brand-navy hover:bg-brand-pink text-white rounded-xl py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all shadow-md"
              >
                Continue to Checkout Form
              </button>
              <button
                onClick={() => setIsRedirectModalOpen(false)}
                className="w-full border border-surface-light hover:bg-surface-offWhite text-typography-primary rounded-xl py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all"
              >
                Stay on Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default CustomerOrdersPage;
