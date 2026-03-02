import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header&Footer/Header";
import Footer from "./Header&Footer/Footer";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;