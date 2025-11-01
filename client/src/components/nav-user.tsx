import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChartLine, ChevronsUpDown, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/context/auth/AuthContext"
import { Link } from "react-router"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg font-bold gap-0.5 flex">
                  <span>{user?.username[0].toUpperCase()}</span>
                  <span>{user?.username[1].toUpperCase()}</span>
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.username || "Avatar..."}
                </span>
                <span className="truncate text-xs">{user?.email || user?.rol || "Unknown"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg "
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {
              user?.rol === "admin" && (
                <>
                  <Link to="/admin-panel">
                    <button
                      className="flex py-2 px-4 items-center gap-2 opacity-80 cursor-pointer hover:opacity-100 hover:bg-accent hover:text-accent-foreground w-full rounded-t-lg"
                    >
                      <Settings />
                      <span className="font-bold">Admin Panel</span>
                    </button>
                    <DropdownMenuSeparator />
                  </Link>
                  <Link to="/metrics">
                    <button
                      className="flex py-2 px-4 items-center gap-2 opacity-80 cursor-pointer hover:opacity-100 hover:bg-accent hover:text-accent-foreground w-full rounded-t-lg"
                    >
                      <ChartLine />
                      <span className="font-bold">Métricas</span>
                    </button>
                    <DropdownMenuSeparator />
                  </Link>
                </>
              )
            }
            <DropdownMenuItem onClick={logout} className="cursor-pointer hover:opacity-100 hover:bg-accent hover:text-accent-foreground w-full rounded-t-lg">
              <LogOut />
              <span> Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
