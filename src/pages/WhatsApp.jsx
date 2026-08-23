import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "@/lib/product/ProductContext";
import { useToast } from "@/components/ui/use-toast";
import GettingStarted from "@/components/whatsapp/GettingStarted";
import WhatsappPairingCard from "@/components/whatsapp/WhatsappPairingCard";
import WhatsappConnectedCard from "@/components/whatsapp/WhatsappConnectedCard";
import WhatsappReconnectingCard from "@/components/whatsapp/WhatsappReconnectingCard";
import WhatsappDemoControls from "@/components/whatsapp/WhatsappDemoControls";
import LiveAssistPreferencesCard from "@/components/whatsapp/LiveAssistPreferencesCard";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function WhatsApp() {
  const {
    user,
    whatsappSession,
    whatsappLoading,
    connectWhatsApp,
    disconnectWhatsApp,
    simulateDrop,
    retryReconnect,
    refreshPairingCode,
    hasActiveSubscription,
    setMode,
    mode,
  } = useProduct();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const status = whatsappSession?.status || "disconnected";
  const pairingCode = whatsappSession?.pairingCode || null;
  const account = whatsappSession?.account || null;
  const connectedAt = whatsappSession?.connectedAt || null;
  const assistPreferencesEnabled = status === "connected";

  const enableRidePicker = () => {
    if (!hasActiveSubscription) {
      toast({
        title: "Active subscription required",
        description: "Activate RidePicker Premium to enable monitoring.",
      });
      navigate("/billing");
      return;
    }
    const ok = setMode("assist");
    if (ok) {
      toast({ title: "RidePicker enabled", description: "Monitoring new messages for jobs." });
      navigate("/home");
    }
  };

  const generateConnectionCode = async () => {
    try {
      return await connectWhatsApp();
    } catch (error) {
      toast({
        title: "Could not generate WhatsApp code",
        description: error?.message || "Please try again.",
      });
      throw error;
    }
  };

  const regenerateConnectionCode = async () => {
    try {
      return await refreshPairingCode();
    } catch (error) {
      toast({
        title: "Could not generate a new code",
        description: error?.message || "Please try again.",
      });
      throw error;
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsApp();
      setConfirm(false);
      toast({
        title: "WhatsApp disconnected",
        description: "RidePicker can no longer monitor messages.",
      });
    } catch (error) {
      toast({
        title: "Could not disconnect WhatsApp",
        description: error?.message || "Please try again.",
      });
    }
  };

  const reset = () => {
    disconnectWhatsApp().catch(() => {});
    toast({ title: "Session reset (demo)" });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">WhatsApp</h1>
        <p className="mt-1 text-sm text-slate-500">
          {status === "connected"
            ? "Your WhatsApp connection and Assist message preferences."
            : "Connect WhatsApp with a phone pairing code to start detecting jobs."}
        </p>
      </div>

      {status === "connected" ? (
        <WhatsappConnectedCard
          account={account}
          connectedAt={connectedAt}
          onDisconnect={() => setConfirm(true)}
          onEnableRidePicker={enableRidePicker}
          mode={mode}
        />
      ) : status === "reconnecting" ? (
        <WhatsappReconnectingCard onRetry={retryReconnect} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <WhatsappPairingCard
            status={whatsappLoading && !whatsappSession ? "loading" : status}
            pairingCode={pairingCode}
            loginPhone={user?.phone || user?.profile?.phone || null}
            onStart={generateConnectionCode}
            onRefreshCode={regenerateConnectionCode}
          />
          <GettingStarted />
        </div>
      )}

      <LiveAssistPreferencesCard
        enabled={assistPreferencesEnabled}
        userId={user?.id || null}
      />

      <WhatsappDemoControls status={status} onSimulateDrop={simulateDrop} onReset={reset} />

      <ConfirmDialog
        open={confirm}
        title="Disconnect WhatsApp?"
        description="RidePicker will stop monitoring messages and no new jobs will be detected until you reconnect."
        confirmLabel="Disconnect"
        destructive
        onConfirm={handleDisconnect}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
