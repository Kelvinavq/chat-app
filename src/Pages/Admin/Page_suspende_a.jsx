import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Suspended_a from "../../Components/Admin/Suspended/Suspended_a";

const Page_suspende_a = () => {
  return (
    <>
      <div className="suspendidos_container">
        <Sidebar_a />
        <div className="inner_container">
          <Suspended_a />
        </div>
      </div>
    </>
  );
};

export default Page_suspende_a;
