import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./pages/HomePage";
import { CompliancePage } from "./pages/CompliancePage";
import { SecurityPage } from "./pages/SecurityPage";
import { DocumentsPage, InfrastructurePage, PrivacyPage, ContactPage } from "./pages/AdditionalPages";
import "./index.css";

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
