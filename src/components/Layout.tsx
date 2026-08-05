import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { Toaster } from "@/components/ui/toaster";

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar — completely absent on mobile & tablet; lg: = 1024 px */}
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        {/*
          pb-20 gives clearance for the fixed bottom nav on mobile / tablet.
          lg:pb-6 reverts to normal padding on desktop where the sidebar is shown instead.
        */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
      {/* Mobile / tablet bottom navigation — hidden on lg+ */}
      <BottomNav />
      <Toaster />
    </div>
  );
}
