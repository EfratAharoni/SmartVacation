import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ currentPage = "home" }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const scrollToSection = (sectionId) => {
    if (currentPage === "home") {
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsMobileMenuOpen(false);
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <nav>
        <div className="logo" onClick={() => navigate("/")}>
          Smart Vacation ✈️
        </div>
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          ☰
        </button>
        <div className={`nav-center ${isMobileMenuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            <li>
              <a
                onClick={() => {
                  scrollToSection("#home");
                  setIsMobileMenuOpen(false);
                }}
                className={currentPage === "home" ? "active" : ""}
              >
                עמוד הבית
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  scrollToSection("#about");
                  setIsMobileMenuOpen(false);
                }}
              >
                קצת עלינו
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  scrollToSection("#packages");
                  setIsMobileMenuOpen(false);
                }}
              >
                יעדים מומלצים
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/attractions");
                  setIsMobileMenuOpen(false);
                }}
                className={currentPage === "attractions" ? "active" : ""}
              >
                אטרקציות
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/contact");
                  setIsMobileMenuOpen(false);
                }}
                className={currentPage === "contact" ? "active" : ""}
              >
                צור קשר
              </a>
            </li>
          </ul>
          <div className="auth-buttons">
            <button className="btn btn-login" onClick={handleLogin}>
              התחברות
            </button>
            <button className="btn btn-register" onClick={handleRegister}>
              הרשמה
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
