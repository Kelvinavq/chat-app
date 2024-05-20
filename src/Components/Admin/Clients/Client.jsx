import "./clients.css";
import { useState, useRef, useEffect } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Swal from "sweetalert2";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [counter, setCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/clients/get-all-clients`,
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
            setClients(data.clients);
            setCounter(data.clients.length);
          } else {
            Swal.fire({
              icon: "info",
              title: "Sin clientes registrados",
              text: "No hay clientes registrados en este momento.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al obtener clientes. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al obtener los clientes. Inténtalo de nuevo más tarde.",
        });
      }
    };

    obtenerClientes();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionClick = async (option, cliente) => {
    switch (option) {
      case "editar":
        handleEditClient(cliente);
        break;

      case "password":
        handleEditPassword(cliente);
        break;

      default:
        break;
    }
  };

  const handleEditClient = (cliente) => {
    Swal.fire({
      title: "Editar cliente",
      html: `
        <form id="edit-message-form" >
          <div class="input">
            <label for="edit-username">Nombre de usuario</label>
            <input type="text" id="edit-username" value="${cliente.username}">
          </div>
          <br/>
          <div class="input">
            <label for="edit-email">Email</label>
            <input type="email" id="edit-email" value="${cliente.email}">
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const editUsernameInput =
          Swal.getPopup().querySelector("#edit-username").value;
        const editEmailInput =
          Swal.getPopup().querySelector("#edit-email").value;

        if (!editUsernameInput || !editEmailInput) {
          Swal.showValidationMessage("Por favor, completa todos los campos.");
          return false;
        }

        return {
          id: cliente.id,
          username: editUsernameInput,
          email: editEmailInput,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { id, username, email } = result.value;
        updateClient(id, username, email);
      }
    });
  };

  const updateClient = async (id, username, email) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/clients/${id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, username, email }),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Éxito",
          text: "Cliente actualizado con éxito.",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Error al actualizar el cliente.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      Swal.fire({
        title: "Error",
        text: "Error al actualizar el cliente.",
        icon: "error",
      });
    }
  };

  const handleEditPassword = (cliente) => {
    Swal.fire({
      title: "Crear nueva contraseña para el cliente",
      html: `
        <form id="edit-message-form" >
          <div class="input">
            <label for="edit-password">Ingrese la nueva contraseña</label>
            <input type="password" id="edit-password" placeholder="Ej. 1234" >
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const editPasswordInput =
          Swal.getPopup().querySelector("#edit-password").value;

        if (editPasswordInput.length < 4) {
          Swal.showValidationMessage(
            "La contraseña debe tener al menos 4 carácteres | números"
          );
          return false;
        }

        return {
          id: cliente.id,
          password: editPasswordInput,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { id, password } = result.value;
        updateClientPassword(id, password);
      }
    });
  };

  const updateClientPassword = async (id, password) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/clients/${id}/update-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, password }),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Éxito",
          text: "Contraseña actualizada con éxito.",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Error al actualizar la contraseña del cliente.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error al actualizar la contraseña del cliente:", error);
      Swal.fire({
        title: "Error",
        text: "Error al actualizar la contraseña del cliente.",
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="clientes">
        <div className="title">
          <h2>Clientes</h2>
        </div>

        <div className="filters">
          <div className="input">
            <input
              type="text"
              placeholder="Buscar cliente"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="counter">
          <h4>Total ({counter})</h4>
        </div>

        <div className="tabla">
          {filteredClients.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Usuario</th>
                  <th scope="col">Email</th>
                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client, index) => (
                  <tr key={index}>
                    <td data-label="ID">{client.id}</td>
                    <td data-label="Usuario">{client.username}</td>
                    <td data-label="Email">{client.email}</td>
                    <td data-label="">
                      <DropdownMenu
                        options={[
                          { label: "Editar", value: "editar" },
                          { label: "Actualizar contraseña", value: "password" },
                        ]}
                        onOptionClick={(option) =>
                          handleOptionClick(option, client)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No se encontraron clientes.</p>
          )}
        </div>
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

export default Client;
