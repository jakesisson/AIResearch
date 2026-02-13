import EnhancedVoiceInterface from './pages/enhanced-voice-interface';
import AGDashboard from './pages/AGDashboard';
import PricingPage from './pages/pricing';
import LandingPage from './pages/landing';

// Assuming the rest of the file contains a Router or similar component
// where these routes are defined.  A minimal example is provided below.

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/ag-dashboard" component={AGDashboard} />
        <Route path="/multi-agent-chat" component={MultiAgentChat} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/landing" component={LandingPage} />
      </Switch>
    </Router>
  );
}

export default App;