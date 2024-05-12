import { useState, useEffect } from "react";
import "./List_Chat.css";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import img from "../../../../assets/logo.png";
import io from "socket.io-client";

import Config from "../../../../Config/Config";

const List_chat = () => {
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
          <div className="item">
            <div className="img">
              <img src={img} alt="" />
            </div>
            <div className="content">
              <h4>Usuario</h4>
              <p>Equipo</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default List_chat;
