import "./Chat_a.css";
import { useState, useEffect, useRef } from "react";
import img from "../../../../assets/logo.png";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import io from "socket.io-client";
const socket = io("http://localhost:4000");
import Swal from "sweetalert2";

const Chat_a = ({ selectedChat, messages, setMessages }) => {
  const [messageInput, setMessageInput] = useState("");
  const [sender_id, setSender_id] = useState(null);
  const [clientID, setClientID] = useState(null);
  const endOfMessagesRef = useRef(null);
  const [isClientOnline, setIsClientOnline] = useState(false);
  const [acceptedChats, setAcceptedChats] = useState({});
  const [adminIdAcceptChat, setAdminIdAcceptChat] = useState(null);

  const [clientStatuses, setClientStatuses] = useState({});

  const [image, setImage] = useState(null);

  useEffect(() => {
    const admin_Id = localStorage.getItem("adminId");
    const admin_Id_Integer = parseInt(admin_Id, 10);
    setSender_id(admin_Id_Integer);
  }, [sender_id]);

  useEffect(() => {
    const handleNewMessage = (messageData) => {
      if (messageData.chatId === selectedChat?.id) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    };

    // Suscribirse a los eventos 'newMessage' y 'newImageMessage'
    socket.on("newMessage", handleNewMessage);
    // socket.on("newImageMessage", handleNewMessage);

    return () => {
      // Limpiar la suscripción al desmontar el componente
      socket.off("newMessage", handleNewMessage);
      socket.off("newImageMessage", handleNewMessage);
    };
  }, [selectedChat, setMessages]);

  useEffect(() => {
    if (selectedChat) {
      socket.emit("joinChat", selectedChat.id);
      console.log(`Joined chat: ${selectedChat.id}`);
      setClientID(selectedChat.client_id);

      return () => {
        socket.emit("leaveChat", selectedChat.id);
        console.log(`Left chat: ${selectedChat.id}`);
      };
    }
  }, [selectedChat, clientID, adminIdAcceptChat]);

  useEffect(() => {
    const handleUserStatusUpdate = ({ clientId, isOnline }) => {
      setClientStatuses((prevStatuses) => ({
        ...prevStatuses,
        [clientId]: isOnline,
      }));
    };

    socket.on("updateUserStatus", handleUserStatusUpdate);

    return () => {
      socket.off("updateUserStatus", handleUserStatusUpdate);
    };
  }, []);

  useEffect(() => {
    // Desplazarse al final de los mensajes cuando se actualicen
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedChat) {
    return <div className="screen_chat">Seleccione un chat para comenzar</div>;
  }

  const handleAcceptChat = async (chatId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/chats/accept-chat/${chatId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId: sender_id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept chat");
      } else {
        // Actualizar el estado del chat localmente después de aceptarlo
        setAcceptedChats((prevAcceptedChats) => ({
          ...prevAcceptedChats,
          [chatId]: true,
        }));
      }
    } catch (error) {
      console.error("Error accepting chat:", error);
    }
  };

  const handleMessageInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const message = messageInput.trim();

    // Verificar que el mensaje no esté vacío
    if (!message) {
      console.log("El mensaje está vacío");
      return;
    }
    const timestamp = new Date().getTime();
    const messageData = {
      chatId: selectedChat.id,
      sender_id: sender_id,
      message,
      timestamp: timestamp,
    };

    try {
      const response = await fetch(
        "http://localhost:4000/api/chats/messages/create-admin",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save message to database");
      } else {
        socket.emit("sendMessage", messageData);

        setMessageInput("");
      }
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    console.log("Image file selected:", file);
    if (file) {
      const message = "";
      const timestamp = new Date().getTime();

      const formData = new FormData();
      formData.append("chatId", selectedChat.id);
      formData.append("sender_id", sender_id);
      formData.append("message", message);
      formData.append("image", file);

      try {
        const response = await fetch(
          "http://localhost:4000/api/chats/messages/upload-admin-chat",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save message to database");
        } else {
          const responseData = await response.json();
          console.log("Backend response data:", responseData);

          const messageDataImage = {
            chatId: selectedChat.id,
            sender_id: sender_id,
            image: responseData.imageUrl,
            timestamp: timestamp,
          };

          socket.emit("sendMessage", messageDataImage);

          // No agregamos el mensaje al estado local aquí
          setMessageInput("");
          setImage(null);
        }
      } catch (error) {
        console.error("Error saving message to database:", error);
      }
    }
  };

  const handleOptionClick = async (option, chat) => {
    switch (option) {
      case "cerrar":
        handleCloseChat(chat);
        break;

      case "borrar":
        handleDeleteChat(chat);
        break;

      case "archivar":
        handleArchivedChat(chat);
        break;

      default:
        break;
    }
  };

  const handleCloseChat = (chat) => {
    const chat_id = chat.id;
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
              body: JSON.stringify({ chat_id }),
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

  const handleDeleteChat = (chat) => {
    const chat_id = chat.id;
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

  const handleArchivedChat = (chat) => {
    const chatId = chat.id;
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Estás seguro de que deseas archivar este chat?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, archivar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:4000/api/chats/archive-chat/${chatId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ chatId }),
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Éxito",
              text: "Chat archivado con éxito.",
              icon: "success",
              didClose: () => {
                window.location.reload();
              },
            });
          } else {
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al archivar el chat.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error al archivar el chat:", error);
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al archivar el chat.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <>
      <div className="screen_chat">
        <div className="header_chat">
          <div className="img">
            <img src={img} alt="" />
          </div>

          <div className="content">
            <div className="text">
              <h4>{selectedChat.username}</h4>
              <small
                className={
                  clientStatuses[selectedChat.client_id] ? "online" : "offline"
                }
              >
                {clientStatuses[selectedChat.client_id]
                  ? "En línea"
                  : "Desconectado"}
              </small>
            </div>

            <div className="button">
              <DropdownMenu
                options={[
                  { label: "Cerrar chat", value: "cerrar" },
                  { label: "Borrar chat", value: "borrar" },
                  { label: "Archivar chat", value: "archivar" },
                ]}
                onOptionClick={(option) =>
                  handleOptionClick(option, selectedChat)
                }
              />
            </div>
          </div>
        </div>

        <div className="chat_area">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender_id != sender_id ? "received" : "sent"
              }`}
            >
              <div
                className={`message_body ${
                  message.type === "image" ? "image" : "text"
                }`}
              >
                {message.message && <p>{message.message}</p>}
                {message.image && <img src={message.image} alt="Message" />}
                {/* <span className="message_time">{message.image}</span> */}
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef}></div>
        </div>

        <div className="input_area">
          {selectedChat.status === "closed" ? (
            <>
              <p>Chat cerrado</p>
            </>
          ) : (
            (selectedChat.admin_id !== null ||
              acceptedChats[selectedChat.id]) && (
              <>
                <div className="input">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleMessageInputKeyDown}
                  />
                </div>

                <div className="buttons">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="imageUpload"
                  />
                  <button className="media">
                    <label htmlFor="imageUpload">
                      <CameraAltRoundedIcon />
                    </label>
                  </button>
                  <button className="send" onClick={handleSendMessage}>
                    <SendRoundedIcon />
                  </button>
                </div>
              </>
            )
          )}
          {}
          {selectedChat.admin_id === null &&
            !acceptedChats[selectedChat.id] && (
              <>
                <div className="accept_chat">
                  <button onClick={() => handleAcceptChat(selectedChat.id)}>
                    Aceptar este chat
                  </button>
                </div>
              </>
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

export default Chat_a;
