import React from "react";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/60 ${className}`}
    >
      {children}
    </div>
  );
}
