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

  const isActive = (pathname) => {
    return location.pathname === pathname ? "active" : "";
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

          <div className="item">
            <NotificationsNoneOutlinedIcon />
            <small>Nuevas</small>
          </div>

          <div className="item">
            <img src={imgUser} alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar_a;
