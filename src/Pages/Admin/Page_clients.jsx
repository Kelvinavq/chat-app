import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Client from "../../Components/Admin/Clients/Client";

const Page_clients = () => {
  return (
    <>
      <div className="clients_container">
        <Sidebar_a />
        <div className="inner_container">
          <Client />
        </div>
      </div>
    </>
  );
};

export default Page_clients;
