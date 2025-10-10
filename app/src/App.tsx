import { lazy, Suspense } from "react";
import Page from "./pages/main/page";

// const Page = lazy(() => import("./pages/main/page"));

function App() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}

export default App;
