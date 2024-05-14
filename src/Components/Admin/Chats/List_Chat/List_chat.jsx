import { useState, useEffect } from "react";
import "./List_Chat.css";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import img from "../../../../assets/logo.png";
import io from "socket.io-client";
const socket = io("http://localhost:4000");

import Config from "../../../../Config/Config";

const List_chat = ({ onChatClick }) => {
  const [chats, setChats] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});

 useEffect(() => {
    // Realizar la solicitud GET al backend para obtener la lista de chats
    fetch(`http://localhost:4000/api/chats/list`)
      .then((response) => response.json())
      .then((data) => {
        setChats(data.chats);
      })
      .catch((error) => {
        console.error("Error fetching chat list:", error);
      });

    socket.on("newChatNotification", (chatData) => {
      setChats((prevChats) => [chatData, ...prevChats]);
    });

    socket.on("updateUserStatus", ({ clientId, isOnline }) => {
      setOnlineStatus((prevStatus) => ({ ...prevStatus, [clientId]: isOnline }));
    });


    // Limpiar el listener al desmontar el componente
    return () => {
      socket.off("newChatNotification");
      socket.off("updateUserStatus");
    };
  }, []);


  return (
    <>
      <div className="list_chats">
        <div className="title">
          <h2>Chats</h2>
          <button>
            <TuneOutlinedIcon />
          </button>
        </div>

        <div className="items">
          {chats.map((chat) => (
            <div key={chat.id} className="item" onClick={() => onChatClick(chat)}>
              <div className="img">
                <img src={img} alt="" />
              </div>
              <div className="content">
                <h4>{chat.username}</h4>
                <p>{chat.team_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default List_chat;
