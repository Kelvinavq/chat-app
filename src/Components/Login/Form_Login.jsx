import "./Login.css";
import logo from "../../assets/logo.png";
import { useState } from "react";

import DraftsRoundedIcon from "@mui/icons-material/DraftsRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import Config from "../../Config/Config";

import Swal from "sweetalert2";

const Form_Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { email, password } = formData;

    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ingrese un correo electrónico válido",
      });
      return false;
    } else if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe contener al menos 8 carácteres",
      });
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validar campos antes de enviar al servidor
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${Config.server_api}api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Si la solicitud fue exitosa, obtiene el token JWT del cuerpo de la respuesta
        const data = await response.json();

        // Guarda el token JWT en el almacenamiento local
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminId", data.adminId);
        localStorage.setItem("role", data.role);

        window.location = "/admin/chats";
      } else {
        // Si la solicitud falló, muestra un mensaje de error
        const { message } = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        });
      }
    } catch (error) {
      // Si hay un error en la solicitud, muestra un mensaje de error genérico
      console.error("Error en la solicitud de inicio de sesión:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error en la solicitud de inicio de sesión",
      });
    }
  };

  return (
    <>
      <div className="form_login">
        <div className="head">
          <div className="logo">
            <img src={logo} alt="" />
          </div>
          <div className="content">
            <h2>Iniciar Sesión</h2>
            <p>
              Inicia sesión en tu cuenta del chat de{" "}
              <strong>463 Siempre Paga</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="inputs">
          <div className="input">
            <label htmlFor="email">Email</label>
            <div>
              <input
                type="email"
                id="email"
                placeholder="name@mail.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <DraftsRoundedIcon />
            </div>
          </div>

          <div className="input">
            <label htmlFor="password">Contraseña</label>
            <div>
              <input
                type="password"
                id="password"
                placeholder="Contraseña"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <LockOpenRoundedIcon />
            </div>
          </div>

          <div className="input">
            <button type="submit">Iniciar Sesión</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Form_Login;
