import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Loader2,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
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

const compactPhone = (value) =>
  String(value || "")
    .trim()
    .replace(/[\s().-]+/g, "");

export default function PhoneAuthForm() {
  const { applyPhoneSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone | otp | signup
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const dest = postLoginDest();

  const finishAuthentication = (user) => {
    applyPhoneSession(user);
    navigate(dest, { replace: true });
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setStatus("sending");
    setError("");

    const normalizedPhone = compactPhone(phone);
    const res = await authService.requestOtp(normalizedPhone);

    if (res.status === "otp_sent") {
      setPhone(res.phone || normalizedPhone);
      setCode("");
      setStep("otp");
      setStatus("idle");
      return;
    }

    setStatus("error");
    setError(res.message || "Could not send the verification code.");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanCode = code.replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setStatus("verifying");
    setError("");

    const res = await authService.verifyOtp({
      phone,
      code: cleanCode,
    });

    if (res.status === "authenticated") {
      finishAuthentication(res.user);
      return;
    }

    if (res.status === "profile_required") {
      setStatus("idle");
      setStep("signup");
      return;
    }

    setStatus("error");
    setError(res.message || "The verification code could not be confirmed.");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setStatus("creating");
    setError("");

    const res = await authService.completeProfile({ name: name.trim() });
    if (res.status === "authenticated") {
      finishAuthentication(res.user);
      return;
    }

    setStatus("error");
    setError(res.message || "Could not create your RidePicker account.");
  };

  const resendCode = async () => {
    setStatus("sending");
    setError("");
    const res = await authService.requestOtp(phone);
    if (res.status === "otp_sent") {
      setCode("");
      setStatus("idle");
      return;
    }
    setStatus("error");
    setError(res.message || "Could not resend the verification code.");
  };

  if (step === "signup") {
    return (
      <AuthLayout
        icon={UserIcon}
        title="Create your RidePicker account"
        subtitle="Your phone is verified. Add your name to finish setup."
      >
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Name
            </label>
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
            <label htmlFor="verified-phone" className="text-sm font-medium text-foreground">
              Verified phone number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="verified-phone"
                value={phone}
                readOnly
                className="h-12 pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full font-medium"
            disabled={status === "creating" || !name.trim()}
          >
            {status === "creating" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout
        icon={ShieldCheck}
        title="Verify your phone"
        subtitle={`Enter the 6-digit code sent to ${phone}.`}
      >
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-foreground">
              Verification code
            </label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 text-center text-lg tracking-[0.35em]"
              required
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full font-medium"
            disabled={status === "verifying" || code.length !== 6}
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
              </>
            ) : (
              <>Verify <ChevronRight className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setStatus("idle");
              setError("");
            }}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Change number
          </button>

          <button
            type="button"
            onClick={resendCode}
            disabled={status === "sending"}
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Resend code"}
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Phone}
      title="Welcome to RidePicker"
      subtitle="Enter your phone number to receive a secure login code."
    >
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleContinue} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

        <Button
          type="submit"
          className="h-12 w-full font-medium"
          disabled={status === "sending" || !phone.trim()}
        >
          {status === "sending" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code…
            </>
          ) : (
            <>Continue <ChevronRight className="ml-1 h-4 w-4" /></>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
