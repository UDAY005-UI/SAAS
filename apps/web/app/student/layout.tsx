import { ReactNode } from "react";
import Navbar from "../components/Navbar";

export default function StudentLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
}
