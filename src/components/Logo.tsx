import React from "react";
import { Link } from "react-router-dom";
import AnimatedLogo from "./AnimatedLogo";

export default function Logo() {
  return (
    <Link
      to="/"
      className="fixed z-40 top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2"
      aria-label="Lansa home"
    >
      <AnimatedLogo size={36} className="select-none" />
    </Link>
  );
}