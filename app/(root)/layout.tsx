import React from "react";
import Sidebar from "../components/shared/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Sidebar />
            <main>{children}</main>
        </div>
    );
}