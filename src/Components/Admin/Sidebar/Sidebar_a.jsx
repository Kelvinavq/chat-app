import React, { useState, useEffect, useRef } from "react";
import "./Sidebar.css";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";

import imgUser from "../../../assets/logo.png";

import { Link, useLocation } from "react-router-dom";

const Sidebar_a = () => {
  const location = useLocation();
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const isActive = (pathname) => {
    return location.pathname === pathname ? "active" : "";
  };

  const toggleNotificationsDropdown = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleClickOutside = (event) => {
    if (
      notificationsRef.current &&
      !notificationsRef.current.contains(event.target)
    ) {
      setShowNotificationsDropdown(false);
    }
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setShowProfileDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Elimina el token de almacenamiento local
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("adminId");
    // Redirige al usuario a la página de login
    window.location.reload();
  };

  return (
    <>
      <div className="sidebar">
        <div className="items_top">
          <Link
            to={"/admin/chats"}
            className={`item ${isActive("/admin/chats")}`}
          >
            <QuestionAnswerOutlinedIcon />
            <small>Chats</small>
          </Link>

          <Link
            to={"/admin/equipos"}
            className={`item ${isActive("/admin/equipos")} 
            ${isActive("/admin/agentes")} 
            ${isActive("/admin/agentes-suspendidos")}`}
          >
            <GroupOutlinedIcon />
            <small>Equipos</small>
          </Link>

          <Link
            to={"/admin/archivados"}
            className={`item ${isActive("/admin/archivados")}`}
          >
            <ArchiveOutlinedIcon />
            <small>Archivados</small>
          </Link>
        </div>
        <div className="items_bottom">
          <Link
            to={"/admin/clientes"}
            className={`item ${isActive("/admin/clientes")} `}
          >
            <ManageAccountsOutlinedIcon />
            <small>Clientes</small>
          </Link>
          <Link
            to={"/admin/ajustes"}
            className={`item ${isActive("/admin/ajustes")} ${isActive(
              "/admin/ajustes/perfil"
            )}`}
          >
            <SettingsOutlinedIcon />
            <small>Ajustes</small>
          </Link>
          <div
            className="item notification"
            onClick={toggleNotificationsDropdown}
            ref={notificationsRef}
          >
            <NotificationsNoneOutlinedIcon />
            <small>Nuevas</small>
            {showNotificationsDropdown && (
              <div className="dropdown">
                <p>Mensaje 1</p>
                <p>Mensaje 2</p>
                <p>Mensaje 3</p>
              </div>
            )}
          </div>

          <div
            className="item"
            onClick={toggleProfileDropdown}
            ref={profileRef}
          >
            <img src={imgUser} alt="User" />
            {showProfileDropdown && (
              <div className="dropdown">
                <button onClick={handleLogout}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar_a;
