import { LoaderIcon } from "lucide-react";
import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";

const Page = lazy(() => import("./pages/main/page"));
const queryClient = new QueryClient();

function App() {
    return (
        <Suspense fallback={<LoaderIcon className="m-auto h-full animate-spin" />}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <Page />
                        <Toaster />
                    </TooltipProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </Suspense>
    );
}

export default App;
