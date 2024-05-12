import "./Teams.css";
import Buttons from "./Buttons";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SmsIcon from "@mui/icons-material/Sms";
import Groups2Icon from "@mui/icons-material/Groups2";

import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import Config from "../../../Config/Config";

const Teams = () => {
  const [Teams, setTeams] = useState([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const obtenerEquipos = async () => {
      try {
        const url = new URL(`${Config.backend_php_admin}get_teams.php`);

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
        const response = await fetch(
          `${Config.backend_php_admin}add_team.php`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: teamName }),
          }
        );

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

  return (
    <>
      <div className="equipos">
        <div className="left">
          <div className="title">
            <h2>Equipos</h2>
          </div>

          <Buttons />

          <div className="filters">
            <div className="input">
              <input type="text" placeholder="Buscar equipo" />
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
                  <th scope="col">Mensajes</th>
                  <th scope="col">Estatus</th>
                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                {Teams.map((team, index) => (
                  <tr key={index}>
                    <td data-label="Nombre" className="name">
                      <div className="circle">{team.team_name.charAt(0)}</div>
                      <div className="content">
                        <p>{team.team_name}</p> <span>20 miembros</span>{" "}
                      </div>
                    </td>
                    <td data-label="Mensajes">12312</td>
                    <td data-label="Estatus" className="status">
                      <span>5 </span>/ 20 disponibles
                    </td>
                    <td data-label="">
                      <button>
                        <MoreHorizIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right">
          <div className="inner_right">
            <div className="card">
              <div className="inner_card team">
                <div className="circle">G</div>
                <div className="content">
                  <p>General</p>
                  <p>ID: 1</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="inner_card members">
                <div className="title">
                  <h4>Miembros</h4>
                </div>

                <div className="list">
                  <div className="item">
                    <div className="circle">N</div>
                    <div className="content">
                      <p>Nombre Apellido</p>
                    </div>
                  </div>
                  <div className="item">
                    <div className="circle">N</div>
                    <div className="content">
                      <p>Nombre Apellido</p>
                    </div>
                  </div>
                </div>
                <div className="footer">
                  <a href="#">Ver todos</a>
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
                      <p>4</p>
                    </div>
                  </div>
                  <div className="item">
                    <div className="icon">
                      <SmsIcon />
                      <span>Chats abiertos</span>
                    </div>
                    <div className="content">
                      <p>4</p>
                    </div>
                  </div>
                  <div className="item">
                    <div className="icon">
                      <SmsIcon />
                      <span>Chats cerrados</span>
                    </div>
                    <div className="content">
                      <p>4</p>
                    </div>
                  </div>
                  <div className="item">
                    <div className="icon">
                      <Groups2Icon />
                      <span>Miembros</span>
                    </div>
                    <div className="content">
                      <p>4</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Teams;
