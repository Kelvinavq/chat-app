import React, { useState, useEffect } from "react";
import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Agents_a from "../../Components/Admin/Agents/Agents_a";

const Page_agents_a = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verificar si el adminId está presente en el localStorage
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Acceso no permitido, debe iniciar sesión",
        timer: 3000,
        didClose: () => {
          window.location = "/login";
        },
      });
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return null;
  }
  return (
    <>
      <div className="agentes_container">
        <Sidebar_a />
        <div className="inner_container">
          <Agents_a />
        </div>
      </div>
    </>
  );
};

export default Page_agents_a;
