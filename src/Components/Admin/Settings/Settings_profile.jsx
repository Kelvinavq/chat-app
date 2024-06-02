import React, { useState, useEffect } from "react";
import "./Settings.css";
import Buttons from "./Buttons";
import img from "../../../assets/logo.png";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import Swal from "sweetalert2";
import Button_sidebar from "../Sidebar/Button_sidebar";

import Config from "../../../Config/Config";

const Settings_profile = () => {
  const adminId = localStorage.getItem("adminId");
  const [adminInfo, setAdminInfo] = useState({
    username: "",
    email: "",
    Image: "",
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch(
          `${Config.server_api}api/admin/admin-info/${adminId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAdminInfo({
            username: data.username,
            email: data.email,
            Image: data.image,
          });
        } else {
          console.error("Failed to fetch admin info:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };

    fetchAdminInfo();
  }, [adminId]);

  const handleUpdateInfo = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Actualizar información",
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Nuevo usuario" value="${adminInfo.username}">
        <input id="swal-input2" class="swal2-input" placeholder="Nuevo correo" value="${adminInfo.email}">
      `,
      focusConfirm: false,
      confirmButtonText: "Actualizar",
      showCancelButton: true,
      preConfirm: () => {
        return [
          document.getElementById("swal-input1").value,
          document.getElementById("swal-input2").value,
        ];
      },
    });

    if (formValues) {
      const [newUsername, newEmail] = formValues;

      try {
        const response = await fetch(
          `${Config.server_api}api/admin/update-info/${adminId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: newUsername,
              email: newEmail,
            }),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Información actualizada",
            text: "La información del administrador ha sido actualizada correctamente.",
          });
          setAdminInfo({ username: newUsername, email: newEmail });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo actualizar la información. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error. Inténtalo de nuevo más tarde.",
        });
      }
    }
  };

  const handleChangePassword = async () => {
    const { value: newPassword } = await Swal.fire({
      title: "Cambiar contraseña",
      input: "password",
      inputLabel: "Nueva contraseña",
      inputPlaceholder: "Introduce la nueva contraseña",
      confirmButtonText: "Actualizar",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
    });

    if (newPassword) {
      try {
        const response = await fetch(
          `${Config.server_api}api/admin/change-password/${adminId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              password: newPassword,
            }),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Contraseña actualizada",
            text: "La contraseña ha sido actualizada correctamente.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo actualizar la contraseña. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error. Inténtalo de nuevo más tarde.",
        });
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(
          `${Config.server_api}api/admin/update-image/${adminId}`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          Swal.fire({
            icon: "success",
            title: "Imagen actualizada",
            text: "La imagen de perfil ha sido actualizada correctamente.",
            didClose: () => {
              window.location.reload();
            },
          });
          setImage(data.image);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo actualizar la imagen. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error. Inténtalo de nuevo más tarde.",
        });
      }
    }
  };

  return (
    <>
      <div className="ajustes">
        <div className="title">
          <Button_sidebar/>
          <h2>Ajustes - Cuenta</h2>
        </div>

        <Buttons />

        <div className="content">
          <div className="img">
            <img
              src={
                adminInfo.Image
                  ? `http://localhost/chat-app/Server/public/assets/profile/${adminInfo.Image}`
                  : img
              }
              alt=""
            />
            <button>
              <label htmlFor="file-upload">
                <CameraAltOutlinedIcon />
              </label>
            </button>
            <input
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>

          <div className="text">
            <p>{adminInfo.email}</p>
            <p>{adminInfo.username}</p>
          </div>

          <div className="buttons">
            <button onClick={handleUpdateInfo}>Actualizar información</button>
            <button onClick={handleChangePassword}>Cambiar contraseña</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings_profile;
