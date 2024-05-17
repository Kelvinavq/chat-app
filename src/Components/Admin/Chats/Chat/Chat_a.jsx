import "./Chat_a.css";
import { useState, useEffect, useRef } from "react";
import img from "../../../../assets/logo.png";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import io from "socket.io-client";
const socket = io("http://localhost:4000");

const Chat_a = ({ selectedChat, messages, setMessages }) => {
  const [messageInput, setMessageInput] = useState("");
  const [sender_id, setSender_id] = useState(null);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    const admin_Id = localStorage.getItem("adminId");
    const admin_Id_Integer = parseInt(admin_Id, 10); // Convertir a número entero
    setSender_id(admin_Id_Integer);
  }, [sender_id]);
  

  useEffect(() => {
    const handleNewMessage = (messageData) => {
      if (messageData.chatId === selectedChat?.id) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    };

    // Suscribirse al evento 'newMessage'
    socket.on("newMessage", handleNewMessage);

    return () => {
      // Limpiar la suscripción al desmontar el componente
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat, setMessages]);

  useEffect(() => {
    if (selectedChat) {
      socket.emit("joinChat", selectedChat.id);
      console.log(`Joined chat: ${selectedChat.id}`);

      return () => {
        socket.emit("leaveChat", selectedChat.id);
        console.log(`Left chat: ${selectedChat.id}`);
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    // Desplazarse al final de los mensajes cuando se actualicen
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedChat) {
    return <div className="screen_chat">Seleccione un chat para comenzar</div>;
  }

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

  return (
    <>
      <div className="screen_chat">
        <div className="header_chat">
          <div className="img">
            <img src={img} alt="" />
          </div>

          <div className="content">
            <h4>{selectedChat.username}</h4>
            <small className="online">
              {selectedChat.isOnline ? "En linea" : "Desconectado"}
            </small>
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
              <div className="message_body">
                {message.message}
                <span className="message_time">{message.time}</span>
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef}></div>
        </div>

        <div className="input_area">
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
            <button className="media">
              <CameraAltRoundedIcon />
            </button>
            <button className="send" onClick={handleSendMessage}>
              <SendRoundedIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat_a;
