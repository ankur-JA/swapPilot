import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return <div className={`bg-base-100 rounded-box p-6 shadow-lg border border-base-300 ${className}`}>{children}</div>;
};
