"use client";

import { Button } from "@/components/ui/button";
import authApi from "@/lib/authApi";
import { useUserStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ProfilePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { logoutUser } = useUserStore();
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.post("/auth/logout", {});
            if (response?.success) {
                logoutUser();
                toast.success("Logged out successfully");
                router.push("/");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-10">
            <Button
                onClick={handleLogout}
                variant="destructive"
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center gap-1">
                        <Loader2 className="animate-spin" />
                        Logging out...
                    </span>
                ) : (
                    "Logout"
                )}
            </Button>
        </div>
    );
};

export default ProfilePage;
