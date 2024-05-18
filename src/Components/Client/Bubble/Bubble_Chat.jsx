import React, { useState, useEffect, useRef } from "react";
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
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [teams, setTeams] = useState([]);

  const [messageWelcome, setMessageWelcome] = useState([]);

  const endOfMessagesRef = useRef(null);

  const handleCloseChat = () => {
    setShowChat(false);
    setShowBubble(false);
  };

  const handleOpenChat = () => {
    setShowChat(true);
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
      if (data.message.trim() !== "") {
        setMessages((prevMessages) => {
          // Verificar si el mensaje ya existe en el estado de mensajes
          const isDuplicate = prevMessages.some((msg) => msg.id === data.id);
          if (isDuplicate) {
            return prevMessages;
          }
          // Agregar el nuevo mensaje al estado de mensajes
          return [...prevMessages, data];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    console.log(messages);

    // Limpia el listener cuando el componente se desmonta
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [isLastChatActive]);

  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", chatId);
      console.log(`Joined chat roomm: ${chatId}`);
    }

    return () => {
      if (chatId) {
        socket.emit("leaveChat", chatId);
        console.log(`Left chat room: ${chatId}`);
      }
    };
  }, [chatId]);

  // Función para obtener todos los mensajes de un chat activo
  const fetchChatMessages = async (chatId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/chats/${chatId}/messages`,
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
        // Emitir evento de cliente en línea
        socket.emit("clientOnline", data.clientId);
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
      const url = new URL(`http://localhost:4000/api/chats/list-team`);

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
      const url = new URL(`http://localhost:4000/api/chats/get-welcome`);

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
      } else if (response.status === 404) {
        // Manejar el caso en el que no se encuentra el cliente
        console.error("Client not found");
        // Mostrar un mensaje de error o redirigir a una página de error
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
    if (!isRegistered) {
      setShowRegisterForm(true);
      setShowBubble(true);
    } else {
      setShowChat(true);
      setShowBubble(true);
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
        window.location.reload();
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

  const handleOptionClick = async (id, option) => {
    try {
      const clientId = clientInfo.clientInfo.id;
      setIsLastChatActive(true);
  
      // Obtener los mensajes automáticos para el equipo seleccionado
      const autoMessages = await getAutoMessagesByTeamId(id);
  
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
            team_id: id,
            autoMessages: autoMessages.map(message => ({
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
          ...autoMessages.map(message => ({
            sender_id: null,
            message: message.message,
            timestamp: new Date().getTime(),
          })),
          { message: option, sender_id: clientId, timestamp: new Date().getTime() }
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

  const handleAttachFile = () => {
    console.log("Attach file button clicked");
  };

  const handleSendMessage = async () => {
    try {
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
      const timestamp = new Date().getTime();
      // Enviar el mensaje al servidor para su registro en la base de datos
      const response = await fetch(
        "http://localhost:4000/api/chats/messages/create",
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
            timestamp: timestamp,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      } else {
        // Limpiar el textarea después de enviar el mensaje
        setMessageInput("");

        // Actualizar el estado de los mensajes con el nuevo mensaje enviado
        setMessages([...messages, { sender_id: sender_id, message: message }]);
        socket.emit("sendMessage", { chatId, sender_id, message, timestamp });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (chatId) {
      loadChatMessages(chatId);
    }
  }, [chatId]);

  const getAutoMessagesByTeamId = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/chats/get-message-team/${id}`,
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
                {isLastChatActive ? (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${
                        message.sender_id === clientInfo.clientInfo.id
                          ? "message-personal"
                          : ""
                      } new`}
                    >
                      <p>{message.message}</p>
                      <div className="timestamp"></div>
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
                        <p>{welcome.message}</p>
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
