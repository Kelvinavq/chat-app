import "./Suspended.css";
import Buttons from "../Teams/Buttons";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import img from "../../../assets/logo.png";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SmsIcon from '@mui/icons-material/Sms';
import Groups2Icon from '@mui/icons-material/Groups2';

const Suspended_a = () => {
  return (
    <>
      <div className="suspends">
        <div className="left">
          <div className="title">
            <h2>Agentes suspendidos</h2>
          </div>

          <Buttons />

          <div className="filters">
            <div className="input">
              <input type="text" placeholder="Buscar agentes" />
            </div>
          </div>
          <div className="counter">
            <h4>Total (2)</h4>
          </div>

          <div className="tabla">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Role</th>
                  <th scope="col"></th>
                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td data-label="Nombre" className="name">
                    <div className="circle">
                      <img src={img} alt="" />
                    </div>
                    <div className="content">
                      <p>Siempre paga</p> <span>siemprepaga463@gmail.com</span>{" "}
                    </div>
                  </td>
                  <td data-label="Role" className="admin">
                    <span>Admin</span>
                  </td>
                  <td data-label="" className="reactivar">
                    <button>Reactivar</button>
                  </td>
                  <td data-label="">
                    <button>
                      <MoreHorizIcon />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td data-label="Nombre" className="name">
                    <div className="circle">
                      <img src={img} alt="" />
                    </div>
                    <div className="content">
                      <p>Siempre paga</p> <span>siemprepaga463@gmail.com</span>{" "}
                    </div>
                  </td>
                  <td data-label="Role" className="agent">
                    <span>Agent</span>
                  </td>
                  <td data-label="" className="reactivar">
                    <button>Reactivar</button>
                  </td>
                  <td data-label="">
                    <button>
                      <MoreHorizIcon />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="right">
          <div className="inner_right">
            <div className="card">
              <div className="inner_card agent">
                <div className="circle">
                  <img src={img} alt="" />
                </div>
                <div className="content">
                  <p>
                    Siemprepaga463 <span className="admin">Admin</span>
                  </p>
                  <p>siemprepaga463@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="inner_card team">
                <div className="title">
                  <h4>Equipos</h4>
                </div>

                <div className="grid">
                  <div className="left">
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                  </div>

                  <div className="right">
                    <div className="item">
                      <div className="circle">G</div>
                      <div className="content">General</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="inner_card metrics">
                <div className="title">
                  <h4>Estadísticas</h4>
                </div>

                <div className="list">
                  <div className="item">
                    <div className="icon">
                      <ChatBubbleIcon />
                      <span>Total chats</span>
                    </div>
                    <div className="content">
                      <p>4</p>
                    </div>
                  </div>
                  <div className="item">
                    <div className="icon">
                      <SmsIcon />
                      <span>Chats abiertos</span>
                    </div>
                    <div className="content">
                      <p>4</p>
                    </div>
                  </div>
                  <div className="item">
                    <div className="icon">
                      <SmsIcon />
                      <span>Chats cerrados</span>
                    </div>
                    <div className="content">
                      <p>4</p>
                    </div>
                  </div>
                  <div className="item">
                    <div className="icon">
                      <Groups2Icon />
                      <span>Equipos pertenecientes</span>
                    </div>
                    <div className="content">
                      <p>4</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Suspended_a;
