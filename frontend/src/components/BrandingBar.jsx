import React from "react";
import logo from "../assets/logo.svg";

function BrandingBar() {
  return (
    <header style={{display: "flex", alignItems: "center", background: "#23272F", color: "#fafafa", padding: "0.5rem 1rem"}}>
      <img src={logo} alt="MouseTrap logo" style={{height: 40, marginRight: 16}} />
      <h1 style={{fontWeight: 700, fontSize: "1.4rem"}}>MouseTrap</h1>
      <span style={{marginLeft: "auto", fontSize: "1rem", opacity: 0.7}}>v0.1.0</span>
    </header>
  );
}

export default BrandingBar;