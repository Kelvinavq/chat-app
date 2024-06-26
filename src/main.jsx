import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./Config/Config.css";
import Bubble from "./Pages/Client/Bubble";

import Login from "./Pages/Login/Login";
import Page_chats_a from "./Pages/Admin/Page_chats_a";
import Page_teams_a from "./Pages/Admin/Page_teams_a";
import Page_agents_a from "./Pages/Admin/Page_agents_a";
import Page_suspende_a from "./Pages/Admin/Page_suspende_a";
import Page_chats_archiveds from "./Pages/Admin/Page_chats_archiveds";
import  Page_settings  from "./Pages/Admin/Page_settings";
import Page_settings_profile from "./Pages/Admin/Page_settings_profile";
import Page_clients from "./Pages/Admin/Page_clients";

const router = createBrowserRouter([
  // publics
  {
    path: "/",
    element: <Bubble />,
  },
  {
    path: "/login",
    element: <Login />,
  },

  // administradores
  {
    path: "/admin/chats",
    element: <Page_chats_a />,
  },
  {
    path: "/admin/equipos",
    element: <Page_teams_a />,
  },
  {
    path: "/admin/agentes",
    element: <Page_agents_a />,
  },
  {
    path: "/admin/agentes-suspendidos",
    element: <Page_suspende_a />,
  },
  {
    path: "/admin/archivados",
    element: <Page_chats_archiveds />,
  },
  {
    path: "/admin/ajustes/mensajes",
    element: <Page_settings />,
  },
  {
    path: "/admin/ajustes",
    element: <Page_settings_profile />,
  },
  {
    path: "/admin/clientes",
    element: <Page_clients />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
);
