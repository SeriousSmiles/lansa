import React from "react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="fixed z-40 top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2"
      aria-label="Lansa home"
    >
      <img
        src="/lovable-uploads/2c107590-3bd8-4711-a705-041a59395cbb.png"
        alt="Lansa"
        className="h-9 w-auto select-none"
        draggable={false}
      />
    </Link>
  );
}