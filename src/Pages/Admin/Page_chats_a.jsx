import React, { useState, useEffect  } from "react";
import "../../Components/Admin/Chats/Chat.css";
import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import List_chat from "../../Components/Admin/Chats/List_Chat/List_chat";
import Chat_a from "../../Components/Admin/Chats/Chat/Chat_a";
import Info_Chat_a from "../../Components/Admin/Chats/Info_Chat/Info_Chat_a";

const Page_chats_a = () => {

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);


  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    loadChatMessages(chat.id);
  };

  const loadChatMessages = (chatId) => {
    fetch(`http://localhost:4000/api/chats/${chatId}/messages`)
      .then((response) => response.json())
      .then((data) => {
        setMessages(data.messages);
      })
      .catch((error) => {
        console.error("Error fetching chat messages:", error);
      });
  };


  return (
    <>
      <div className="chats_container">
        <Sidebar_a />

        <div className="inner_container">
          <div className="chat_list">
            <List_chat  onChatClick={handleChatClick} />
          </div>
          <div className="chat_a">
            <Chat_a selectedChat={selectedChat} messages={messages} setMessages={setMessages} />
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
