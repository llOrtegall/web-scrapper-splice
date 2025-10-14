import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <section className="relative">
        <SidebarTrigger className="absolute z-50 top-2 left-3" />
      </section>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
