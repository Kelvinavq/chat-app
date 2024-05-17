import "./Info_Chat_a.css";
import img from "../../../../assets/logo.png";



const Info_Chat_a =  ({ selectedChat}) => {

  if (!selectedChat) {
    return <div className="screen_chat">Seleccione un chat para comenzar</div>;
  }
   // Convertir la cadena de fecha en un objeto de fecha
   const registrationDate = new Date(selectedChat.date);

   // Formatear la fecha
   const formattedDate = registrationDate.toLocaleDateString(); // Formato: MM/DD/YYYY
 
   // Formatear la hora
   const formattedTime = registrationDate.toLocaleTimeString(); // Formato: HH:MM:SS
 


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
          <h4>Se registró el {formattedDate} a las {formattedTime}</h4>
          <h4>ID: {selectedChat.client_id}</h4>
          <h4>Usuario: {selectedChat.username}</h4>
        </div>
      </div>
    </>
  );
};

export default Info_Chat_a;
