import React, { useState, useEffect, useRef } from "react";
import Config from "../../../Config/Config";
import ReactDOM from "react-dom";
import "./Bubble.css";
import "../../../Config/Config.css";
import img from "../../../assets/logo.png";

import Swal from "sweetalert2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ReactHtmlParser from "react-html-parser";

import { v4 as uuidv4 } from "uuid";

import io from "socket.io-client";
const socket = io(Config.server_api);
import formatMessageTime from "../../../Config/formatMessageTime";

const Bubble_Chat = () => {
  const [showBubble, setShowBubble] = useState(false);

  const [isLastChatActive, setIsLastChatActive] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [clientID, setClientID] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [image, setImage] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isClientOnline, setIsClientOnline] = useState(false);

  const [messageWelcome, setMessageWelcome] = useState([]);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const endOfMessagesRef = useRef(null);

  const [isChatClosed, setIsChatClosed] = useState(false);
  const role = "user";

  const resetStates = () => {
    setIsLastChatActive(false);
    setIsRegistered(false);
    setShowRegisterForm(false);
    setUsername("");
    setEmail("");
    setPassword("");
    setClientInfo(null);
    setChatId(null);
    setClientID(null);
    setMessages([]);
    setMessageInput("");
    setImage(null);
    setTeams([]);
    setIsClientOnline(false);
    setMessageWelcome([]);
    setShowImageModal(false);
    setSelectedImageUrl(null);
    setIsChatClosed(false);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setShowRegisterForm(false);
    setShowBubble(false);
  };

  const handleOpenChat = () => {
    if (!isRegistered) {
      setShowRegisterForm(true);
    } else {
      setShowChat(true);
    }
    setShowBubble(true);
  };

  useEffect(() => {
    // Verificar el estado del cliente y dispositivo al cargar el componente
    checkClientRegistration();
    checkLastChatStatus();
    getClientInfo();
    getTeamList();
    getMessagesWerlcome();

    // Listener para manejar los mensajes recibidos del servidor
    const handleNewMessage = (data) => {
      // Verificar si el mensaje no está vacío antes de agregarlo al estado de mensajes
      if (
        (data.message && data.message.trim() !== "") ||
        (data.image && data.image.trim() !== "")
      ) {
        setMessages((prevMessages) => {
          // Si el mensaje proviene del cliente actual
          if (data.sender_id === clientID) {
            // Realiza la verificación de duplicados
            const isDuplicate = prevMessages.some((msg) => msg.id === data.id);
            if (isDuplicate) {
              return prevMessages;
            }
          }

          // Si el mensaje no es duplicado o proviene de otro cliente, agrégalo al estado de mensajes
          return [...prevMessages, data];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    // Limpia el listener cuando el componente se desmonta
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [isLastChatActive]);

  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", chatId);
    }

    socket.on("chatClosed", ({ chatId: closedChatId }) => {
      if (chatId === closedChatId) {
        resetStates();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-start",
          showConfirmButton: false,
          timer: 10000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "El chat actual ha sido cerrado",
        });
      }
    });

    socket.on("chatAccepted", ({ chatId }) => {
      console.log("chat aceptado", chatId);
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    });

    return () => {
      socket.off("chatClosed");
      socket.off("chatAccepted");
      if (chatId) {
        socket.emit("leaveChat", chatId);
      }
    };
  }, [chatId]);

  useEffect(() => {
    const handleConnect = () => {
      socket.emit("clientStatus", { clientId: clientID, isOnline: true });
    };

    const handleDisconnect = () => {
      socket.emit("clientStatus", { clientId: clientID, isOnline: false });
    };

    const handleBeforeUnload = () => {
      socket.emit("clientStatus", { clientId: clientID, isOnline: false });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [clientID]);

  // Función para obtener todos los mensajes de un chat activo
  const fetchChatMessages = async (chatId) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/chats/${chatId}/messages`,
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
        return data.messages;
      } else if (response.status === 404) {
        console.error("No messages found for the chat");
        return [];
      } else {
        console.error("Error fetching chat messages:", response.statusText);
        return [];
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  };

  // Función para cargar los mensajes del chat activo al abrir la burbuja de chat
  const loadChatMessages = async (chatId) => {
    const messages = await fetchChatMessages(chatId);
    setMessages(messages);
    setIsLastChatActive(true);
  };

  useEffect(() => {
    // Desplazarse al final de los mensajes cuando se actualicen
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const checkClientRegistration = async () => {
    try {
      const deviceId = localStorage.getItem("deviceId") || uuidv4();
      // solicitud al backend para verificar el estado de registro del cliente
      const response = await fetch(
        `${Config.server_api}api/users/check-registration?deviceId=${deviceId}`,
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
        setIsRegistered(data.isRegistered);
        setClientID(data.clientId);

        // Emitir evento de cliente en línea
        socket.emit("clientOnline", data.clientId);
      } else {
        setClientID(null);
        throw new Error("Failed to check client registration");
      }
    } catch (error) {
      console.error("Error checking client registration:", error);
    }
  };

  const checkLastChatStatus = async () => {
    try {
      const deviceId = localStorage.getItem("deviceId") || uuidv4();
      // Solicitud al backend para verificar el estado del último chat
      const response = await fetch(
        `${Config.server_api}api/users/check-last-chat?deviceId=${deviceId}`,
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

        if (data.isLastChatActive) {
          // Si el último chat está activo, actualiza chatId con el ID del último chat
          setChatId(data.chatId);
          setIsLastChatActive(data.isLastChatActive);
        } else {
          setIsLastChatActive(false);
          // Si el último chat está inactivo, actualiza chatId a null
          setChatId(null);
        }
      } else {
        throw new Error("Failed to check last chat status");
      }
    } catch (error) {
      console.error("Error checking last chat status:", error);
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

  const getMessagesWerlcome = async () => {
    try {
      const url = new URL(`${Config.server_api}api/chats/get-welcome`);

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
          setMessageWelcome(data.messages_welcome);
        }
      }
    } catch (error) {
      console.error("Error al obtener los equipos:", error);
    }
  };

  const getClientInfo = async () => {
    try {
      const deviceId = localStorage.getItem("deviceId") || uuidv4();
      // Solicitud al backend para obtener la información del cliente
      const response = await fetch(
        `${Config.server_api}api/users/client-info?deviceId=${deviceId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const clientData = await response.json();
      if (response.ok) {
        setClientInfo(clientData);
      } else if (response.status === 404) {
        setClientInfo(clientData);
        setClientInfo(null);
      } else {
        // Otros errores de la solicitud
        console.error("Error getting client info:", response.statusText);
        // Mostrar un mensaje de error o redirigir a una página de error
      }
    } catch (error) {
      console.error("Error getting client info:", error);
    }
  };

  const handleBubbleClick = () => {
    if (showBubble) {
      // Si la burbuja ya está abierta, cerrarla
      handleCloseChat();
    } else {
      // Si la burbuja está cerrada, abrir la ventana correspondiente
      handleOpenChat();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validar que ningún campo quede vacío
    if (!username || !password) {
      Swal.fire({
        icon: "error",
        text: "Por favor, complete todos los campos",
      });
      return;
    }

    if (password.length < 4) {
      Swal.fire({
        icon: "error",
        text: "La contraseña debe tener al menos 4 dígitos",
      });
      return;
    }

    const deviceId = localStorage.getItem("deviceId") || uuidv4();

    try {
      // Enviar los datos del formulario al backend para registrar al usuario
      const response = await fetch(`${Config.server_api}api/users/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          deviceId,
        }),
      });

      if (response.ok) {
        setIsRegistered(true);
        setShowRegisterForm(false);

        // Guardar el deviceId en localStorage
        localStorage.setItem("deviceId", deviceId);
        window.location.reload();
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      Swal.fire({
        icon: "error",
        text: "Usuario o contraseña incorrecto.",
      });
    }
  };

  const handleOptionClick = async (id, option) => {
    try {
      const clientId = clientInfo.clientInfo.id;
      setIsLastChatActive(true);

      // Obtener los mensajes automáticos para el equipo seleccionado
      const autoMessages = await getAutoMessagesByTeamId(id);

      const response = await fetch(
        `${Config.server_api}api/chats/create-chat`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
            option: option,
            team_id: id,
            autoMessages: autoMessages.map((message) => ({
              sender_id: null, // o algún valor adecuado si necesario
              message: message.message,
              timestamp: new Date().getTime(),
            })),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatId(data.chatId);

        // Emitir mensajes automáticos a través de socket
        autoMessages.forEach((message) => {
          socket.emit("sendMessage", {
            chatId: data.chatId,
            sender_id: clientId,
            message: message.message,
            timestamp: new Date().getTime(),
          });
        });

        // Actualizar el estado de los mensajes con los mensajes automáticos y el mensaje de opción
        setMessages((prevMessages) => [
          ...prevMessages,
          ...autoMessages.map((message) => ({
            sender_id: null,
            message: message.message,
            timestamp: new Date().getTime(),
          })),
          {
            message: option,
            sender_id: clientId,
            timestamp: new Date().getTime(),
          },
        ]);

        // Cargar automáticamente los mensajes después de establecer el chatId
        loadChatMessages(data.chatId);

        // Emitir el mensaje de opción a través de socket
        socket.emit("sendMessage", {
          chatId: data.chatId,
          sender_id: clientId,
          message: option,
        });
      } else {
        throw new Error("Failed to create chat and message");
      }
    } catch (error) {
      console.error("Error creating chat and message:", error);
    }
  };

  const handleMessageInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleImageUpload = async (event) => {
    const chat_id = chatId;
    const sender_id = clientInfo.clientInfo.id;
    const file = event.target.files[0];

    if (file) {
      const message = "";
      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      const formData = new FormData();
      formData.append("chatId", chat_id);
      formData.append("sender_id", sender_id);
      formData.append("message", message);
      formData.append("image", file);
      formData.append("sender", role);

      try {
        const response = await fetch(
          `${Config.server_api}api/chats/messages/upload-admin-chat`,
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

          const messageDataImage = {
            chatId: chat_id,
            sender_id: sender_id,
            image: responseData.imageUrl,
            created_at: timestamp,
            sender: role,
          };

          setMessages([...messages, messageDataImage]);
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

  const handleSendMessage = async () => {
    try {
      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      const message = messageInput;
      const chat_id = chatId;
      const sender_id = clientInfo.clientInfo.id;

      // Verificar que el mensaje no esté vacío
      if (!message.trim()) {
        console.log("El mensaje está vacío");
        return;
      }

      if (chatId === null) {
        // Verificar si chatId es null
        console.log("No hay chat activo");
        return;
      }

      const response = await fetch(
        `${Config.server_api}api/chats/messages/create`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: chat_id,
            sender_id: sender_id,
            message: message,
            type: "text",
            created_at: timestamp,
            sender: role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      } else {
        // Limpiar el textarea después de enviar el mensaje
        setMessageInput("");

        // Actualizar el estado de los mensajes con el nuevo mensaje enviado
        setMessages([
          ...messages,
          { sender_id: sender_id, message: message, created_at: timestamp },
        ]);
        socket.emit("sendMessage", { chatId, sender_id, message, timestamp });
        socket.emit("chatOpened", chatId);
        // Emitir evento para actualizar contador de mensajes no leídos
        // socket.emit("updateUnreadCount", { chatId });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  useEffect(() => {
    if (chatId) {
      loadChatMessages(chatId);
    }
  }, [chatId]);

  const getAutoMessagesByTeamId = async (id) => {
    try {
      const response = await fetch(
        `${Config.server_api}api/chats/get-message-team/${id}`,
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
        return data.messages_team;
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
      <div className={`bubble`}>
        <button
          onClick={handleBubbleClick}
          className={`bubble_button ${showBubble ? "active" : ""}`}
        >
          <ChatBubbleRoundedIcon />
        </button>

        <button
          onClick={showBubble ? handleCloseChat : handleOpenChat}
          className={`show ${showBubble ? "active" : ""}`}
        >
          <ChevronLeftIcon />
        </button>
      </div>

      {showRegisterForm && (
        <div className="client_chat active">
          <div className="chat-card">
            <div className="chat">
              <div className="form">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="head">
                    <h4>Bienvenido</h4>
                    <img src={img} alt="" />
                  </div>

                  <input
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="submit">Iniciar Chat</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChat && (
        <div className="client_chat active">
          <div className="chat-card ">
            <div className="chat">
              <div className="chat-title">
                <div className="img">
                  <img src={img} alt="Avatar" />
                </div>

                <div className="content">
                  <h2>Siempre paga</h2>
                  <button onClick={handleCloseChat}>
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="messages">
                {isLastChatActive && !isChatClosed ? (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${
                        message.sender_id === clientInfo.clientInfo.id
                          ? "message-personal"
                          : ""
                      } new`}
                    >
                      {message.message && (
                       ReactHtmlParser(message.message)
                      )}
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Message"
                          onClick={() => handleImageClick(message.image)}
                        />
                      )}
                      <div className="timestamp">
                        {" "}
                        {formatMessageTime(message.created_at)}
                      </div>
                      {index === messages.length - 1 && (
                        <div ref={endOfMessagesRef}></div>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    {messageWelcome.map((welcome, index) => (
                      <div className="message new" key={index}>
                        <figure className="avatar">
                          <img src={img} />
                        </figure>
                        {ReactHtmlParser(welcome.message)}
                      </div>
                    ))}

                    <div className="options">
                      {teams.map((team) => (
                        <button
                          className="option message new"
                          key={team.id}
                          onClick={() => handleOptionClick(team.id, team.name)}
                        >
                          {team.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {isLastChatActive && !isChatClosed && (
                <div className="message-box">
                  <div className="input">
                    <textarea
                      type="text"
                      className="message-input"
                      placeholder="Escribe un mensaje..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleMessageInputKeyDown}
                    ></textarea>
                  </div>

                  <div className="buttons">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      id="imageUpload"
                    />
                    <button className="file">
                      <label htmlFor="imageUpload">
                        <CameraAltOutlinedIcon />
                      </label>
                    </button>
                    <button
                      type="submit"
                      className="message-submit"
                      onClick={handleSendMessage}
                    >
                      <SendRoundedIcon />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="image_modal" onClick={() => setShowImageModal(false)}>
          <div className="image_modal_content">
            <img src={selectedImageUrl} alt="Selected Image" />
            <button onClick={() => setShowImageModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};
export function renderChatWidget(container) {
  ReactDOM.render(<Bubble_Chat />, container);
}

export default Bubble_Chat;
