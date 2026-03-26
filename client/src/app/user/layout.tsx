import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

const getUser = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
        return null;
    }
    try {
        const baseUrl = process.env.API_ENDPOINT || "http://localhost:8000/api";
        const response = await fetch(`${baseUrl}/auth/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store", // Don't cache user data
        });

        const user = await response.json();
        return user;
    } catch (error) {
        console.log("Failed to fetch user:", error);
        return null;
    }
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
    const user = await getUser()
    if (!user) {
        redirect('/auth/signin');
    }
    return (
        <div>
            {children}
        </div>
    )
}

export default RootLayout