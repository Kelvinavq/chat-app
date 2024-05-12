import { Link, useLocation } from "react-router-dom";

const Buttons = () => {
  return (
    <>
 <div className="buttons">
        <div className={`link ${location.pathname === "/admin/equipos" ? "active" : ""}`}>
          <Link to={"/admin/equipos"}>Equipos</Link>
        </div>

        <div className={`link ${location.pathname === "/admin/agentes" ? "active" : ""}`}>
          <Link to={"/admin/agentes"}>Agentes</Link>
        </div>

        <div className="link">|</div>

        <div className={`link ${location.pathname === "/admin/agentes-suspendidos" ? "active" : ""}`}>
          <Link to={"/admin/agentes-suspendidos"}>Agentes suspendidos</Link>
        </div>
      </div>
    </>
  );
};

export default Buttons;
