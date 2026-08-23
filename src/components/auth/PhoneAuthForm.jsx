import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Loader2, ArrowLeft, ChevronRight, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { authService } from "@/lib/services/authService";
import { safeReturnTo } from "@/lib/authReturnTo";

const postLoginDest = () => {
  const r = safeReturnTo();
  return r && r !== "/" ? r : "/home";
};

/**
 * Phone-first authentication flow, shared by Login and Register.
 *
 *   1. Enter phone number → Continue.
 *   2. If a RidePicker account exists for that number, open it.
 *      Otherwise, go to Sign up (name + phone, pre-filled).
 *   3. After login / sign-up, go to Home.
 *
 * Phone-only: no passwords, no Google. RidePicker account and WhatsApp
 * connection are separate — nothing here creates a WhatsApp session.
 * Structure mirrors a real phone-OTP flow: openExistingAccount/signUp here map
 * to a verification step behind authService without redesigning this screen.
 */
export default function PhoneAuthForm() {
  const { applyPhoneSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone | signup
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle"); // checking | creating | error
  const [error, setError] = useState("");

  const dest = postLoginDest();

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStatus("checking");
    setError("");
    try {
      const res = await authService.openExistingAccount(phone.trim());
      if (res.status === "authenticated") {
        applyPhoneSession(res.user);
        navigate(dest, { replace: true });
        return;
      }
      if (res.status === "error") {
        setStatus("error");
        setError(res.message || "Could not connect to RidePicker.");
        return;
      }
      // No existing account → Sign up. Phone is pre-filled but stays editable.
      setStatus("idle");
      setStep("signup");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Could not connect to RidePicker.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setStatus("creating");
    setError("");
    try {
      const res = await authService.signUp({ name: name, phone: phone.trim() });
      if (res.status === "authenticated") {
        applyPhoneSession(res.user);
        navigate(dest, { replace: true });
        return;
      }
      setStatus("error");
      setError(res.message || "Could not create account.");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Could not create account.");
    }
  };

  if (step === "signup") {
    return (
      <AuthLayout
        icon={UserIcon}
        title="Create your RidePicker account"
        subtitle="Add your name to finish setting up your account."
      >
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-phone" className="text-sm font-medium text-foreground">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+44 7700 900123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="h-12 w-full font-medium"
            disabled={status === "creating" || !name.trim() || !phone.trim()}
          >
            {status === "creating" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <button
          onClick={() => { setStep("phone"); setStatus("idle"); setError(""); }}
          className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Phone} title="Welcome to RidePicker" subtitle="Enter your phone number to continue.">
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={handleContinue} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              placeholder="+44 7700 900123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 pl-10"
              required
            />
          </div>
        </div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={status === "checking" || !phone.trim()}>
          {status === "checking" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…</>
          ) : (
            <>Continue <ChevronRight className="ml-1 h-4 w-4" /></>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}