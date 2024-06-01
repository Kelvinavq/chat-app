import { useState, useEffect, useRef } from "react";
import "./List_Chat.css";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import img from "../../../../assets/logo.png";
import Button_sidebar from "../../Sidebar/Button_sidebar";

import io from "socket.io-client";
const socket = io("http://localhost:4000");

import Config from "../../../../Config/Config";

const List_chat = ({ onChatClick }) => {
  const [chats, setChats] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [adminTeamIds, setAdminTeamIds] = useState([]);
  const [lastClientChatId, setLastClientChatId] = useState(null);
  const [clientStatuses, setClientStatuses] = useState({});
  const [filterUnread, setFilterUnread] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    const fetchAdminTeams = async () => {
      try {
        const response = await fetch(
          `${Config.server_api}api/admin/teams/${adminId}`
        );
        if (response.ok) {
          const data = await response.json();
          const teamIds = data.teams.map((team) => team.id);
          setAdminTeamIds(teamIds);
        } else {
          console.error("Failed to fetch admin teams");
        }
      } catch (error) {
        console.error("Error fetching admin teams:", error);
      }
    };

    fetchAdminTeams();
  }, [adminId]);

  useEffect(() => {
    if (adminTeamIds.length > 0) {
      fetch(`${Config.server_api}api/chats/list/${adminId}`)
        .then((response) => response.json())
        .then((data) => {
          const filteredChats = data.chats.filter((chat) =>
            adminTeamIds.includes(chat.team_id)
          );

          setChats(filteredChats);
        })
        .catch((error) => {
          console.error("Error fetching chat list:", error);
        });

      socket.on("newChatNotification", (chatData) => {
        if (adminTeamIds.includes(chatData.team_id)) {
          chatData.lastMessageTime = chatData.timestamp;
          setChats((prevChats) => {
            const updatedChats = [chatData, ...prevChats];
            return sortChatsByTime(updatedChats);
          });
        }
      });

      const handleUserStatusUpdate = ({ clientId, isOnline }) => {
        setClientStatuses((prevStatuses) => ({
          ...prevStatuses,
          [clientId]: isOnline,
        }));
      };

      socket.on("chatOpened", (chatId) => {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id == chatId) {
              console.log("Chat updated:", chat); // Imprime el chat actualizado
              return { ...chat, unread_messages_count: 0 };
            } else {
              return chat;
            }
          })
        );
      });

      socket.on("updateUserStatus", handleUserStatusUpdate);

      socket.on("newMessage", (messageData) => {
        console.log("mensaje nuevo" + messageData);
        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex(
            (chat) => chat.id == messageData.chatId
          );

          if (chatIndex !== -1) {
            const updatedChat = {
              ...prevChats[chatIndex],
              lastMessageTime: new Date(messageData.created_at).getTime(),
            };
            const updatedChats = [
              updatedChat,
              ...prevChats.slice(0, chatIndex),
              ...prevChats.slice(chatIndex + 1),
            ];
            return sortChatsByTime(updatedChats);
          }

          return prevChats;
        });
      });

      return () => {
        socket.off("newChatNotification");
        socket.off("updateUserStatus", handleUserStatusUpdate);
        socket.off("newMessage");
        socket.off("chatOpened");
      };
    }
  }, [adminId, adminTeamIds]);

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

  const handleChatClick = async (chatId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/chats/open-chat/${chatId.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        // Actualizar el contador de mensajes no leídos en el estado del chat
        setChats((prevChats) =>
          prevChats.map((c) =>
            c.id === chatId.id ? { ...c, unread_messages_count: 0 } : c
          )
        );
        // Lógica para manejar el clic en un chat específico
        onChatClick(chatId);
      } else {
        console.error("Error al abrir el chat");
      }
    } catch (error) {
      console.error("Error al abrir el chat:", error);
    }
  };

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
        `${Config.server_api}api/chats/archive-chat/${chatId}`,
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
            `${Config.server_api}api/chats/close/${chat_id}`,
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
            `${Config.server_api}api/chats/delete/${chat_id}`,
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

  const showFiltered = () => {
    setShowFilter(true);
  };

  const handleFilterClick = () => {
    setFilterUnread(!filterUnread);
  };

  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setShowFilter(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredChats = filterUnread
    ? chats.filter((chat) => chat.unread_messages_count > 0)
    : chats;

  return (
    <>
      <div className="list_chats">
        <div className="title" ref={filterRef}>
          <Button_sidebar />
          <h2>Chats</h2>
          {showFilter && (
            <button onClick={handleFilterClick} className="options">
              {filterUnread ? "Todos" : "No leídos"}
            </button>
          )}

          <button onClick={showFiltered}>
            <TuneOutlinedIcon />
          </button>
        </div>

        <div className="items">
          {sortChatsByTime(filteredChats).map((chat) => (
            <div
              key={chat.id}
              className="item"
              onClick={() => handleChatClick(chat)}
            >
              <div className="content_text">
                <div className="img">
                  <span
                    className={
                      clientStatuses[chat.client_id] ? "online" : "offline"
                    }
                  ></span>
                  <img src={img} alt="" />
                </div>
                <div className="content">
                  <h4>{chat.username}</h4>
                  <p>{chat.team_name}</p>
                  {chat.unread_messages_count > 0 && (
                    <span className="unread-count">
                      {chat.unread_messages_count}
                    </span>
                  )}
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
