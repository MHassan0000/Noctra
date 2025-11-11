import React from "react";
import Navbar from "../sections/navbar";


export default function Layout({
    children }: { children: React.ReactNode }) {
    return (
        <main className="">

            <Navbar />
            {children}

        </main>
    );
}