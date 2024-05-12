import React, { useState, useEffect } from "react";
import Config from "../../../Config/Config";
import "./Bubble.css";
import img from "../../../assets/logo.png";

import Swal from "sweetalert2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { v4 as uuidv4 } from "uuid";

import io from "socket.io-client";
const socket = io("http://localhost:4000");

const Bubble_Chat = () => {
  const [isLastChatActive, setIsLastChatActive] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const [chatId, setChatId] = useState(null);

  const handleCloseChat = () => {
    setShowChat(false);
  };

  useEffect(() => {
    // Verificar el estado del cliente y dispositivo al cargar el componente
    checkClientRegistration();
    checkLastChatStatus();
    getClientInfo();

    // Listener para manejar los mensajes recibidos del servidor
    socket.on("newMessage", (data) => {
      // Maneja el mensaje recibido
      console.log("New message received:", data);
    });

    // Limpia el listener cuando el componente se desmonta
    return () => {
      socket.off("newMessage");
    };
  }, [isLastChatActive]);

  const checkClientRegistration = async () => {
    try {
      const deviceId = localStorage.getItem("deviceId") || uuidv4();
      // solicitud al backend para verificar el estado de registro del cliente
      const response = await fetch(
        `http://localhost:4000/api/users/check-registration?deviceId=${deviceId}`,
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
      } else {
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
        `http://localhost:4000/api/users/check-last-chat?deviceId=${deviceId}`,
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
          setChatId(data.lastChatId);
        } else {
          // Si el último chat está inactivo, actualiza chatId a null
          setChatId(null);
        }
        setIsLastChatActive(data.isLastChatActive);
      } else {
        throw new Error("Failed to check last chat status");
      }
    } catch (error) {
      console.error("Error checking last chat status:", error);
    }
  };

  const getClientInfo = async () => {
    try {
      const deviceId = localStorage.getItem("deviceId") || uuidv4();
      // Solicitud al backend para obtener la información del cliente
      const response = await fetch(
        `http://localhost:4000/api/users/client-info?deviceId=${deviceId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const clientData = await response.json();
        setClientInfo(clientData);
      } else {
        throw new Error("Failed to get client info");
      }
    } catch (error) {
      console.error("Error getting client info:", error);
    }
  };

  const handleBubbleClick = () => {
    if (!isRegistered) {
      setShowRegisterForm(true);
    } else {
      setShowChat(true);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validar que ningún campo quede vacío
    if (!username || !email || !password) {
      Swal.fire({
        icon: "error",
        text: "Please fill in all fields",
      });
      return;
    }

    const deviceId = localStorage.getItem("deviceId") || uuidv4();

    try {
      // Enviar los datos del formulario al backend para registrar al usuario
      const response = await fetch("http://localhost:4000/api/users/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          deviceId,
        }),
      });

      if (response.ok) {
        setIsRegistered(true);
        setShowRegisterForm(false);

        // Guardar el deviceId en localStorage
        localStorage.setItem("deviceId", deviceId);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      Swal.fire({
        icon: "error",
        text: "Registration failed. Please try again later",
      });
    }
  };

  const handleOptionClick = async (option) => {
    try {
      // Obtener el ID del cliente
      const clientId = clientInfo.clientInfo.id;

      // Registrar un nuevo chat y mensaje en la base de datos
      const response = await fetch(
        "http://localhost:4000/api/chats/create-chat",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
            option: option,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatId(data.chatId);

        // Emitir el mensaje al servidor
        socket.emit("sendMessage", {
          chatId: data.chatId,
          senderId: clientId,
          message: option,
        });
      } else {
        throw new Error("Failed to create chat and message");
      }

      // Si todo salió bien, actualiza el estado o realiza cualquier otra acción necesaria
    } catch (error) {
      console.error("Error creating chat and message:", error);
      // Manejar el error apropiadamente
    }
  };

  const handleMessageInputChange = (e) => {
    console.log("Message input changed:", e.target.value);
  };

  const handleMessageInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleAttachFile = () => {
    console.log("Attach file button clicked");
  };

  const handleSendMessage = async () => {
    try {
      const message = "Mensaje a enviar";
      const chat_id = chatId;
      const senderId = clientInfo.clientInfo.id;

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

      // Enviar el mensaje al servidor para su registro en la base de datos
      const response = await fetch(
        "http://localhost:4000/api/messages/create",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: chat_id,
            senderId: senderId,
            message: message,
            type: "text",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      } else {
        socket.emit("sendMessage", { chatId, senderId, message });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Manejar el error apropiadamente
    }
  };

  return (
    <>
      <div className={`bubble`}>
        <button onClick={handleBubbleClick} className={`bubble_button active`}>
          <ChatBubbleRoundedIcon />
        </button>

        <button onClick={handleBubbleClick} className={`show active`}>
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
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
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
                {!isLastChatActive && (
                  <>
                    <div className="message new">
                      <figure className="avatar">
                        <img src={img} />
                      </figure>
                      <p>
                        ¡Hola, Bienvenido{" "}
                        <strong>{clientInfo.clientInfo.username}</strong>!
                      </p>
                    </div>
                    <div className="message new">
                      <figure className="avatar">
                        <img src={img} />
                      </figure>
                      <p>Por favor, seleccione una opción para continuar.</p>
                    </div>

                    <div className="options">
                      <button
                        className="option message new"
                        onClick={() => handleOptionClick("Recargar fichas")}
                      >
                        Recargar fichas
                      </button>
                      <button
                        className="option message new"
                        onClick={() => handleOptionClick("Retirar")}
                      >
                        Retirar
                      </button>
                      <button
                        className="option message new"
                        onClick={() => handleOptionClick("Soporte")}
                      >
                        Soporte
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="message-box">
                <div className="input">
                  <textarea
                    type="text"
                    className="message-input"
                    placeholder="Escribe un mensaje..."
                    onChange={handleMessageInputChange}
                    onKeyDown={handleMessageInputKeyDown}
                  ></textarea>
                </div>

                <div className="buttons">
                  <button className="file" onClick={handleAttachFile}>
                    <CameraAltOutlinedIcon />
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Bubble_Chat;
