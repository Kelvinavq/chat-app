import "./Agents.css";
import Buttons from "../Teams/Buttons";
import Add_user_modal from "./Add_user_modal";

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
  const [Teams, setTeams] = useState([]);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);

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
        const response = await fetch(`http://localhost:4000/api/teams`, {
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

    obtenerEquipos();
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
      const response = await fetch(`http://localhost:4000/api/agents/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAgentData),
      });

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
              <input type="text" placeholder="Buscar agente" />
            </div>

            <div className="button">
              <button onClick={handleAddAgentClick}>Añadir agente</button>
            </div>
          </div>

          <div className="counter">
            <h4>Activos (4)</h4>
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
                <tr>
                  <td data-label="Nombre" className="name">
                    <div className="circle">
                      <img src={img} alt="" />
                    </div>
                    <div className="content">
                      <p>Siempre paga</p> <span>siemprepaga463@gmail.com</span>{" "}
                    </div>
                  </td>
                  <td data-label="Role" className="admin">
                    <span>Admin</span>
                  </td>
                  <td data-label="Estatus" className="status online">
                    Online
                  </td>
                  <td data-label="">
                    <button>
                      <MoreHorizIcon />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td data-label="Nombre" className="name">
                    <div className="circle">
                      <img src={img} alt="" />
                    </div>
                    <div className="content">
                      <p>Siempre paga</p> <span>siemprepaga463@gmail.com</span>{" "}
                    </div>
                  </td>
                  <td data-label="Role" className="agent">
                    <span>Agent</span>
                  </td>
                  <td data-label="Estatus" className="status offline">
                    Desconectado
                  </td>
                  <td data-label="">
                    <button>
                      <MoreHorizIcon />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="right">
          <div className="inner_right">
            <div className="card">
              <div className="inner_card agent">
                <div className="circle">
                  <img src={img} alt="" />
                </div>
                <div className="content">
                  <p>
                    Siemprepaga463 <span className="admin">Admin</span>
                  </p>
                  <p>siemprepaga463@gmail.com</p>
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
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                  </div>

                  <div className="right">
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
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
                      <span>Equipos pertenecientes</span>
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
        {/* Modal para agregar agente */}
        {showAddAgentModal && (
          <Add_user_modal
            teams={Teams}
            onClose={() => setShowAddAgentModal(false)}
            onSubmit={handleAgentFormSubmit}
          />
        )}
      </div>
    </>
  );
};

export default Agents_a;
