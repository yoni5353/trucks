import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSidebar } from "./page-sidebar";
import { Drawer } from "@/components/ui/drawer";

export default function Page() {
    return (
        <>
            <SidebarProvider className="flex h-screen flex-col">
                <SidebarInset>
                    <div className="flex flex-col">
                        {/* <Topbar /> */}
                        <div className="flex flex-1 overflow-hidden">
                            <main className="relative flex-1">
                                {/* <OLMap /> */}
                            </main>
                        </div>
                    </div>
                </SidebarInset>
                <PageSidebar onIdk={undefined} />
            </SidebarProvider>
            <Drawer open={false} />
        </>
    );
}
