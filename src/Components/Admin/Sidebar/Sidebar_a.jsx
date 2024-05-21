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

import io from "socket.io-client";
const socket = io("http://localhost:4000");

const Sidebar_a = ({ onChatClick }) => {
  const location = useLocation();
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [chats, setChats] = useState([]);
  const adminId = localStorage.getItem("adminId");
  const [adminTeamIds, setAdminTeamIds] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});

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

  useEffect(() => {
    const fetchAdminTeams = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/admin/teams/${adminId}`
        );
        if (response.ok) {
          const data = await response.json();
          // Extrae los IDs de los equipos y actualiza el estado
          const teamIds = data.teams.map((team) => team.id);
          setAdminTeamIds(teamIds);
        } else {
          console.error("Failed to fetch admin teams");
        }
      } catch (error) {
        console.error("Error fetching admin teams:", error);
      }
    };

    fetchAdminTeams();
  }, [adminId]);

  useEffect(() => {
    if (adminTeamIds.length > 0) {
      fetch(`http://localhost:4000/api/chats/list/${adminId}`)
        .then((response) => response.json())
        .then((data) => {
          const filteredChats = data.chats.filter((chat) =>
            adminTeamIds.includes(chat.team_id)
          );
          setChats(filteredChats);
        })
        .catch((error) => {
          console.error("Error fetching chat list:", error);
        });

      socket.on("newChatNotification", (chatData) => {
        if (adminTeamIds.includes(chatData.team_id)) {
          // Filtrar el nuevo chat
          chatData.lastMessageTime = chatData.timestamp;
          setChats((prevChats) => {
            const updatedChats = [chatData, ...prevChats];
            return sortChatsByTime(updatedChats);
          });
        }
      });

      socket.on("updateUserStatus", ({ clientId, isOnline }) => {
        setOnlineStatus((prevStatus) => ({
          ...prevStatus,
          [clientId]: isOnline,
        }));
      });

      return () => {
        socket.off("newChatNotification");
        socket.off("updateUserStatus");
      };
    }
  }, [adminId, adminTeamIds]);

  // Función para ordenar los chats por marca de tiempo
  const sortChatsByTime = (chats) => {
    return chats.slice().sort((a, b) => b.lastMessageTime - a.lastMessageTime);
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
                {sortChatsByTime(chats).map((chat) => (
                  <div
                    key={chat.id}
                    className="noti"
                    onClick={() => onChatClick(chat)}
                  >
                    <div className="img">
                      <img src={imgUser} alt="" />
                    </div>
                    <div className="content">
                      <h4>{chat.username}</h4>
                      <p>{chat.team_name}</p>
                    </div>
                  </div>
                ))}
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
