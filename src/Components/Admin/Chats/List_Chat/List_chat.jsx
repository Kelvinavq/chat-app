import { useState, useEffect, useRef } from "react";
import "./List_Chat.css";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import img from "../../../../assets/logo.png";
import io from "socket.io-client";
const socket = io("http://localhost:4000");

import Config from "../../../../Config/Config";

const List_chat = ({ onChatClick }) => {
  const [chats, setChats] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});

  useEffect(() => {
    socket.on("updateUserStatus", (data) => {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [data.clientId]: data.isOnline,
      }));
    });

    socket.on("chatArchived", (data) => {
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== data.chatId)
      );
    });

    return () => {
      socket.off("updateUserStatus");
      socket.off("chatArchived");
    };
  }, []);

  useEffect(() => {
    // Realizar la solicitud GET al backend para obtener la lista de chats
    fetch(`http://localhost:4000/api/chats/list`)
      .then((response) => response.json())
      .then((data) => {
        setChats(data.chats);
      })
      .catch((error) => {
        console.error("Error fetching chat list:", error);
      });

    socket.on("newChatNotification", (chatData) => {
      chatData.lastMessageTime = chatData.timestamp;
      setChats((prevChats) => {
        const updatedChats = [chatData, ...prevChats];
        return sortChatsByTime(updatedChats);
      });
    });

    socket.on("updateUserStatus", ({ clientId, isOnline }) => {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [clientId]: isOnline,
      }));
    });

    // Limpiar el listener al desmontar el componente
    return () => {
      socket.off("newChatNotification");
      socket.off("updateUserStatus");
    };
  }, []);

  const handleChatClick = (chatId) => {
    // Lógica para manejar el clic en un chat específico
    onChatClick(chatId);
  };

  // Función para ordenar los chats por marca de tiempo
  const sortChatsByTime = (chats) => {
    return chats.slice().sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  };

  const handleOptionClick = async (option, chatId) => {
    switch (option) {
      case "cerrar":
        handleCloseChat(chatId);
        break;

      case "borrar":
        handleDeleteChat(chatId);
        break;
      case "archivar":
        markAsArchived(chatId);
        break;
      default:
        break;
    }
  };

  const markAsArchived = async (chatId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/chats/archive-chat/${chatId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId }),
        }
      );
      if (response.ok) {
        console.log("chat archivado exitosamente");
        onChatClick(null);
      } else {
        console.error("Error al archivar chat");
      }
    } catch (error) {
      console.error("Error al habilitar el equipo:", error);
    }
  };

  const handleCloseChat = (chatId) => {
    const chat_id = chatId;

    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Estás seguro de que deseas cerrar este chat?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:4000/api/chats/close/${chat_id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Éxito",
              text: "Chat cerrado con éxito.",
              icon: "success",
              didClose: () => {
                window.location.reload();
              },
            });
          } else {
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al cerrar el chat.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error al cerrar el chat:", error);
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al cerrar el chat.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleDeleteChat = (chatId) => {
    const chat_id = chatId;
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Estás seguro de que deseas borrar este chat?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:4000/api/chats/delete/${chat_id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ chat_id }),
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Éxito",
              text: "Chat borrado con éxito.",
              icon: "success",
              didClose: () => {
                window.location.reload();
              },
            });
          } else {
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al borrar el chat.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error al borrar el chat:", error);
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al borrar el chat.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <>
      <div className="list_chats">
        <div className="title">
          <h2>Chats</h2>
          <button>
            <TuneOutlinedIcon />
          </button>
        </div>

        <div className="items">
          {sortChatsByTime(chats).map((chat) => (
            <div
              key={chat.id}
              className="item"
              onClick={() => onChatClick(chat)}
            >
              <div className="content_text">
                <div className="img">
                  <img src={img} alt="" />
                </div>
                <div className="content">
                  <h4>{chat.username}</h4>
                  <p>{chat.team_name}</p>
                </div>
              </div>

              <DropdownMenu
                options={[
                  { label: "Cerrar chat", value: "cerrar" },
                  { label: "Borrar chat", value: "borrar" },
                  { label: "Archivar", value: "archivar" },
                ]}
                onOptionClick={(option) => handleOptionClick(option, chat.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
const DropdownMenu = ({ options, onOptionClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleOptionClick = (option, event) => {
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

export default List_chat;
