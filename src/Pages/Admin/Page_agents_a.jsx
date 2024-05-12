import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Agents_a from "../../Components/Admin/Agents/Agents_a";

const Page_agents_a = () => {
  return (
    <>
      <div className="agentes_container">
        <Sidebar_a />
        <div className="inner_container">
          <Agents_a />
        </div>
      </div>
    </>
  );
};

export default Page_agents_a;
