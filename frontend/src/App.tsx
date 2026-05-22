import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SessionPage from "./pages/SessionPage";
import ReceiptBuilderPage from "./pages/ReceiptBuilderPage";
import WorkspacePage from "./pages/WorkspacePage";
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LandingPage/>}/>
              <Route path="/session/:shareCode" element={<SessionPage/>}/>
              <Route
                  path="/receipt/:shareCode"
                  element={<ReceiptBuilderPage />}
              />
              <Route
                  path="/workspace/:shareCode"
                  element={<WorkspacePage />}
              />
          </Routes>
      </BrowserRouter>
  );
}

export default App;