// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./Footer.css";

// const Footer = ({ currentPage = "home" }) => {
//   const navigate = useNavigate();

//   const scrollToSection = (sectionId) => {
//     if (currentPage === "home") {
//       const element = document.querySelector(sectionId);
//       if (element) {
//         element.scrollIntoView({ behavior: "smooth", block: "start" });
//       }
//     } else {
//       navigate("/");
//       setTimeout(() => {
//         const element = document.querySelector(sectionId);
//         if (element) {
//           element.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//       }, 500);
//     }
//   };

//   return (
//     <footer>
//       <div className="footer-content">
//         <div className="footer-links">
//           <a
//             onClick={() => scrollToSection("#home")}
//             style={{ cursor: "pointer" }}
//           >
//             עמוד הבית
//           </a>
//           <a
//             onClick={() => scrollToSection("#about")}
//             style={{ cursor: "pointer" }}
//           >
//             אודות
//           </a>
//           <a
//             onClick={() => scrollToSection("#packages")}
//             style={{ cursor: "pointer" }}
//           >
//             חבילות
//           </a>
//           <a
//             onClick={() => navigate("/attractions")}
//             style={{ cursor: "pointer" }}
//             className={currentPage === "attractions" ? "active" : ""}
//           >
//             אטרקציות
//           </a>
//           <a
//             onClick={() => navigate("/contact")}
//             style={{ cursor: "pointer" }}
//             className={currentPage === "contact" ? "active" : ""}
//           >
//             צור קשר
//           </a>
//           <a href="#">תנאי שימוש</a>
//           <a href="#">פרטיות</a>
//         </div>
//         <p>&copy; 2026 Smart Vacation Planner. כל הזכויות שמורות.</p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-links">
          <a onClick={() => navigate("/")}>עמוד הבית</a>
          <a onClick={() => navigate("/about")}>אודות</a>
          <a onClick={() => navigate("/deals")}>חבילות</a>
          <a onClick={() => navigate("/attractions")}>אטרקציות</a>
          <a onClick={() => navigate("/contact")}>צור קשר</a>
          <a href="#">תנאי שימוש</a>
          <a href="#">פרטיות</a>
        </div>
        <p>&copy;  כל הזכויות שמורות. 2026 Smart Vacation Planner.</p>
      </div>
    </footer>
  );
};

export default Footer;