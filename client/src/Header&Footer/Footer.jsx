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