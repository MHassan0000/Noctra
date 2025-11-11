import React from "react";
import Navbar from "../components/shared/navbar";


export default function Layout({
    children }: { children: React.ReactNode }) {
    return (
        <main className="">

            <Navbar />
            {children}

        </main>
    );
}