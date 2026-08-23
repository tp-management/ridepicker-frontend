import { useNavigate } from "react-router-dom";
import { useProduct } from "@/lib/product/ProductContext";
import { useToast } from "@/components/ui/use-toast";

const cap = (s) => s[0].toUpperCase() + s.slice(1);

const MODE_TEXT = {
  off: "RidePicker is inactive.",
  assist: "Monitoring new messages and alerting you to jobs.",
  autopilot: "Monitoring and alerting. Autonomous contacting coming soon.",
};

/**
 * Shared RidePicker mode controller.
 *
 * Monitoring (Assist / Autopilot) requires BOTH a connected WhatsApp account
 * AND an active subscription. If a user tries to activate without a
 * subscription, we explain why and direct them to billing.
 */
export function useRidePickerMode() {
  const { whatsappConnected, hasActiveSubscription, mode, setMode } = useProduct();
  const { toast } = useToast();
  const navigate = useNavigate();

  const onMode = (m) => {
    if (m === "autopilot") {
      toast({ title: "Autopilot coming soon", description: "Autonomous contacting is not available yet." });
      return;
    }
    if (m !== "off") {
      if (!whatsappConnected) return;
      if (!hasActiveSubscription) {
        toast({
          title: "Active subscription required",
          description: "Activate RidePicker Premium to enable monitoring.",
        });
        navigate("/billing");
        return;
      }
    }
    const ok = setMode(m);
    if (!ok) return;
    toast({
      title: m === "off" ? "RidePicker off" : `RidePicker set to ${cap(m)}`,
      description: MODE_TEXT[m],
    });
  };

  return { whatsappConnected, hasActiveSubscription, mode, onMode };
}