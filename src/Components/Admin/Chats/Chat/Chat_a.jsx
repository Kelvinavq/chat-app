import "./Chat_a.css";
import { useState, useEffect } from "react";
import img from "../../../../assets/logo.png";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import io from "socket.io-client";
const socket = io("http://localhost:4000");

const Chat_a = ({ selectedChat, messages, setMessages }) => {

  useEffect(() => {
    if (selectedChat) {
      socket.emit("joinChat", selectedChat.id);

      // Escuchar nuevos mensajes en tiempo real
      socket.on("newMessage", (messageData) => {
        if (messageData.chatId === selectedChat.id) {
          setMessages((prevMessages) => [...prevMessages, messageData]);
        }
      });
    }

    // Limpiar la subscripción al desmontar el componente
    return () => {
      socket.off("newMessage");
    };
  }, [selectedChat]);

  if (!selectedChat) {
    return <div className="screen_chat">Seleccione un chat para comenzar</div>;
  }

 

  return (
    <>
      <div className="screen_chat">
        <div className="header_chat">
          <div className="img">
            <img src={img} alt="" />
          </div>

          <div className="content">
            <h4>{selectedChat.username}</h4>
            <small className="online">{selectedChat.isOnline ? "En linea" : "Desconectado"}</small>
          </div>
        </div>

        <div className="chat_area">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.senderId === selectedChat ? "sent" : "received"
              }`}
            >
              {/* <img src={img} alt="Profile Pic" className="profile_pic" /> */}
              <div className="message_body">
                {message.message}
                <span className="message_time">{message.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="input_area">
          <div className="input">
            <input type="text" placeholder="Escribe un mensaje..." />
          </div>

          <div className="buttons">
            <button className="media">
              <CameraAltRoundedIcon />
            </button>
            <button className="send">
              <SendRoundedIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat_a;
