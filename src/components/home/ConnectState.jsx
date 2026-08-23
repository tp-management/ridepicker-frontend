import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import StateShell from "./StateShell";
import OnboardingProgress from "./OnboardingProgress";
import DemoPreviewLink from "./DemoPreviewLink";

export default function ConnectState({ onPreviewDemo }) {
  return (
    <StateShell
      icon={MessageCircle}
      iconClass="bg-emerald-50 text-emerald-600"
      title="Connect WhatsApp to get started"
      description="Connect your WhatsApp account so RidePicker can detect new driving jobs while it's active. Setup takes about a minute."
      action={
        <Link
          to="/whatsapp"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Connect WhatsApp
        </Link>
      }
      footer={<OnboardingProgress current={1} />}
    >
      <DemoPreviewLink onClick={onPreviewDemo} />
    </StateShell>
  );
}