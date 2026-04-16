import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bookmark, ChevronLeft, ChevronRight, FileText, Layers, LayoutDashboard, LogOut, Package, ShoppingBag, Tag, User, Users } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { NavLink, useLocation } from "react-router";

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  end?: boolean;
  pathname: string;
};

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};
const navigationItems = [
  {
    to: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    label: "Dashborad",
    end: true,
  },
  {
    to: "/dashboard/account",
    icon: <User size={20} />,
    label: "Account",
  },
  {
    to: "/dashboard/users",
    icon: <Users size={20} />,
    label: "Users "
  },

  {
    to: "/dashboard/banners",
    icon: <Layers size={20} />,
    label: "Banners",
  },
];

const salesItems = [
  {
    to: "/dashboard/orders",
    icon: <Package size={20} />,
    label: "Orders",
  },
  {
    to: "/dashboard/invoices",
    icon: <FileText size={20} />,
    label: "Invoices",
  },
];

const productItems = [
  {
    to: "/dashboard/products",
    icon: <ShoppingBag size={20} />,
    label: "Products"
  },
  {
    to: "/dashboard/product-types",
    icon: <Layers size={20} />,
    label: "Product Types"
  },
  {
    to: "/dashboard/categories",
    icon: <Tag size={20} />,
    label: "Categories",
  },
  {
    to: "/dashboard/brands",
    icon: <Bookmark size={20} />,
    label: "Brands",
  },
];


const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();
  return (
    <motion.aside
      initial={{ width: open ? 256 : 80 }}
      animate={{ width: open ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed inset-y-0  left-0 z-20 flex flex-col border-r border-r-slate-800/50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300",
        open ? "w-64" : "w-20")}>
      < div className="flex items-center justify-between p-4 h-16 bg-gradient-to-r from-[#29beb3] via-slate-700 to-[#a96bde] border-b border-slate-600 / 50">
        <motion.div
          className={cn(
            "flex items-center overflow-hidden", open ? "w-auto opacity-100" : "w-0 opacity-0"
          )}
          initial={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
          animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-bold text-xl text-white drop-shadow-lg">
            BabyShop Admin
          </span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{
          scale: 0.9
        }} >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 hover:border-white/30 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: open ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {open ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight className="rotate-180" size={20} />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </div >
      {/* Sidebar menu */}
      <div className="flex flex-col flex-1 gap-1 p-3 bg-gradient-to-b from-slate-900/50 to-slate-800/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/20">
        {navigationItems?.map((item) => (
          <NavItem
            key={item?.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            open={open}
            end={item.end}
            pathname={pathname}
          />
        ))}
        {/* Sales & Orders */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="sales-orders" className="border-none">
            <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl text-sm font-medium hoverEffect gap-3 overflow-hidden text-white/80 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm no-underline hover:no-underline">
              <div className="flex items-center gap-3">
                <Package size={20} />
                {open && "Sales & Orders"}
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-0 px-2 py-1">
              <div className="space-y-1 pb-3">
                {salesItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center p-3 pl-8 rounded-lg text-sm font-medium hoverEffect gap-3 overflow-hidden text-white/80 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm",
                      pathname === item.to
                        ? "bg-gradient-to-r from-[#29beb3]/20 to-[#a96bde]/20 text-white shadow-lg shadow-[#29beb3]/20 ring-1 ring-[#29beb3]/30 border border-white/10 backdrop-blur-sm"
                        : "text-slate-300 hover:scale-102"
                    )}
                  >
                    <span>{item.icon}</span>
                    {open && item.label}
                  </NavLink>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="product-catalog" className="border-none">
            <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl text-sm font-medium hoverEffect gap-3 overflow-hidden text-white/80 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm no-underline hover:no-underline">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                {open && "Product Catalog"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 px-2 py-1">
              <div className="space-y-1 pb-3">
                {productItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center p-3 pl-8 rounded-lg text-sm font-medium hoverEffect gap-3 overflow-hidden text-white/80 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm",
                      pathname === item.to
                        ? "bg-gradient-to-r from-[#29beb3]/20 to-[#a96bde]/20 text-white shadow-lg shadow-[#29beb3]/20 ring-1 ring-[#29beb3]/30 border border-white/10 backdrop-blur-sm"
                        : "text-slate-300 hover:scale-102"
                    )}
                  >
                    <span>{item.icon}</span>
                    {open && item.label}
                  </NavLink>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-600/50 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
        <motion.div
          className={cn(
            "flex items-center gap-3 mb-4",
            open ? "justify-start" : "justify-center"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#29beb3] to-[#a96bde] flex items-center justify-center text-white font-semibold overflow-hidden shadow-lg ring-2 ring-white/20">
            {user?.avatar ? (
              <img src={user?.avatar} alt="userImage"
                className="h-full w-full object-cover"
              />
            ) : (user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm font-medium text-white truncate max-w-[150px]">
                  {user?.name}
                </span>
                <span className="text-xs text-[#29beb3] capitalize font-medium bg-slate-700/50
                px-2 py-1 rounded-full backdrop-blur-sm">
                  {user?.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div>
          <Button
            variant={"outline"}
            size={open ? "default" : "icon"}
            className="w-full border-red-500/30 hover:bg-red-600/20 hover:border-red-400/50 text-red-400
          hover:text-red-300 transition-colors bg-red-600/10 backdrop-blur-sm"
            onClick={logout}
          >
            <LogOut size={16} className={cn("mr-2", !open && "mr-0")} />
            {open && "Logout"}
          </Button>
        </motion.div>
      </div>
    </motion.aside >
  );
};

function NavItem({ to, icon, label, open, end, pathname }:
  NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={cn(
        "flex items-center p-3 rounded-xl text-sm font-medium hoverEffect gap-3 overflow-hidden text-white/80 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm",
        pathname === to
          ? "bg-gradient-to-r from-[#29beb3]/20 to-[#a96bde]/20 text-white shadow-lg shadow-[#29beb3]/20 scale-105 ring-1 ring-[#29beb3]/30 border border-white/10 backdrop-blur-sm"
          : "text-slate-300 hover:scale-102"
      )}
    >
      <span>{icon}</span>
      {open && label}
    </NavLink>
  );
};

export default Sidebar