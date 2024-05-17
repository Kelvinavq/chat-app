import { Archiveds } from "../../Components/Admin/Archiveds/Archiveds";
import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";

 const Page_chats_archiveds = () => {
  return  <>
  <div className="archivados_container">
    <Sidebar_a />
    <div className="inner_container">
      <Archiveds />
    </div>
  </div>
</>;
};

export default Page_chats_archiveds;