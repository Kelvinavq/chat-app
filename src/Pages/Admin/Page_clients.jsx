import React, { useState, useEffect } from "react";
import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Client from "../../Components/Admin/Clients/Client";

const Page_clients = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roleStatus, setrole] = useState(false);

  useEffect(() => {
    // Verificar si el adminId está presente en el localStorage
    const adminId = localStorage.getItem("adminId");
    const role = localStorage.getItem("role");

    
    if (role === "admin" || role === "agent") {
      setrole(true);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Acceso no permitido",
        timer: 3000,
        didClose: () => {
          window.location.back();
        },
      });
    }

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

  if (!isLoggedIn || !roleStatus) {
    return null;
  }

  
  return (
    <>
      <div className="clients_container">
        <Sidebar_a />
        <div className="inner_container">
          <Client />
        </div>
      </div>
    </>
  );
};

export default Page_clients;
