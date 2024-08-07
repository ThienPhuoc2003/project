import React from "react";

interface LayoutProps {
  children: React.ReactNode; // Explicitly typing children
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
