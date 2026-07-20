import { useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { useUserAuth } from "../../core/context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle, Check, X, Eye, EyeOff } from "lucide-react";
import { useNotification } from "../../core/context/NotificationContext";
import { useTenant } from "../../core/context/TenantContext";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp } = useUserAuth();
  const navigate = useNavigate();
  const { showInfo } = useNotification();
  const { tenant } = useTenant();
  
  const settings = (tenant?.store_settings as any) || {};
  const authBgUrl = settings.branding?.auth_bg_url;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const passwordCriteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special symbol (e.g. @, #, $, !)", met: /[^A-Za-z0-9]/.test(password) }
  ];
  const allCriteriaMet = passwordCriteria.every(c => c.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && (!fullName || !confirmPassword))) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg("Email address must end with @gmail.com");
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      if (!allCriteriaMet) {
        setErrorMsg("Please satisfy all password complexity requirements.");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        await signIn(email, password);
        setSuccessMsg("Signed in successfully!");
        setTimeout(() => navigate("/shop"), 1000);
      } else {
        await signUp(email, password, fullName);
        setSuccessMsg("Registration successful! Please check your email for confirmation link.");
        setIsLogin(true);
        // Clear registration states
        setFullName("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    showInfo("Google Login is coming soon! Please sign in or register using your Email Address and Password.");
  };

  return (
    <div className="pt-24 min-h-screen bg-surface-white flex">
      {/* Left side Image */}
      <div className="hidden lg:block w-1/2 relative bg-surface-offWhite overflow-hidden">
        {authBgUrl && (
          <img src={authBgUrl} className="absolute inset-0 w-full h-full object-cover" alt="Brand Lifestyle" />
        )}
        <div className={`absolute inset-0 ${authBgUrl ? 'bg-black/40' : 'bg-brand-navy/5 mix-blend-multiply'}`}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <h1 className="text-5xl md:text-7xl font-sans tracking-[0.15em] uppercase font-bold text-white drop-shadow-lg mb-4">
            KBDF
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] font-medium text-white/90 drop-shadow-md">
            Bringing you the Best in Goods!
          </p>
        </div>
      </div>
      
      {/* Right side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <FadeUp>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-typography-primary mb-3">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs uppercase tracking-widest text-typography-muted font-bold">
                {isLogin ? "Sign in to access your luxury profile." : "Join us to experience quiet luxury."}
              </p>
            </div>

            {errorMsg && (
              <div className="text-red-500 bg-red-50 border border-red-200/50 p-4 rounded-xl flex items-center gap-2 text-xs mb-6">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="text-emerald-600 bg-emerald-50 border border-emerald-200/50 p-4 rounded-xl flex items-center gap-2 text-xs mb-6">
                <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Full Name *</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                    className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-brand-pink transition-colors text-sm text-typography-primary" 
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Email Address *</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jane.doe@example.com"
                  className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-brand-pink transition-colors text-sm text-typography-primary" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border-b border-surface-light py-2 pr-10 bg-transparent outline-none focus:border-brand-pink transition-colors text-sm text-typography-primary" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-typography-muted hover:text-typography-primary transition-colors p-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLogin && (
                  <div className="mt-2.5 space-y-1 bg-surface-offWhite border border-surface-light rounded-xl p-3 text-[10px]">
                    <span className="font-bold text-typography-primary uppercase tracking-wider block mb-1.5">Password Requirements:</span>
                    {passwordCriteria.map((c, i) => (
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

              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Confirm Password *</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full border-b border-surface-light py-2 pr-10 bg-transparent outline-none focus:border-brand-pink transition-colors text-sm text-typography-primary" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-typography-muted hover:text-typography-primary transition-colors p-2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-brand-navy text-surface-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-brand-pink transition-colors w-full mt-4 font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {isLogin ? "Sign In" : "Register"}
              </button>
            </form>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-light"></div>
              </div>
              <span className="relative bg-surface-white px-4 text-[10px] uppercase text-typography-muted font-bold tracking-widest">Or Continue With</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 bg-surface-offWhite hover:bg-surface-light text-typography-primary w-full py-4 text-xs uppercase tracking-widest font-bold rounded-xl border border-surface-light transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.88-1.5 2.2l3.43 2.66c2-1.84 3.12-4.56 3.12-7.69z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.43-2.66c-.95.64-2.17 1.02-3.5 1.02-2.7 0-5-1.82-5.81-4.28L1.69 18.43C3.69 22.42 7.8 24 12 24z"/>
                <path fill="#FBBC05" d="M6.19 15.17A7.17 7.17 0 0 1 5.75 12c0-1.1.2-2.17.58-3.17L2.1 5.7A11.95 11.95 0 0 0 0 12c0 2.29.66 4.43 1.81 6.25l4.38-3.08z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.22 0 12 0 7.8 0 3.69 2.58 1.69 6.57l4.5 3.5c.81-2.46 3.11-4.28 5.81-4.28z"/>
              </svg>
              Google (Coming Soon)
            </button>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[10px] uppercase tracking-widest text-brand-navy border-b border-brand-navy pb-1 font-bold hover:text-brand-pink hover:border-brand-pink transition-colors"
              >
                {isLogin ? "Create an account instead" : "Already have an account? Sign in"}
              </button>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
