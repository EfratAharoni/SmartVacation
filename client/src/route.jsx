// import { Routes, Route } from "react-router-dom";
// import HomePage from "./HomePage";
// import Login from "./Login";
// import Register from "./Register";
// import Attractions from "./Attractions";
// import Deals from "./Deals";
// import Contact from "./Contact";
// import About from "./About";

// const AppRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<HomePage />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/attractions" element={<Attractions />} />
//       <Route path="/deals" element={<Deals />} />
//       <Route path="/contact" element={<Contact />} />
//       <Route path="/about" element={<About />} />
//     </Routes>
//   );
// };

// export default AppRoutes;

import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import HomePage from "./HomePage";
import Login from "./Login";
import Register from "./Register";
import Attractions from "./Attractions";
import Deals from "./Deals";
import Contact from "./Contact";
import About from "./About";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ראוטים עם Header */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* ראוטים בלי Header */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes; 