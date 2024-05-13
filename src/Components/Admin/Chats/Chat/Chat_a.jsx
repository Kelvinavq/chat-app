import "./Chat_a.css";
import { useState, useEffect } from "react";
import img from "../../../../assets/logo.png";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import io from "socket.io-client";

const Chat_a = ({ selectedClientId }) => {
  return (
    <>
      <div className="screen_chat">
        <div className="header_chat">
          <div className="img">
            <img src={img} alt="" />
          </div>

          <div className="content">
            <h4>Usuario</h4>
            <small className="online">En linea</small>
          </div>
        </div>

        <div className="chat_area">
          <div className="message sent">
            <img src={img} alt="Profile Pic" className="profile_pic" />
            <div className="message_body">
              Hello, how are you?
              <span className="message_time">10:00 AM</span>
            </div>
          </div>

          <div className="message received">
            <img src={img} alt="Profile Pic" className="profile_pic" />
            <div className="message_body">
              I'm good, thank you!
              <span className="message_time">10:05 AM</span>
            </div>
          </div>
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
