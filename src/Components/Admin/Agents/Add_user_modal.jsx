import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import CloseIcon from "@mui/icons-material/Close";

const Add_user_modal = ({ teams, onClose, onSubmit }) => {
  const [newAgentData, setNewAgentData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    team: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleAgentFormSubmit = async (event) => {
    event.preventDefault();
    // Validar campos
    const formValid = validateForm();
    if (formValid) {
      onSubmit(newAgentData);
    }
  };

  const validateForm = () => {
    let formIsValid = true;
    const { username, email, password } = newAgentData;
    const newErrors = {};

    // Validar campo de nombre de usuario
    if (!username) {
      newErrors.username = "El nombre de usuario es obligatorio.";
      formIsValid = false;
    }

    // Validar campo de correo electrónico
    if (!email) {
      newErrors.email = "El correo electrónico es obligatorio.";
      formIsValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingrese un correo electrónico válido.";
      formIsValid = false;
    }

    // Validar campo de contraseña
    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
      formIsValid = false;
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
      formIsValid = false;
    }

    // Actualizar el estado de los errores
    setErrors(newErrors);

    return formIsValid;
  };

  useEffect(() => {
    setErrors({
      username: "",
      email: "",
      password: "",
    });
  }, [newAgentData]);

  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Verificar si el clic ocurrió dentro de una ventana de Swal
        const isClickInsideSwal =
          event.target.closest(".swal2-container") !== null;

        // Cerrar el modal solo si el clic no ocurrió dentro de una ventana de Swal
        if (!isClickInsideSwal) {
          onClose(false);
        }
      }
    };

    // Añadir el evento de escucha al hacer clic fuera del modal
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Limpiar el evento de escucha al desmontar el componente
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef, onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal" ref={modalRef}>
        <button className="close-modal" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="title">
          <h4>Agregar nuevo usuario</h4>
        </div>
        <form onSubmit={handleAgentFormSubmit} className="content-modal">
          <div className="left">
            <div className="input">
              <label>Nombre de usuario</label>
              <input
                type="text"
                value={newAgentData.username}
                placeholder="Ej. Jondoe"
                onChange={(e) =>
                  setNewAgentData({ ...newAgentData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="input">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={newAgentData.email}
                placeholder="user@mail.com"
                onChange={(e) =>
                  setNewAgentData({ ...newAgentData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="input">
              <label>Contraseña</label>
              <input
                type="password"
                value={newAgentData.password}
                placeholder="min. 8 carácteres"
                onChange={(e) =>
                  setNewAgentData({ ...newAgentData, password: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="right">
            <div className="input">
              <label>Rol</label>
              <select
                value={newAgentData.role}
                onChange={(e) =>
                  setNewAgentData({ ...newAgentData, role: e.target.value })
                }
              >
                <option value="">Selecciona un rol</option>
                <option value="agent">Agente</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="input">
              <label>Equipo</label>
              <select
                value={newAgentData.team}
                onChange={(e) =>
                  setNewAgentData({ ...newAgentData, team: e.target.value })
                }
              >
                <option value="">Selecciona un equipo</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.team_name}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input">
              <button type="submit">Registrar agente</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_user_modal;
