import { Route, Switch, Redirect, Link } from "wouter";
import PolicyBuilder from "./pages/PolicyBuilder";
import PolicyParser from "./pages/PolicyParser";
import PolicyOverview from "./pages/PolicyOverview";
import PolicyList from "./pages/PolicyList";
import './App.css'
import { usePolicies } from "./hooks/usePolicies";

function App() {
  const { collections } = usePolicies();

  const collectionLinks = collections.map((collection) => (
    <li key={collection}>
      <Link href={`/policies/${encodeURIComponent(collection)}`}>
        {collection}
      </Link>
    </li>
  ));
  
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-stretch min-h-dvh">
        {/* Top bar with drawer button for small screens */}
        <header className="w-full p-4 flex items-center justify-left bg-base-200 lg:hidden">
          <label htmlFor="my-drawer-3" className="btn btn-square lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </label>
          <h1 className="text-2xl font-bold"><Link href="/">RLS Builder</Link></h1>

        </header>

        <main className="p-6 w-full">
          <Switch>
            <Route path="/" component={() => <Redirect to="/overview" />} />
            <Route path="/builder" component={PolicyBuilder} />
            <Route path="/parser" component={PolicyParser} />
            <Route path="/overview" component={PolicyOverview} />
            <Route path="/policies/:collection" component={PolicyList} />
            <Route path="/policies" component={PolicyList} />
            <Route>
              <div className="text-center mt-10">
                <h2 className="text-2xl font-bold">404: Page Not Found</h2>
              </div>
            </Route>
          </Switch>
        </main>
      </div>

      <div className="drawer-side">
        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 min-h-full p-4 flex flex-col justify-between">
          <div>
            <li className=""><h1 className="text-2xl font-bold"><Link href="/">RLS Builder</Link></h1></li>
            <ul className="menu">
              <li className=""><Link href="/overview">Overview</Link></li>
              <li>
                <h2 className="menu-title">Collections</h2>
                <ul>
                  <li><Link href="/policies">All Policies</Link></li>
                    {collectionLinks}
                </ul>
              </li>
              <li className=""><Link href="/builder">Policy Builder</Link></li>
              <li className=""><Link href="/parser">Policy Parser</Link></li>
            </ul>
            {/* <div className="divider"></div> */}
          </div>
          <div>
            <li className=""><a href="https://github.com/patrikvalentiny/rls-builder" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default App