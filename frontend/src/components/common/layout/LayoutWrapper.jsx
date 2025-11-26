import SideBarLayout from "./sidebar";
import HeaderLayout from "./header";

export default function LayoutWrapper({ children, showSidebar = false }) {
    return (
        <div className="flex min-h-screen">
            {showSidebar && <SideBarLayout />}
            <div className="flex-1 flex flex-col">
                <HeaderLayout />
                <main className="flex-1 overflow-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
