import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import CloseIcon from "@mui/icons-material/Close";

export const EditAgentModal = ({ onClose, onSubmit, agentData, teams }) => {
  const modalRef = useRef();

  const [formData, setFormData] = useState({
    id: agentData.id,
    username: agentData.username,
    email: agentData.email,
    password: "",
    role: agentData.role,
    teams: teams.map((team) => ({
      ...team,
      isChecked:
        agentData && agentData.teams
          ? agentData.teams.some((userTeam) => userTeam.id === team.id)
          : false,
    })),
  });

  useEffect(() => {
    const userId = agentData.id;

    const fetchAdminTeams = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/admin/teams/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          // // Extrae los IDs de los equipos y actualiza el estado
          const teamIds = data.teams.map((team) => team.id);
          setFormData((prevFormData) => ({
            ...prevFormData,
            teams: prevFormData.teams.map((team) => ({
              ...team,
              isChecked: teamIds.includes(team.id),
            })),
          }));
        } else {
          console.error("Failed to fetch user teams");
        }
      } catch (error) {
        console.error("Error fetching user teams:", error);
      }
    };

    fetchAdminTeams();
  }, [agentData.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        const isClickInsideSwal =
          event.target.closest(".swal2-container") !== null;
        if (!isClickInsideSwal) {
          onClose(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef, onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTeamChange = (teamId) => {
    const updatedTeams = formData.teams.map((team) =>
      team.id === teamId ? { ...team, isChecked: !team.isChecked } : team
    );
    setFormData((prevFormData) => ({
      ...prevFormData,
      teams: updatedTeams,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password && formData.password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    const updatedAgentData = { ...formData };
    if (!formData.password) {
      delete updatedAgentData.password; 
    }

    onSubmit(updatedAgentData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" ref={modalRef}>
        <button className="close-modal" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="title">
          <h4>Editar usuario ({formData.username})</h4>
        </div>
        <form onSubmit={handleSubmit} className="content-modal">
          <div className="left">
            <div className="input">
              <label>Nombre de usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ej. Jondoe"
                required
              />
            </div>
            <div className="input">
              <label>Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@mail.com"
                required
              />
            </div>
            <div className="input">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="min. 8 carácteres"
              />
            </div>
          </div>

          <div className="right">
            <div className="input">
              <label>Rol</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="">Selecciona un rol</option>
                <option value="agent">Agente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="input">
              <label>Equipos</label>
              <div className="teams-checkboxes">
                {formData.teams.map((team) => (
                  <div className="input">
                    <label className="switch" htmlFor={`team-${team.id}`}>
                      <input
                        type="checkbox"
                        id={`team-${team.id}`}
                        checked={team.isChecked}
                        onChange={() => handleTeamChange(team.id)}
                        />
                      <span className="slider"></span>
                    </label>
                        <p>{team.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="input">
              <button type="submit">Actualizar usuario</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
