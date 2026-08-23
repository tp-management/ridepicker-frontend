import { Power } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StateShell from "./StateShell";
import OnboardingProgress from "./OnboardingProgress";
import DemoPreviewLink from "./DemoPreviewLink";

export default function PausedState({ onEnable, onPreviewDemo }) {
  const { toast } = useToast();

  const handle = () => {
    onEnable();
    toast({
      title: "RidePicker set to Assist",
      description: "Monitoring new messages and alerting you to jobs.",
    });
  };

  return (
    <StateShell
      icon={Power}
      iconClass="bg-slate-100 text-slate-500"
      title="WhatsApp connected · RidePicker is off"
      description="RidePicker is inactive. Turn it on to start monitoring new messages, detecting jobs and alerting you to opportunities."
      action={
        <button
          onClick={handle}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Turn on RidePicker
        </button>
      }
      footer={<OnboardingProgress current={2} />}
    >
      <div className="space-y-2">
        <p className="text-xs text-slate-400">
          Assist monitors and alerts you. <span className="text-slate-500">Autopilot</span> (autonomous
          contacting and negotiation) is coming soon.
        </p>
        <DemoPreviewLink onClick={onPreviewDemo} />
      </div>
    </StateShell>
  );
}