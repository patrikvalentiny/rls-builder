import { Route, Switch, Redirect } from "wouter";
import PolicyBuilder from "./pages/PolicyBuilder";
import PolicyParser from "./pages/PolicyParser";
import PolicyOverview from "./pages/PolicyOverview";
import './App.css'

function App() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/builder" />} />
      <Route path="/builder" component={PolicyBuilder} />
      <Route path="/parser" component={PolicyParser} />
      <Route path="/overview" component={PolicyOverview} />
      <Route>
        <div className="text-center mt-10">
            <h2 className="text-2xl font-bold">404: Page Not Found</h2>
        </div>
      </Route>
    </Switch>
  )
}

export default App
