import React, { useState, useEffect } from "react";
import "../../Components/Admin/Chats/Chat.css";
import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import List_chat from "../../Components/Admin/Chats/List_Chat/List_chat";
import Chat_a from "../../Components/Admin/Chats/Chat/Chat_a";
import Info_Chat_a from "../../Components/Admin/Chats/Info_Chat/Info_Chat_a";
import Config from "../../Config/Config";

import io from "socket.io-client";
const socket = io(Config.server_api);

const Page_chats_a = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [acceptedChats, setAcceptedChats] = useState({});
  const [isAccepted, setIsAccepted] = useState(false);
  const [statusChat, setStatusChat] = useState("");

  const handleCloseChat = () => {
    setSelectedChat(null);
    setIsChatVisible(false); // Mostrar la lista de chats y ocultar el chat
  };

  const handleChatClick = async (chat) => {
    setSelectedChat(chat);
    loadChatMessages(chat.id);
    setIsChatVisible(true);
    
    // Verificar si el chat ya fue aceptado
    try {
      const response = await fetch(
        `${Config.server_api}api/chats/status/${chat.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const chatData = await response.json();
        setIsAccepted(chatData.admin_id !== null);
        setStatusChat(chatData.status === true);

      } else {
        console.error("Error fetching chat status:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching chat status:", error);
    }
  };

  const handleChatsLinkClick = () => {
    setIsChatVisible(false); // Mostrar la lista de chats y ocultar el chat
  };

  useEffect(() => {
    // Verificar si el adminId está presente en el localStorage
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Acceso no permitido, debe iniciar sesión",
        timer: 3000,
        didClose: () => {
          window.location = "/login";
        },
      });
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  const loadChatMessages = async (chatId) => {
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
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages);
      } else {
        console.error("Error fetching chat messages:", error);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  return (
    <>
      <div className="chats_container">
        <Sidebar_a
          onChatClick={handleChatClick}
          onChatsLinkClick={handleChatsLinkClick}
        />

        <div className="inner_container">
          <div className={`chat_list ${isChatVisible ? "hidden" : ""}`}>
            <List_chat onChatClick={handleChatClick} />
          </div>
          <div className={`chat_a ${isChatVisible ? "" : "hidden"}`}  >
            <Chat_a
              selectedChat={selectedChat}
              messages={messages}
              setMessages={setMessages}
              acceptedChats={acceptedChats}
              setAcceptedChats={setAcceptedChats}
              onCloseChat={handleCloseChat}
              isAccepted={isAccepted}
              onChatAccepted={() => setIsAccepted(true)}
              statusChat={statusChat}
              onStatus={() => setStatusChat(true)}
            />
          </div>
          <div className="info">
            <Info_Chat_a selectedChat={selectedChat} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page_chats_a;
