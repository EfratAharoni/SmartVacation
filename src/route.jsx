import { Routes, Route } from "react-router-dom";
import VacationPlanner from "./HomePage";
import Login from "./Login";
import Register from "./Register";

const AppRoutes = () => {
  return (
    <Routes>
      {/* דף הבית */}
      <Route path="/" element={<VacationPlanner />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* כאן יבואו נתיבים נוספים בעתיד, למשל: */}
      {/* <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
};

export default AppRoutes;
