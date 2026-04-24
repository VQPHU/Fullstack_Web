import useAuthStore from "@/store/useAuthStore"
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
const Header = () => {
  const { user } = useAuthStore()
  return (
    <header className="sticky top-0 z-20 flex items-center h-16 
    bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 
   gap-4 border-b border-border px-4 w-full flex-shrink-0">
      <div className="flex items-center gap-4 ml-auto flex-shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell size={18} />
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden md:block text-right">
          <div className="text-sm font-medium truncate max-w-[150px]">{user?.name}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {user?.role}
          </div>
        </div>

        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden flex-shrink-0">
        {user?.avatar ? (
          <img 
          src={user.avatar}
          alt={user?.name}
          className="h-full w-full object-cover"
          />
        ) : (
          user?.name?.charAt(0).toUpperCase()
        )}
        </div>
      </div>
    </header>
  );
};

export default Header