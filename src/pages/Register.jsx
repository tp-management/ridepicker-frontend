import { Link } from "react-router-dom";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const r = safeReturnTo();
  const loginTo = "/login" + (r !== "/" ? "?returnTo=" + encodeURIComponent(r) : "");
  return (
    <PhoneAuthForm
      title="Create your account"
      subtitle="Sign up with your phone number"
      footer={
        <>
          Already have an account?{" "}
          <Link to={loginTo} className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    />
  );
}