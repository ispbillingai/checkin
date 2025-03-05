
import * as React from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger() {
  const { isOpen, setIsOpen } = useSidebar();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

export function Sidebar({ className, children }: React.HTMLAttributes<HTMLElement>) {
  const { isOpen } = useSidebar();
  
  return (
    <aside
      className={cn(
        "border-r bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 overflow-hidden opacity-0",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {children}
      </div>
    </aside>
  );
}

export function SidebarHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-3 border-b", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)}>
      {children}
    </div>
  );
}

export function SidebarFooter({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-3 border-t", className)}>
      {children}
    </div>
  );
}

export function SidebarGroup({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-2", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-1 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-1", className)}>
      {children}
    </div>
  );
}

export function SidebarMenu({ className, children }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("grid gap-1 px-2", className)}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ className, children }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("", className)}>
      {children}
    </li>
  );
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <div
          className={cn(
            "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            className
          )}
        >
          {children}
        </div>
      );
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
