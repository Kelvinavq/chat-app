import { Link, useLocation } from "react-router-dom";

const Buttons = () => {
  return (
    <>
      <div className="buttons">
        <div
          className={`link ${
            location.pathname === "/admin/ajustes" ? "active" : ""
          }`}
        >
          <Link to={"/admin/ajustes"}>Mensajes automaticos</Link>
        </div>

        <div className="link">
          |
        </div>

        <div
          className={`link ${
            location.pathname === "/admin/ajustes/perfil" ? "active" : ""
          }`}
        >
          <Link to={"/admin/ajustes/perfil"}>Perfil</Link>
        </div>
      </div>
    </>
  );
};

export default Buttons;
