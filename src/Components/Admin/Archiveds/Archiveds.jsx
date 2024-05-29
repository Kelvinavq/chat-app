import React, { useState, useEffect, useRef } from "react";
import "./Archived.css";

import Config from "../../../Config/Config";
import Button_sidebar from "../Sidebar/Button_sidebar";

export const Archiveds = () => {
  const [archiveds, setArchiveds] = useState([]);
  const [counter, setCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(
          `${Config.server_api}api/chats/chats-archiveds`,
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

          if (data && data.chats) {
            setArchiveds(data.chats);
            setCounter(data.chats.length);
          } else {
            Swal.fire({
              icon: "info",
              title: "Sin chats archivados",
              text: "No hay chats archivados en este momento.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al obtener los chats. Inténtalo de nuevo más tarde.",
          });
        }
      } catch (error) {
        console.error("Error al obtener los chats:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al obtener los chats. Inténtalo de nuevo más tarde.",
        });
      }
    };

    fetchChats();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredChats = archiveds.filter((archived) =>
    archived.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markAsVisible = async (chatId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/chats/mark-chat-visible/${chatId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId }),
        }
      );
      if (response.ok) {
        console.log("chat marcado como visible exitosamente");
        Swal.fire({
          title: "chat marcado como visible exitosamente",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al habilitar el chat");
      }
    } catch (error) {
      console.error("Error al habilitar el chat:", error);
    }
  };

  return (
    <>
      <div className="archiveds">
        <div className="title">
          <Button_sidebar />
          <h2>Chats archivados</h2>
        </div>

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
                <th scope="col">Chat ID</th>
                <th scope="col">Cliente</th>
                <th scope="col">Equipo</th>
                <th scope="col"></th>
              </tr>
            </thead>

            <tbody>
              {filteredChats.map((archived, index) => (
                <tr key={index}>
                  <td data-label="Chat ID">{archived.id}</td>

                  <td data-label="Cliente">{archived.username}</td>
                  <td data-label="Equipo">{archived.team_name}</td>
                  <td data-label="" className="visible">
                    <button onClick={(chatId) => markAsVisible(archived.id)}>
                      Visible
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
