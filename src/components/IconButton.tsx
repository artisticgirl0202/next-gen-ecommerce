import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string };

export const IconButton: React.FC<Props> = ({ children, label, ...rest }) => (
  <button {...rest} className={`p-2 rounded-md ${rest.className ?? ''}`}>
    {children}
    {label && <span className="sr-only">{label}</span>}
  </button>
);
