import "./Login.css";
import logo from "../../assets/logo.png";
import { useState } from "react";

import DraftsRoundedIcon from "@mui/icons-material/DraftsRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";

import Swal from "sweetalert2";

const Form_Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

        <div className="inputs">
          <div className="input">
            <label htmlFor="email">Email</label>
            <div>
              <input
                type="email"
                id="email"
                placeholder="name@mail.com"
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
                value={formData.password}
                onChange={handleChange}
              />
              <LockOpenRoundedIcon />
            </div>
          </div>

          <div className="input">
            <button onClick={handleLogin}>Iniciar Sesión</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Form_Login;
