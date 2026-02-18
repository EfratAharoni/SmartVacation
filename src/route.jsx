import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Login from "./Login";
import Register from "./Register";
import Attractions from "./Attractions";
import Deals from "./Deals";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/attractions" element={<Attractions />} />
      <Route path="/deals" element={<Deals />} />
    </Routes>
  );
};

export default AppRoutes;
