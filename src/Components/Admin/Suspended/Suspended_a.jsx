import React, { useState, useEffect, useRef } from "react";
import "./Suspended.css";
import Buttons from "../Teams/Buttons";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import img from "../../../assets/logo.png";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SmsIcon from "@mui/icons-material/Sms";
import Groups2Icon from "@mui/icons-material/Groups2";
import Config from "../../../Config/Config";
import Button_sidebar from "../Sidebar/Button_sidebar";

const Suspended_a = () => {
  const [Agents, setAgents] = useState([]);
  const [counter, setCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentInfo, setSelectedAgentInfo] = useState(null);

  useEffect(() => {
    const obtenerAgentes = async () => {
      try {
        const response = await fetch(
          `${Config.server_api}api/agents/get-all-users-suspended`,
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
              title: "Sin agentes suspendidos",
              text: "No hay agentes suspendidos en este momento.",
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

    obtenerAgentes();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAgents = Agents.filter((agent) =>
    agent.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reactive = async (agentId) => {
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

  return (
    <>
      <div className="suspends">
        <div className="left">
          <div className="title">
            <Button_sidebar/>
            <h2>Agentes suspendidos</h2>
          </div>

          <Buttons />

          <div className="filters">
            <div className="input">
              <input
                type="text"
                placeholder="Buscar agentes"
                value={searchTerm}
                onChange={handleSearch}
              />
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
                  <th scope="col"></th>
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
                    <td data-label="" className="reactivar">
                      <button onClick={(agentId) => reactive(agente.id)}>
                        Reactivar
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(agentId) => fetchAgentDetails(agente.id)}
                      >
                        <VisibilityOutlinedIcon />
                      </button>
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
      </div>
    </>
  );
};

export default Suspended_a;
