import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QuotesProvider } from "./context/QuotesContext";
import { ProductsProvider } from "./context/ProductsContext";
import { QuickConfigProvider } from "./context/QuickConfigContext";
import Dashboard from "./pages/Dashboard";
import NewQuote from "./pages/NewQuote";
import EditQuote from "./pages/EditQuote";
import ProductManager from "./pages/ProductManager";
import UserManagement from "./pages/UserManagement";
import QuickConfig from "./pages/QuickConfig";
import AdvancedConfig from "./pages/AdvancedConfig";
import ProjectDetails from "./pages/ProjectDetails";
import SystemConfig from "./pages/SystemConfig";
import Requirements from "./pages/Requirements";

export default function App() {
  return (
    <ProductsProvider>
      <QuotesProvider>
        <Router>
          <QuickConfigProvider>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<NewQuote />} />
              <Route path="/edit/:id" element={<EditQuote />} />
              <Route path="/products" element={<ProductManager />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/quick" element={<QuickConfig />} />
              <Route path="/quick/project" element={<ProjectDetails />} />
              <Route path="/quick/system" element={<SystemConfig />} />
              <Route path="/quick/requirements" element={<Requirements />} />
              <Route path="/advanced" element={<AdvancedConfig />} />
            </Routes>
          </QuickConfigProvider>
        </Router>
      </QuotesProvider>
    </ProductsProvider>
  );
}