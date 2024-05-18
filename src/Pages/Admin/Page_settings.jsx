import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Settings from "../../Components/Admin/Settings/Settings";

 const Page_settings = () => {
  return (
    <>
      <div className="settings_container">
        <Sidebar_a />
        <div className="inner_container">
          <Settings />
        </div>
      </div>
    </>
  );
};

export default Page_settings;