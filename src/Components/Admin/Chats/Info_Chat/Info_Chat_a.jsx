import "./Info_Chat_a.css";
import img from "../../../../assets/logo.png";

const Info_Chat_a = () => {
  return (
    <>
      <div className="info_chat">
        <div className="title">
          <h2>Información del Usuario</h2>
        </div>

        <div className="img">
          <img src={img} alt="" />
        </div>

        <div className="info">
          <h4>Se registró el 02-04-24</h4>
          <h4>ID: 5</h4>
          <h4>Usuario: username</h4>
        </div>
      </div>
    </>
  );
};

export default Info_Chat_a;
