import { Link } from "react-router-dom";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const r = safeReturnTo();
  const registerTo = "/register" + (r !== "/" ? "?returnTo=" + encodeURIComponent(r) : "");
  return (
    <PhoneAuthForm
      title="Welcome back"
      subtitle="Log in with your phone number"
      footer={
        <>
          Don't have an account?{" "}
          <Link to={registerTo} className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    />
  );
}