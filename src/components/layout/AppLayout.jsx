import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { MobileStatusBar } from "./GlobalStatus";
import DemoBanner from "@/components/DemoBanner";
import BigMoneyAlertHost from "@/components/BigMoneyAlertHost";
import BigMoneyPushCard from "@/components/home/BigMoneyPushCard";
import AppLoadingShell from "./AppLoadingShell";
import { ProductProvider, useProduct } from "@/lib/product/ProductContext";

export default function AppLayout() {
  return (
    <ProductProvider>
      <AppShell />
    </ProductProvider>
  );
}

function AppShell() {
  const { demoMode, disableDemo, user, whatsappConnected, whatsappLoading } = useProduct();

  // Keep the same navigation and dashboard geometry without showing a fake
  // logged-out/disconnected screen before the first backend session response.
  if (whatsappLoading) return <AppLoadingShell />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="sm:pl-60">
        <MobileStatusBar />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
          <DemoBanner visible={demoMode} onExit={disableDemo} />
          <Outlet />
        </main>
        <div className="h-20 sm:hidden" />
      </div>
      <BottomNav />
      {/* Global modals live outside page-specific routes, so they work on every screen. */}
      <BigMoneyPushCard userId={whatsappConnected ? user?.id : null} showCard={false} />
      <BigMoneyAlertHost />
    </div>
  );
}
