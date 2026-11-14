import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-links">
          <a onClick={() => navigate("/")}>{t("footer.home")}</a>
          <a onClick={() => navigate("/about")}>{t("footer.about")}</a>
          <a onClick={() => navigate("/deals")}>{t("footer.deals")}</a>
          <a onClick={() => navigate("/attractions")}>{t("footer.attractions")}</a>
          <a onClick={() => navigate("/contact")}>{t("footer.contact")}</a>
          <a href="#">{t("footer.terms")}</a>
          <a href="#">{t("footer.privacy")}</a>
        </div>
        <p>{t("footer.rights")}</p>
      </div>
    </footer>
  );
};

export default Footer;