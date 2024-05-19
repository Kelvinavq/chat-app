import Sidebar_a from "../../Components/Admin/Sidebar/Sidebar_a";
import Settings_profile from "../../Components/Admin/Settings/Settings_profile";

const Page_settings_profile = () => {
  return (
    <>
      <div className="settings_container">
        <Sidebar_a />
        <div className="inner_container">
          <Settings_profile />
        </div>
      </div>
    </>
  );
};

export default Page_settings_profile;
