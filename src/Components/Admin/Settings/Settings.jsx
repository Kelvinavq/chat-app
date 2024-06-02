import { useState, useRef, useEffect } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import "./Settings.css";
import Buttons from "./Buttons";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import Button_sidebar from "../Sidebar/Button_sidebar";

import Config from "../../../Config/Config";

const Settings = () => {
  const [autoMessages, setAutoMessages] = useState([]);
  const [counter, setCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddMessageModal, setshowAddMessageModal] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    team: null,
    message: "",
  });

  useEffect(() => {
    const obtenerMensajes = async () => {
      try {
        const response = await fetch(
          `${Config.server_api}api/settings/get-all-messages`,
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
            setAutoMessages(data.auto_messages);
            setCounter(data.auto_messages.length);
          } else {
            Swal.fire({
              icon: "info",
              title: "Sin mensajes automáticos registrados",
              text: "No hay mensajes automáticos registrados en este momento.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al obtener los mensajes automáticos. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        console.error("Error al obtener los mensajes automáticos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al obtener los mensajes automáticos. Inténtalo de nuevo más tarde.",
        });
      }
    };

    obtenerMensajes();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredMessages = autoMessages.filter((message) =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  }, [modalRef]);

  const handleAddMessage = () => {
    setshowAddMessageModal(true);
  };

  const handleCloseModal = () => {
    setshowAddMessageModal(false);
    setShowEditMessageModal(false);
  };

  const handleTypeChange = async (event) => {
    const selectedType = event.target.value;
    setMessageType(selectedType);
    setFormData({
      ...formData,
      type: selectedType,
      team: selectedType === "team" ? formData.team : null,
    });

    if (selectedType === "team") {
      getTeamList();
    }
  };

  const getTeamList = async () => {
    try {
      const url = new URL(`${Config.server_api}api/chats/list-team`);

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
          setTeams(data.teams);
        }
      }
    } catch (error) {
      console.error("Error al obtener los equipos:", error);
    }
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleMessageFormSubmit = async (event) => {
    event.preventDefault();
    const { name, type, team, message } = formData;

    if (!name || !type || (type === "team" && !team) || !message) {
      Swal.fire({
        title: "Error",
        text: "Por favor, completa todos los campos.",
        icon: "warning",
      });
      return;
    }

    try {
      const response = await fetch(
        "${Config.server_api}api/settings/add-message",
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Éxito",
          text: "Mensaje guardado con éxito.",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
        setshowAddMessageModal(false);
      } else {
        Swal.fire({
          title: "Error",
          text: "Error al guardar el mensaje.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      Swal.fire({
        title: "Error",
        text: "Error al enviar el mensaje.",
        icon: "error",
      });
    }
  };

  const handleOptionClick = async (option, messageId, teamStatus, message) => {
    switch (option) {
      case "eliminar":
        await deleteMessage(messageId);
        break;
      case "editar":
        handleEditMessage(message);
        break;
      case "inhabilitar":
        if (teamStatus === "active") {
          await markAsInactive(messageId);
        } else if (teamStatus === "inactive") {
          await markAsActive(messageId);
        }
        break;
      default:
        break;
    }
  };

  const markAsInactive = async (messageId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/settings/${messageId}/disable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("mensaje inhabilitado exitosamente");
        Swal.fire({
          title: "Mensaje inhabilitado exitosamente",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al inhabilitar el mensaje");
      }
    } catch (error) {
      console.error("Error al inhabilitar el mensaje:", error);
    }
  };

  const markAsActive = async (messageId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/settings/${messageId}/enable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("mensaje habilitado exitosamente");
        Swal.fire({
          title: "Mensaje habilitado exitosamente",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al habilitar el mensaje");
      }
    } catch (error) {
      console.error("Error al habilitar el mensaje:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    const confirmed = await Swal.fire({
      title: "Confirmar eliminación",
      text: "¿Estás seguro de que quieres eliminar este mensaje?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await fetch(
          `${Config.server_api}api/settings/${messageId}/delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          Swal.fire({
            title: "Éxito",
            text: "Mensaje eliminado con éxito.",
            icon: "success",
            didClose: () => {
              window.location.reload();
            },
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "Error al eliminar el mensaje.",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error al eliminar el mensaje:", error);
        Swal.fire({
          title: "Error",
          text: "Error al eliminar el mensaje.",
          icon: "error",
        });
      }
    }
  };

  const handleEditMessage = (message) => {
    Swal.fire({
      title: "Editar mensaje automático",
      html: `
        <form id="edit-message-form" >
          <div class="input">
            <label for="edit-name">Nombre</label>
            <input type="text" id="edit-name" value="${message.name}">
          </div>
          <br/>
          <div class="input">
            <label for="edit-message">Mensaje</label>
            <textarea id="edit-message">${message.message}</textarea>
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const editNameInput = Swal.getPopup().querySelector("#edit-name").value;
        const editMessageInput =
          Swal.getPopup().querySelector("#edit-message").value;

        if (!editNameInput || !editMessageInput) {
          Swal.showValidationMessage("Por favor, completa todos los campos.");
          return false;
        }

        return {
          id: message.id,
          name: editNameInput,
          message: editMessageInput,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { id, name, message } = result.value;
        updateMessage(id, name, message);
      }
    });
  };

  const updateMessage = async (id, name, message) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/settings/${id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, name, message }),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Éxito",
          text: "Mensaje actualizado con éxito.",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Error al actualizar el mensaje.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error al actualizar el mensaje:", error);
      Swal.fire({
        title: "Error",
        text: "Error al actualizar el mensaje.",
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="ajustes">
        <div className="title">
          <Button_sidebar/>
          <h2>Ajustes</h2>
        </div>

        <Buttons />

        <div className="filters">
          <div className="input">
            <input
              type="text"
              placeholder="Buscar mensaje por nombre"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="button">
            <button onClick={handleAddMessage}>Agregar nuevo</button>
          </div>
        </div>

        <div className="counter">
          <h4>Total ({counter})</h4>
        </div>

        <div className="tabla">
          {filteredMessages.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Mensaje</th>
                  <th scope="col">Estatus</th>
                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                {filteredMessages.map((message, index) => (
                  <tr key={index}>
                    <td data-label="Nombre">{message.name}</td>
                    <td data-label="Tipo">
                      {message.type == "welcome"
                        ? "Bienvenida"
                        : message.type == "team"
                        ? "equipo"
                        : "Despedida"}
                    </td>
                    <td data-label="Mensaje">{message.message}</td>
                    <td data-label="Estatus" className={`${message.status}`}>
                      {message.status}
                    </td>
                    <td data-label="">
                      <DropdownMenu
                        options={[
                          { label: "Editar", value: "editar" },
                          {
                            label:
                              message.status === "active"
                                ? "Inhabilitar"
                                : "Habilitar",
                            value: "inhabilitar",
                          },
                          { label: "Eliminar", value: "eliminar" },
                        ]}
                        onOptionClick={(option) =>
                          handleOptionClick(
                            option,
                            message.id,
                            message.status,
                            message
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No se encontraron mensajes automáticos.</p>
          )}
        </div>
      </div>

      {showAddMessageModal && (
        <div className="modal-overlay">
          <div className="modal" ref={modalRef}>
            <button className="close-modal" onClick={handleCloseModal}>
              <CloseIcon />
            </button>
            <div className="title">
              <h4>Agregar nuevo mensaje automático</h4>
            </div>
            <form onSubmit={handleMessageFormSubmit} className="content-modal">
              <div className="left">
                <div className="input">
                  <label htmlFor="name">Ingresa un nombre</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Ej. Bienvenida"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input">
                  <label htmlFor="type">Selecciona el tipo de mensaje</label>

                  <select
                    id="type"
                    value={formData.type}
                    onChange={handleTypeChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="welcome">Bienvenida</option>
                    <option value="team">Por equipo</option>
                    <option value="closed">De despedida</option>
                  </select>
                </div>

                <div className="input">
                  {messageType === "welcome" && (
                    <p>
                      Los mensajes que guardes de tipo BIENVENIDA seran enviados
                      automaticamente cuando el cliente inicia un chat
                    </p>
                  )}
                  {messageType === "closed" && (
                    <p>
                      Los mensajes que guardes de tipo DESPEDIDA es el ultimo
                      mensaje que recibira el cliente cuando un administrador
                      cierre el chat
                    </p>
                  )}
                  {messageType === "team" && (
                    <p>
                      Los mensajes que guardes de tipo EQUIPO son los mensajes
                      que recibira el cliente cuando seleccionen un tipo de
                      conversacion al iniciar el chat, por ej. Si el cliente
                      elige el equipo de "RECARGAR FICHAS", se le enviara el
                      mensaje que registres a continuación
                    </p>
                  )}
                </div>
              </div>

              <div className="right">
                {messageType === "team" && (
                  <div className="input">
                    <label htmlFor="team">Selecciona el equipo</label>
                    <select
                      id="team"
                      value={formData.team}
                      onChange={handleInputChange}
                    >
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="input">
                  <label htmlFor="message">Escribe el mensaje</label>
                  <textarea
                    id="message"
                    placeholder="Mensaje automático"
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="input">
                  <button type="submit">Guardar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
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

export default Settings;
