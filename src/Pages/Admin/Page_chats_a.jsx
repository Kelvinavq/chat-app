import React, { useState } from "react";
import "../../Components/Admin/Chats/Chat.css";
import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import List_chat from "../../Components/Admin/Chats/List_Chat/List_chat";
import Chat_a from "../../Components/Admin/Chats/Chat/Chat_a";
import Info_Chat_a from "../../Components/Admin/Chats/Info_Chat/Info_Chat_a";

const Page_chats_a = () => {

  return (
    <>
      <div className="chats_container">
        <Sidebar_a />

        <div className="inner_container">
          <div className="chat_list">
            <List_chat  />
          </div>
          <div className="chat_a">
            <Chat_a  />
          </div>
          <div className="info">
            <Info_Chat_a />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page_chats_a;
