import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Hero } from "./sections/Hero";
import { CollectionMarquee } from "./sections/CollectionMarquee";
import { Collections } from "./sections/Collections";
import { Testimonials } from "./sections/Testimonials";
import { Faq } from "./sections/Faq";
import { AdminApp } from "./admin/AdminApp";
import { AuthProvider } from "./admin/AuthContext";
import { ThemeProvider } from "./theme/ThemeProvider";
import { CollectionPage } from "./pages/CollectionPage";

function Storefront() {
  return (
    <div className="bg-ink">
      <Nav />
      <main>
        <Hero />
        <CollectionMarquee />
        <Collections />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/collections/:slug" element={<CollectionPage />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
