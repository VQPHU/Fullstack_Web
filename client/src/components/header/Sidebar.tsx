"use client"
import React, { useState } from 'react'
import { Menu } from 'lucide-react';
import HeaderLeftSidebar from './HeaderLeftSidebar';

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className="md:hidden">
            <button
                onClick={toggleSidebar}
                className="hover:text-babyshopSky hoverEffect">
                <Menu />
            </button>
            <HeaderLeftSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    )
}


export default Sidebar