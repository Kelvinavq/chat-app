import React, { useState, useEffect, useRef } from "react";
import "./Teams.css";
import Buttons from "./Buttons";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SmsIcon from "@mui/icons-material/Sms";
import Groups2Icon from "@mui/icons-material/Groups2";
import Swal from "sweetalert2";
import Config from "../../../Config/Config";
import Buttons_sidebar from "../Sidebar/Button_sidebar"

const Teams = () => {
  const [Teams, setTeams] = useState([]);
  const [counter, setCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeamInfo, setSelectedTeamInfo] = useState(null);


  useEffect(() => {
    const obtenerEquipos = async () => {
      try {
        const url = new URL(`${Config.server_api}api/teams/info`);

        const response = await fetch(url, {
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
            setCounter(data.length);
          } else {
            // Manejar el caso en que no hay equipos
            Swal.fire({
              icon: "info",
              title: "Sin equipos registrados",
              text: "No hay equipos registrados en este momento.",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener los equipos:", error);
      }
    };

    obtenerEquipos();
  }, []);

  const handleAddTeam = async () => {
    const { value: teamName } = await Swal.fire({
      title: "Añadir equipo nuevo",
      input: "text",
      inputLabel: "Nombre del equipo",
      inputPlaceholder: "Ingrese el nombre del equipo",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Registrar",
      inputValidator: (value) => {
        if (!value) {
          return "¡Debe ingresar un nombre para el equipo!";
        }
      },
    });

    if (teamName) {
      // Realizar el fetch al backend para añadir el equipo
      try {
        const response = await fetch(`${Config.server_api}api/add-team`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: teamName }),
        });

        if (response.ok) {
          Swal.fire({
            title: "¡Equipo añadido!",
            text: "El equipo ha sido añadido correctamente.",
            icon: "success",
            didClose: () => {
              window.location.reload();
            },
          });
        } else {
          Swal.fire("Error", "Hubo un error al añadir el equipo.", "error");
        }
      } catch (error) {
        console.error("Error al añadir el equipo:", error);
        Swal.fire("Error", "Hubo un error al añadir el equipo.", "error");
      }
    }
  };

  const handleOptionClick = async (option, teamId, teamStatus) => {
    switch (option) {
      case "verDetalles":
        await fetchTeamDetails(teamId);
        break;
      case "editar":
        handleEditTeamName(teamId);
        break;
      case "inhabilitar":
        if (teamStatus === "active") {
          await markAsInactive(teamId);
        } else if (teamStatus === "inactive") {
          await markAsActive(teamId);
        }
        break;
      default:
        break;
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTeams = Teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    console.log(selectedTeamInfo);
  }, [selectedTeamInfo]);

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/teams/details/${teamId}`
      );
      if (response.ok) {
        const data = await response.json();
        data.usernames = data.usernames.map((username) => ({ user: username }));
        setSelectedTeamInfo(data);
        console.log(selectedTeamInfo);
      } else {
        console.error("Error al obtener la información del equipo");
      }
    } catch (error) {
      console.error("Error al obtener la información del equipo:", error);
    }
  };

  const markAsInactive = async (teamId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/teams/${teamId}/disable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("Equipo inhabilitado exitosamente");
        Swal.fire({
          title: "Equipo inhabilitado exitosamente",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al inhabilitar el equipo");
      }
    } catch (error) {
      console.error("Error al inhabilitar el equipo:", error);
    }
  };

  const markAsActive = async (teamId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/teams/${teamId}/enable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("Equipo habilitado exitosamente");
        Swal.fire({
          title: "Equipo habilitado exitosamente",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al habilitar el equipo");
      }
    } catch (error) {
      console.error("Error al habilitar el equipo:", error);
    }
  };

  const handleEditTeamName = async (teamId) => {
    const team = Teams.find((team) => team.id === teamId);
    const { value: newName } = await Swal.fire({
      title: "Editar nombre del equipo",
      input: "text",
      inputValue: team.name,
      inputLabel: "Nuevo nombre del equipo",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Guardar",
      inputValidator: (value) => {
        if (!value) {
          return "¡Debe ingresar un nombre para el equipo!";
        }
      },
    });

    if (newName) {
      try {
        const response = await fetch(
          `${Config.server_api}api/teams/${teamId}/edit-name`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newName }),
          }
        );
        if (response.ok) {
          Swal.fire({
            title: "¡Nombre de equipo editado!",
            text: "El nombre del equipo ha sido editado correctamente.",
            icon: "success",
            didClose: () => {
              window.location.reload();
            },
          });
        } else {
          Swal.fire(
            "Error",
            "Hubo un error al editar el nombre del equipo.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error al editar el nombre del equipo:", error);
        Swal.fire(
          "Error",
          "Hubo un error al editar el nombre del equipo.",
          "error"
        );
      }
    }
  };

  return (
    <>
      <div className="equipos">
        <div className="left">
          <div className="title">
            <Buttons_sidebar/>
            <h2>Equipos</h2>
          </div>

          <Buttons />

          <div className="filters">
            <div className="input">
              <input
                type="text"
                placeholder="Buscar equipo"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="button">
              <button onClick={handleAddTeam}>Añadir equipo</button>
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
                  <th scope="col">Chats</th>
                  <th scope="col">Estatus</th>
                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                {filteredTeams.map((team, index) => (
                  <tr key={index}>
                    <td data-label="Nombre" className="name">
                      <div className="circle">{team.name.charAt(0)}</div>
                      <div className="content">
                        <p>{team.name}</p>{" "}
                        <span>{team.user_count} miembros</span>{" "}
                      </div>
                    </td>
                    <td data-label="Chats">{team.user_count}</td>
                    <td
                      data-label="Estatus"
                      className={`status ${team.status}`}
                    >
                      {team.status}
                    </td>
                    <td data-label="">
                      <DropdownMenu
                        options={[
                          { label: "Ver detalles", value: "verDetalles" },
                          { label: "Editar", value: "editar" },
                          {
                            label:
                              team.status === "active"
                                ? "Inhabilitar"
                                : "Habilitar",
                            value: "inhabilitar",
                          },
                        ]}
                        onOptionClick={(option) =>
                          handleOptionClick(option, team.id, team.status)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTeamInfo != null ? (
          <div className="right">
            <div className="inner_right">
              <div className="card">
                <div className="inner_card team">
                  <div className="circle">
                    {selectedTeamInfo.name.charAt(0)}
                  </div>
                  <div className="content">
                    <p>{selectedTeamInfo.name}</p>
                    <p>ID: {selectedTeamInfo.id}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="inner_card members">
                  <div className="title">
                    <h4>Miembros</h4>
                  </div>

                  <div className="list">
                    {selectedTeamInfo.usernames.map((user, index) => (
                      <div className="item" key={index}>
                        <div className="circle">{user.user.charAt(0)}</div>
                        <div className="content">
                          <p>{user.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="footer">
                    {/* <a href="#">Ver todos</a> */}
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
                        <p>{selectedTeamInfo.chat_count}</p>
                      </div>
                    </div>
                    <div className="item">
                      <div className="icon">
                        <SmsIcon />
                        <span>Chats abiertos</span>
                      </div>
                      <div className="content">
                        <p>{selectedTeamInfo.active_chat_count}</p>
                      </div>
                    </div>
                    <div className="item">
                      <div className="icon">
                        <SmsIcon />
                        <span>Chats cerrados</span>
                      </div>
                      <div className="content">
                        <p>{selectedTeamInfo.inactive_chat_count}</p>
                      </div>
                    </div>
                    <div className="item">
                      <div className="icon">
                        <Groups2Icon />
                        <span>Miembros</span>
                      </div>
                      <div className="content">
                        <p>{selectedTeamInfo.usernames.length}</p>
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
                <div className="inner_card team">
                  <div className="content">
                    <p>
                      Seleccione "ver detalles" para ver los detalles de un
                      equipo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default Teams;
