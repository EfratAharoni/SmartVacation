import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

/* Page CSS is loaded up-front, in the original order: several pages share styles
   defined in another page's stylesheet, so loading CSS per page would make the
   look depend on which page was visited first. Only the JavaScript is split. */
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./Pages/HomePage.css";
import "./Register&Login/Login.css";
import "./Register&Login/Register.css";
import "./Pages/Attractions.css";
import "./Pages/Deals.css";
import "./Pages/DealDetails.css";
import "./Pages/Contact.css";
import "./Pages/About.css";
import "./Pages/Cart.css";
import "./Pages/Favorites.css";
import "./Pages/Checkout.css";
import "./Pages/Profile.css";
import "./Pages/Admin.css";
import "./Register&Login/PasswordReset.css";
// generated dark theme (npm run theme:dark) – loaded after all page styles
import "./styles/dark-theme.css";

// Pages are loaded on demand (smaller first download)
const HomePage = lazy(() => import("./Pages/HomePage"));
const Login = lazy(() => import("./Register&Login/Login"));
const Register = lazy(() => import("./Register&Login/Register"));
const Attractions = lazy(() => import("./Pages/Attractions"));
const Deals = lazy(() => import("./Pages/Deals"));
const DealDetails = lazy(() => import("./Pages/DealDetails"));
const Contact = lazy(() => import("./Pages/Contact"));
const About = lazy(() => import("./Pages/About"));
const Cart = lazy(() => import("./Pages/Cart"));
const Favorites = lazy(() => import("./Pages/Favorites"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const Profile = lazy(() => import("./Pages/Profile"));
const Admin = lazy(() => import("./Pages/Admin"));
const ForgotPassword = lazy(() => import("./Register&Login/PasswordReset").then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("./Register&Login/PasswordReset").then((m) => ({ default: m.ResetPassword })));

const PageLoader = () => (
  <div className="page-loader" role="status" aria-live="polite">
    <span className="page-loader-spinner" aria-hidden="true" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ראוטים עם Header */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals/:destination" element={<DealDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* ראוטים עם Header */}
      <Route element={<Layout />}>
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* ראוטים בלי Header */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes; 