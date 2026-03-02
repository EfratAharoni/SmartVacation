import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import HomePage from "./Pages/HomePage";
import Login from "./Register&Login/Login";
import Register from "./Register&Login/Register";
import Attractions from "./Pages/Attractions";
import Deals from "./Pages/Deals";
import DealDetails from "./Pages/DealDetails";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Cart from "./Pages/Cart";
import Favorites from "./Pages/Favorites";

const AppRoutes = () => {
  return (
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

      {/* ראוטים בלי Header */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/favorites" element={<Favorites />} /> 
    </Routes>
  );
};

export default AppRoutes; 