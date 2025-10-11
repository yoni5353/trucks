import { LoaderIcon } from "lucide-react";
import { lazy, Suspense } from "react";

const Page = lazy(() => import("./pages/main/page"));

function App() {
    return (
        <Suspense fallback={<LoaderIcon className="m-auto h-full animate-spin" />}>
            <Page />
        </Suspense>
    );
}

export default App;
