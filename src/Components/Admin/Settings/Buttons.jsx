import { Link, useLocation } from "react-router-dom";

const Buttons = () => {
  const role = localStorage.getItem("role");

  return (
    <>
      <div className="buttons">
        {role === "admin" ? (
          <>
            <div
              className={`link ${
                location.pathname === "/admin/ajustes" ? "active" : ""
              }`}
            >
              <Link to={"/admin/ajustes"}>Perfil</Link>
            </div>

            <div className="link">|</div>
            <div
              className={`link ${
                location.pathname === "/admin/ajustes/mensajes" ? "active" : ""
              }`}
            >
              <Link to={"/admin/ajustes/mensajes"}>Mensajes automáticos</Link>
            </div>
          </>
        ) : (
          <>
            <div
              className={`link ${
                location.pathname === "/admin/ajustes" ? "active" : ""
              }`}
            >
              <Link to={"/admin/ajustes"}>Perfil</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Buttons;
