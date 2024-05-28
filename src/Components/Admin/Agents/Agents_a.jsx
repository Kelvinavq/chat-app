import "./Agents.css";
import Buttons from "../Teams/Buttons";
import Add_user_modal from "./Add_user_modal";
import { EditAgentModal } from "./EditAgentModal";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import img from "../../../assets/logo.png";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SmsIcon from "@mui/icons-material/Sms";
import Groups2Icon from "@mui/icons-material/Groups2";

import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import Config from "../../../Config/Config";

const Agents_a = () => {
  const [Agents, setAgents] = useState([]);
  const [counter, setCounter] = useState(0);

  const [Teams, setTeams] = useState([]);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAgentInfo, setSelectedAgentInfo] = useState(null);

  const [editAgentData, setEditAgentData] = useState(null);
  const [showEditAgentModal, setShowEditAgentModal] = useState(false);

  const [teamsWithUserStatus, setTeamsWithUserStatus] = useState([]);

  const [newAgentData, setNewAgentData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    team: "",
  });

  useEffect(() => {
    const obtenerEquipos = async () => {
      try {
        const response = await fetch(`${Config.server_api}api/teams`, {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data) {
            setTeams(data);
          } else {
            Swal.fire({
              icon: "info",
              title: "Sin equipos registrados",
              text: "No hay equipos registrados en este momento.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al obtener los equipos. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        console.error("Error al obtener los equipos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al obtener los equipos. Inténtalo de nuevo más tarde.",
        });
      }
    };

    const obtenerAgentes = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/agents/get-all-users`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data) {
            setAgents(data);
            setCounter(data.length);
          } else {
            Swal.fire({
              icon: "info",
              title: "Sin agentes registrados",
              text: "No hay agentes registrados en este momento.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al obtener los agentes. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        console.error("Error al obtener los agentes:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al obtener los agentes. Inténtalo de nuevo más tarde.",
        });
      }
    };

    obtenerEquipos();
    obtenerAgentes();
  }, []);

  const handleAddAgentClick = () => {
    if (Teams.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Primero debes registrar al menos un equipo.",
        didClose: () => {
          window.location = "/admin/equipos";
        },
      });
    } else {
      setShowAddAgentModal(true);
    }
  };

  const handleAgentFormSubmit = async (newAgentData) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/agents/register`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAgentData),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Usuario añadido correctamente.",
          didClose: () => {
            window.location.reload();
          },
        });

        setShowAddAgentModal(false);
      } else {
        const responseData = await response.json();

        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            responseData.message ||
            "Error al agregar el agente. Inténtalo de nuevo más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al agregar el agente:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al agregar el agente. Inténtalo de nuevo más tarde.",
      });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAgents = Agents.filter((agent) =>
    agent.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionClick = async (option, agentId, agentStatus) => {
    switch (option) {
      case "verDetalles":
        await fetchAgentDetails(agentId);
        break;
      case "editar":
        await fetchTeamsWithUserStatus(agentId);
        handleEditAgentClick(agentId);
        break;
      case "inhabilitar":
        if (agentStatus === "active") {
          await markAsInactive(agentId);
        } else if (agentStatus === "suspended") {
          await markAsActive(agentId);
        }
        break;
      default:
        break;
    }
  };

  const fetchAgentDetails = async (agentId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/agents/details/${agentId}`
      );
      if (response.ok) {
        const data = await response.json();
        data.teams = data.teams.map((team) => ({ team: team }));
        setSelectedAgentInfo(data);
      } else {
        console.error("Error al obtener la información del agente");
      }
    } catch (error) {
      console.error("Error al obtener la información del agente:", error);
    }
  };

  const markAsInactive = async (agentId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/agents/${agentId}/disable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("usuario suspendido exitosamente");
        Swal.fire({
          title: "usuario suspendido exitosamente",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al inhabilitar el usuario");
      }
    } catch (error) {
      console.error("Error al inhabilitar el usuario:", error);
    }
  };

  const markAsActive = async (agentId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/agents/${agentId}/enable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("usuario habilitado exitosamente");
        Swal.fire({
          title: "usuario habilitado exitosamente",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al habilitar el usuario");
      }
    } catch (error) {
      console.error("Error al habilitar el usuario:", error);
    }
  };

  const fetchTeamsWithUserStatus = async (agentId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/teams/get-teams-user/${agentId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeamsWithUserStatus(data);
      } else {
        console.error("Error al obtener los equipos con el estado del usuario");
      }
    } catch (error) {
      console.error(
        "Error al obtener los equipos con el estado del usuario:",
        error
      );
    }
  };

  const handleEditAgentClick = (agentId) => {
    const agentToEdit = Agents.find((agent) => agent.id === agentId);
    setEditAgentData(agentToEdit);
    setShowEditAgentModal(true);
  };

  const handleEditFormSubmit = async (updatedAgentData) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/agents/update/${updatedAgentData.id}`, // Corrige la URL para apuntar a la ruta de agentes
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAgentData),
        }
      );
  
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Usuario actualizado correctamente.",
          didClose: () => {
            window.location.reload();
          },
        });
  
        setShowEditAgentModal(false);
      } else {
        const responseData = await response.json();
  
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            responseData.message ||
            "Error al actualizar el agente. Inténtalo de nuevo más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al actualizar el agente:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el agente. Inténtalo de nuevo más tarde.",
      });
    }
  };
  

  return (
    <>
      <div className="agents">
        <div className="left">
          <div className="title">
            <h2>Agentes</h2>
          </div>

          <Buttons />

          <div className="filters">
            <div className="input">
              <input
                type="text"
                placeholder="Buscar agente"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="button">
              <button onClick={handleAddAgentClick}>Añadir agente</button>
            </div>
          </div>

          <div className="counter">
            <h4>Total ({counter})</h4>
          </div>

          <div className="tabla">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Role</th>
                  <th scope="col">Estatus</th>
                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                {filteredAgents.map((agente, index) => (
                  <tr key={index}>
                    <td data-label="Nombre" className="name">
                      <div className="circle">
                        <img src={img} alt="" />
                      </div>
                      <div className="content">
                        <p>{agente.username}</p> <span>{agente.email}</span>{" "}
                      </div>
                    </td>
                    <td data-label="Role" className={agente.role}>
                      <span>{agente.role}</span>
                    </td>
                    <td
                      data-label="Estatus"
                      className={`status ${agente.status}`}
                    >
                      {agente.status}
                    </td>
                    <td data-label="">
                      <DropdownMenu
                        options={[
                          { label: "Ver detalles", value: "verDetalles" },
                          { label: "Editar", value: "editar" },
                          {
                            label:
                              agente.status === "active"
                                ? "Suspender"
                                : "Habilitar",
                            value: "inhabilitar",
                          },
                        ]}
                        onOptionClick={(option) =>
                          handleOptionClick(option, agente.id, agente.status)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedAgentInfo != null ? (
          <div className="right">
            <div className="inner_right">
              <div className="card">
                <div className="inner_card agent">
                  <div className="circle">
                    <img src={img} alt="" />
                  </div>
                  <div className="content">
                    <p>
                      {selectedAgentInfo.username}{" "}
                      <span className={selectedAgentInfo.role}>
                        {selectedAgentInfo.role}
                      </span>
                    </p>
                    <p>{selectedAgentInfo.email}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="inner_card team">
                  <div className="title">
                    <h4>Equipos</h4>
                  </div>

                  <div className="grid">
                    <div className="left">
                      {selectedAgentInfo.teams.map((team, index) => (
                        <div className="item" key={index}>
                          <div className="circle">{team.team.charAt(0)}</div>
                          <div className="content">{team.team}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="inner_card metrics">
                  <div className="title">
                    <h4>Estadísticas</h4>
                  </div>

                  <div className="list">
                    <div className="item">
                      <div className="icon">
                        <ChatBubbleIcon />
                        <span>Total chats</span>
                      </div>
                      <div className="content">
                        <p>{selectedAgentInfo.chat_count}</p>
                      </div>
                    </div>
                    <div className="item">
                      <div className="icon">
                        <SmsIcon />
                        <span>Chats abiertos</span>
                      </div>
                      <div className="content">
                        <p>{selectedAgentInfo.active_chat_count}</p>
                      </div>
                    </div>
                    <div className="item">
                      <div className="icon">
                        <SmsIcon />
                        <span>Chats cerrados</span>
                      </div>
                      <div className="content">
                        <p>{selectedAgentInfo.inactive_chat_count}</p>
                      </div>
                    </div>
                    <div className="item">
                      <div className="icon">
                        <Groups2Icon />
                        <span>Equipos pertenecientes</span>
                      </div>
                      <div className="content">
                        <p>{selectedAgentInfo.team_count}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="right">
            <div className="inner_right">
              <div className="card">
                <div className="inner_card agent">
                  <div className="content">
                    <p>
                      Seleccione "ver detalles" para ver los detalles de un
                      usuario
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar usuario */}
        {showAddAgentModal && (
          <Add_user_modal
            teams={Teams}
            onClose={() => setShowAddAgentModal(false)}
            onSubmit={handleAgentFormSubmit}
          />
        )}

        {/* Modal para editar usuario */}

        {showEditAgentModal && (
          <EditAgentModal
            agentData={editAgentData}
            teams={teamsWithUserStatus}
            onClose={() => setShowEditAgentModal(false)}
            onSubmit={handleEditFormSubmit}
          />
        )}
      </div>
    </>
  );
};

const DropdownMenu = ({ options, onOptionClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleOptionClick = (option) => {
    onOptionClick(option);
    setShowMenu(false); // Ocultar el menú después de seleccionar una opción
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      // Si el clic no está dentro del menú, ocultarlo
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={menuRef}>
      <button onClick={() => setShowMenu(!showMenu)}>
        <MoreHorizIcon />
      </button>
      {showMenu && (
        <div className="dropdown-content">
          {options.map((option, index) => (
            <button key={index} onClick={() => handleOptionClick(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents_a;
