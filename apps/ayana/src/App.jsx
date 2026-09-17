import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import { NotificationProvider } from './context/NotificationContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';

import PublicLayout from './site/layout/PublicLayout.jsx';
import Home from './site/pages/Home.jsx';
import Chalet from './site/pages/Chalet.jsx';
import Wellness from './site/pages/Wellness.jsx';
import Location from './site/pages/Location.jsx';
import Reservation from './site/pages/Reservation.jsx';
import Experience from './site/pages/Experience.jsx';
import Thanks from './site/pages/Thanks.jsx';
import Terms from './site/pages/Terms.jsx';

import PaymentSuccessPage from './features/payments/PaymentSuccessPage.jsx';

export default function App() {
  return (
    <NotificationProvider>
      <LanguageProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <BrowserRouter>
              <Routes>
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

                <Route
                  path="/payment/success"
                  element={<PaymentSuccessPage />}
                />

                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />
              </Routes>
            </BrowserRouter>
          </CurrencyProvider>
        </ThemeProvider>
      </LanguageProvider>
    </NotificationProvider>
  );
}
