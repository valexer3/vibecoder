import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar.jsx';
import FooterDisclaimer from './components/FooterDisclaimer.jsx';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ContactsPage from './pages/ContactsPage.jsx';
import { CarModalsProvider, useCarModals } from './CarModalsContext.jsx';

function AppShell() {
  const { openLead } = useCarModals();

  return (
    <div className="app">
      <Topbar onLeadClick={() => openLead()} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
      </Routes>

      <footer className="footer">
        <span>AJ Import — авто из Кореи и Китая под заказ</span>
        <button className="cta-outline" onClick={() => openLead()}>Оставить заявку</button>
      </footer>

      <FooterDisclaimer />
    </div>
  );
}

export default function App() {
  return (
    <CarModalsProvider>
      <AppShell />
    </CarModalsProvider>
  );
}
