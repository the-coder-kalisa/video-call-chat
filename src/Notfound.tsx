import React from "react";
import Navigation from "./components/Navigation";

function Notfound() {
  return (
    <div>
      <Navigation />
      <div className="flex h-screen w-full items-center justify-center">
        This page is not found  
      </div>
    </div>
  );
}

export default Notfound;
