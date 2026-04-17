import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import NotificationToast from './components/ui/NotificationToast'

import CalendarBoard from './features/calendar/CalendarBoard'
import PropertiesPage from './features/properties/PropertiesPage'
import PropertyDetail from './features/properties/PropertyDetail'
import ExperiencesPage from './features/experiences/ExperiencesPage'
import AnalyticsDashboard from './features/dashboard/AnalyticsDashboard'
import PricingPage from './features/pricing/PricingPage'
import BookingPage from './features/booking/BookingPage'
import SoulDashboard from './features/soul/SoulDashboard'
import FinancePage from './features/finance/FinancePage'
import SettingsPage from './features/settings/SettingsPage'
import GuestsPage from './features/guests/GuestsPage'
import HousekeepingPage from './features/housekeeping/HousekeepingPage'

import TravelerGuide from './features/traveler-guide/TravelerGuide'
import GuideEditor from './features/traveler-guide/GuideEditor'
import AuthPage from './features/auth/AuthPage'

import { SanctuumProvider } from './context/SanctuumContext'
import { NotificationProvider } from './context/NotificationContext'
import { LanguageProvider } from './context/LanguageContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { GuideProvider } from './context/GuideContext'
import { ThemeProvider } from './context/ThemeContext'

// Public Site Imports
import PublicLayout from './site/layout/PublicLayout'
import Home from './site/pages/Home'
// Removing multi-page routes for ultra-premium one-page design -> Restoring multi-page design for SEO
import Chalet from './site/pages/Chalet'
import Wellness from './site/pages/Wellness'
import Location from './site/pages/Location'
import Reservation from './site/pages/Reservation'
import Experience from './site/pages/Experience'
import Thanks from './site/pages/Thanks'
import Terms from './site/pages/Terms'

const DashboardLayout = () => {
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_KEY;

  return (
    <div className="layout-grid">
      <Sidebar />
      <main style={{ padding: '2rem', overflowY: 'auto' }}>
        <Header />
        {!isConfigured && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <strong>Configuration Missing:</strong> Please update .env with your VITE_SUPABASE_URL and VITE_SUPABASE_KEY.
          </div>
        )}
        <Outlet />
        <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          ALTARA v1.5 (Migration Airbnb Data) • {new Date().toLocaleDateString()}
        </div>
        <NotificationToast />
      </main>
    </div>
  )
}

import { useSanctuum } from './context/SanctuumContext';

// 🔥 Auth Reactivated
const RequireAuth = () => {
  const { user, authLoading } = useSanctuum();

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading App...</div>;

  if (!user) return <Navigate to="/auth" replace />;

  return <DashboardLayout />
}

function App() {
  const hostname = window.location.hostname || '';
  const isAyanaDomain = hostname.includes('chaletayana.ca');

  if (isAyanaDomain) {
    return (
      <NotificationProvider>
        <LanguageProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <BrowserRouter>
                <Routes>
                  {/* Isolate Ayana Site to Root for Custom Domain */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="chalet" element={<Chalet />} />
                    <Route path="bien-etre" element={<Wellness />} />
                    <Route path="localisation" element={<Location />} />
                    <Route path="reservation" element={<Reservation />} />
                    <Route path="experience" element={<Experience />} />
                    <Route path="thanks" element={<Thanks />} />
                    <Route path="regles" element={<Terms />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </CurrencyProvider>
          </ThemeProvider>
        </LanguageProvider>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <LanguageProvider>
        <ThemeProvider>
          <GuideProvider>
            <SanctuumProvider>
              <CurrencyProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public Site Routes - Kept for fallback on altara domain */}
                    <Route path="/ayana" element={<PublicLayout />}>
                      <Route index element={<Home />} />
                      <Route path="chalet" element={<Chalet />} />
                      <Route path="bien-etre" element={<Wellness />} />
                      <Route path="localisation" element={<Location />} />
                      <Route path="reservation" element={<Reservation />} />
                      <Route path="experience" element={<Experience />} />
                      <Route path="thanks" element={<Thanks />} />
                      <Route path="regles" element={<Terms />} />
                    </Route>

                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/guide" element={<TravelerGuide />} />

                    {/* Admin Routes */}
                    <Route element={<RequireAuth />}>
                      <Route path="/" element={<Navigate to="/planning" replace />} />
                      <Route path="/planning" element={<CalendarBoard />} />
                      <Route path="/properties" element={<PropertiesPage />} />
                      <Route path="/properties/:id" element={<PropertyDetail />} />
                      <Route path="/housekeeping" element={<HousekeepingPage />} />
                      <Route path="/experiences" element={<ExperiencesPage />} />
                      <Route path="/analytics" element={<AnalyticsDashboard />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/soul" element={<SoulDashboard />} />
                      <Route path="/finance" element={<FinancePage />} />
                      <Route path="/book/:id" element={<BookingPage />} />
                      <Route path="/guests" element={<GuestsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/settings/guide-editor" element={<GuideEditor />} />
                      <Route path="/editor" element={<GuideEditor />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CurrencyProvider>
            </SanctuumProvider>
          </GuideProvider>
        </ThemeProvider>
      </LanguageProvider>
    </NotificationProvider>
  )
}

export default App
