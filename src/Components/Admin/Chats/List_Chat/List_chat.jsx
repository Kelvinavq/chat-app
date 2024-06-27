import { useState, useEffect, useRef } from "react";
import "./List_Chat.css";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import img from "../../../../assets/logo.png";
import Button_sidebar from "../../Sidebar/Button_sidebar";

import io from "socket.io-client";
const socket = io(Config.server_api);

import Config from "../../../../Config/Config";

const List_chat = ({ onChatClick }) => {
  const [chats, setChats] = useState([]);
  const [adminTeamIds, setAdminTeamIds] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState({});

  const adminId = localStorage.getItem("adminId");
  const role = localStorage.getItem("role");

  // Cargar el estado inicial de unreadMessagesCount desde localStorage
  useEffect(() => {
    const storedUnreadMessagesCount = localStorage.getItem(
      "unreadMessagesCount"
    );
    if (storedUnreadMessagesCount) {
      setUnreadMessagesCount(JSON.parse(storedUnreadMessagesCount));
    }
  }, []);

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
      fetch(`${Config.server_api}api/chats/list/${adminId}?role=${role}`)
        .then((response) => response.json())
        .then((data) => {
          const filteredChats = data.chats.filter((chat) =>
            adminTeamIds.includes(chat.team_id)
          );
          setChats(sortChatsByTime(filteredChats));
          const initialUnreadCount = {};
          filteredChats.forEach((chat) => {
            initialUnreadCount[chat.id] = chat.unread_messages_count;
          });
          setUnreadMessagesCount(initialUnreadCount);
          localStorage.setItem(
            "unreadMessagesCount",
            JSON.stringify(initialUnreadCount)
          );
        })
        .catch((error) => {
          console.error("Error fetching chat list:", error);
        });

      socket.on("chatOpened", (chatId) => {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id == chatId) {
              return { ...chat, unread_messages_count: 0 };
            } else {
              return chat;
            }
          })
        );
      });

      socket.on("newMessage", (messageData) => {
        console.log(messageData);

        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex(
            (chat) => chat.id === messageData.chatId
          );
          if (chatIndex !== -1) {
            const updatedChat = {
              ...prevChats[chatIndex],
              lastMessageTime: new Date(messageData.created_at).getTime(),
              lastMessage: messageData.message,
            };
            const updatedChats = [
              ...prevChats.slice(0, chatIndex),
              updatedChat,
              ...prevChats.slice(chatIndex + 1),
            ];
            return sortChatsByTime(updatedChats);
          } else {
            const newChat = {
              id: messageData.chatId,
              lastMessageTime: new Date(messageData.created_at).getTime(),
              lastMessage: messageData.message,
            };
            return sortChatsByTime([newChat, ...prevChats]);
          }
        });
      });

      socket.on("chatAccepted", ({ chatId, adminId }) => {
        const currentAdminId = localStorage.getItem("adminId");

        if (role !== "admin") {
          if (adminId != currentAdminId) {
            setChats((prevChats) =>
              prevChats.filter((chat) => chat.id !== chatId)
            );
          }
        }
      });

      socket.on("newChatNotification", (chatData) => {
        if (adminTeamIds.includes(chatData.team_id)) {
          chatData.lastMessageTime = new Date(chatData.timestamp).getTime();
          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex(
              (chat) => chat.id === chatData.id
            );
            if (existingChatIndex !== -1) {
              const updatedChats = [
                chatData,
                ...prevChats.filter(
                  (chat, index) => index !== existingChatIndex
                ),
              ];
              return sortChatsByTime(updatedChats);
            } else {
              const updatedChats = [chatData, ...prevChats];
              return sortChatsByTime(updatedChats);
            }
          });

          setUnreadMessagesCount((prevUnreadMessagesCount) => {
            const updatedCount = {
              ...prevUnreadMessagesCount,
              [chatData.id]: chatData.unread_messages_count,
            };
            localStorage.setItem(
              "unreadMessagesCount",
              JSON.stringify(updatedCount)
            );
            return updatedCount;
          });
        }
      });

      socket.on("chatDeleted", ({ chatId }) => {
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      });


      return () => {
        socket.off("newChatNotification");
        socket.off("newMessage");
        socket.off("chatOpened");
        socket.off("chatAccepted");
        socket.off("chatDeleted");
        socket.off("chatClosed");
      };
    }
  }, [adminId, adminTeamIds]);

  useEffect(() => {
    socket.on("chatArchived", (data) => {
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== data.chatId)
      );
    });

    return () => {
      // socket.off("updateUserStatus");
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
        setSelectedChatId(chatId.id);

        // Actualizar el contador de mensajes no leídos en localStorage
        setUnreadMessagesCount((prevUnreadMessagesCount) => {
          const updatedCount = { ...prevUnreadMessagesCount };
          updatedCount[chatId.id] = 0;
          localStorage.setItem(
            "unreadMessagesCount",
            JSON.stringify(updatedCount)
          );
          return updatedCount;
        });
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

  const handleCloseChat = async (chatId) => {
    const chat_id = chatId;
    const autoMessages = await getAutoMessagesEnd();

    const timestamp = new Date()
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Una vez cerrado no podrás reabrirlo nuevamente!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {

        try {
          const response = await fetch(
            `${Config.server_api}api/chats/messages/create-end-message`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                autoMessages: autoMessages.map((message) => ({
                  chatId: chat_id,
                  sender_id: sender_id,
                  message: message.message,
                  timestamp: timestamp,
                  sender: role,
                })),
              }),
            }
          );

          if(response.ok){
            autoMessages.forEach((message) => {
              socket.emit("sendMessage", {
                chatId: chat_id,
                sender_id: adminId,
                message: message.message,
                timestamp: timestamp,
              });
            });
          }
        } catch (error) {
          console.error("Error al enviar el chat:", error);
        }

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
            // Emitir un evento a través de WebSocket para notificar a los clientes
            socket.emit("chatClosed", { chatId: chat_id });
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

  const handleDeleteChat = async (chatId) => {
    const chat_id = chatId;
    const autoMessages = await getAutoMessagesEnd();

    const timestamp = new Date()
    .toISOString()
    .replace("T", " ")
    .substring(0, 19); 


    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción eliminará permanentemente el historial de mensajes en este chat!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {

        try {
          const response = await fetch(
            `${Config.server_api}api/chats/messages/create-end-message`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                autoMessages: autoMessages.map((message) => ({
                  chatId: chat_id,
                  sender_id: adminId,
                  message: message.message,
                  timestamp: timestamp,
                  sender: role,
                })),
              }),
            }
          );

          if(response.ok){
            autoMessages.forEach((message) => {
              socket.emit("sendMessage", {
                chatId: chat_id,
                sender_id: sender_id,
                message: message.message,
                timestamp: timestamp,
              });
            });
          }
        } catch (error) {
          console.error("Error al enviar el chat:", error);
        }

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
            // Emitir un evento a través de WebSocket para notificar a los clientes
            socket.emit("chatClosed", { chatId: chat_id });
            socket.emit("chatDeleted", { chatId: chat_id });
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

    const getAutoMessagesEnd = async () => {
      try {
        const response = await fetch(
          `${Config.server_api}api/chats/get-message-end`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          return data.messages_end;
        } else {
          console.error("Failed to fetch auto messages:", response.statusText);
          return [];
        }
      } catch (error) {
        console.error("Error fetching auto messages:", error);
        return [];
      }
    };

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
          className={`item ${
            selectedChatId === chat.id ? "selected" : ""
          } ${chat.status}`}
          onClick={() => handleChatClick(chat)}
        >
              <div className="content_text">
                <div className="img">
                  <img src={img} alt="" />
                </div>
                <div className="content">
                  <h4>{chat.username}</h4>
                  <p>{chat.team_name}</p>
                  {unreadMessagesCount[chat.id] > 0 && (
                    <span className="unread-count">
                      {unreadMessagesCount[chat.id]}
                    </span>
                  )}
                </div>
              </div>

              {role === "admin" ? (
                <DropdownMenu
                  options={[
                    { label: "Finalizar chat", value: "cerrar" },
                    { label: "Borrar chat", value: "borrar" },
                    { label: "Archivar", value: "archivar" },
                  ]}
                  onOptionClick={(option) => handleOptionClick(option, chat.id)}
                />
              ) : (
                <DropdownMenu
                  options={[
                    { label: "Finalizar chat", value: "cerrar" },
                    { label: "Archivar", value: "archivar" },
                  ]}
                  onOptionClick={(option) => handleOptionClick(option, chat.id)}
                />
              )}
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

  const handleButtonClick = (event) => {
    setShowMenu(!showMenu);
    event.stopPropagation(); // Detener la propagación del evento para evitar que se propague al item
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={menuRef}>
      <button onClick={handleButtonClick}>
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
