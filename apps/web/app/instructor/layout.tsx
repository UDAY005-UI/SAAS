import { ReactNode } from "react";
import InstructorNavbar from "../components/InstructorNavbar";

export default function InstructorLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <>
            <InstructorNavbar />
            <main>{children}</main>
        </>
    );
}
