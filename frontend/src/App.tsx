import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SessionPage from "./pages/SessionPage";
import ReceiptBuilderPage from "./pages/ReceiptBuilderPage";

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
          </Routes>
      </BrowserRouter>
  );
}

export default App;