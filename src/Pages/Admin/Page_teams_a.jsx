import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Teams from "../../Components/Admin/Teams/Teams";

const Page_teams_a = () => {
  return (
    <>
      <div className="equipos_container">
        <Sidebar_a />
        <div className="inner_container">
          <Teams />
        </div>
      </div>
    </>
  );
};

export default Page_teams_a;
