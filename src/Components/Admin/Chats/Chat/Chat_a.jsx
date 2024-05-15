import "./Chat_a.css";
import { useState, useEffect, useRef } from "react";
import img from "../../../../assets/logo.png";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import io from "socket.io-client";
const socket = io("http://localhost:4000");

const Chat_a = ({ selectedChat, messages, setMessages }) => {
  const [messageInput, setMessageInput] = useState("");
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    const handleNewMessage = (messageData) => {
      console.log("Received new message: ", messageData);
      if (messageData.chatId === selectedChat?.id) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    };

    // Suscribirse al evento 'newMessage'
    socket.on("newMessage", handleNewMessage);
    console.log("Subscribed to newMessage event");

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

    const messageData = {
      chatId: selectedChat.id,
      senderId: "admin",
      message,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("sendMessage", messageData);
    setMessageInput("");

    // Actualizar el estado de los mensajes con el nuevo mensaje enviado
    setMessages((prevMessages) => [...prevMessages, messageData]);
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
                message.senderId === "admin" ? "sent" : "received"
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
