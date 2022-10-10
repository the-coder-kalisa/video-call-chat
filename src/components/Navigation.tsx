import {
  AccountCircleOutlined,
  Chat,
  Home,
  Notifications,
} from "@mui/icons-material";
import socket from "../axios";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { logedIn, selectedNav, user, Users } from "../atom";
import { User } from "../types";
import { CircularProgress } from "@mui/material";

const Navigation: FC = () => {
  const navigate = useNavigate();
  const activeNav = useRecoilValue<string>(selectedNav);
  const [myuser, setMyuser] = useRecoilState<User>(user);
  const setLog = useSetRecoilState(logedIn);
  const [loading, setLoading] = useState<boolean>(false);
  const setUsers = useSetRecoilState<never[]>(Users);
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    socket.emit("user", token, (response: User) => {
      console.log(response);
      console.log('emited')
      if (!response) return navigate("/login");
      setMyuser(response);
      setLoading(false);
      setLog(true);
    });
  }, []);

  socket.off("active").on("active", (data: User[]) => {
    setUsers(data as never[]);
  });
  const datas = ["Profile", "Settings", "Logout"];
  return (
    <div className="fixed border-b-2 items-center py-4 gap-7 bg-white w-full flex justify-center">
      {loading ? (
        <div className="h-screen bg-white w-full z-50 flex items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Link
            to={"/"}
            className={`${
              activeNav === "home" ? "border-b-2 border-black" : ""
            } cursor-pointer`}
          >
            <Home style={{ width: 30, height: 30 }} />
          </Link>
          <Link
            to={"/chat"}
            className={`${
              activeNav === "message" ? "border-b-2 border-black" : ""
            } cursor-pointer`}
          >
            <Chat style={{ width: 30, height: 30 }} />
          </Link>
          <Link
            to={"/notification"}
            className={`${
              activeNav === "notification" ? "border-b-2 border-black" : ""
            } cursor-pointer`}
          >
            <Notifications style={{ width: 30, height: 30 }} />
          </Link>
          <div
            className={`${
              activeNav === "user" ? "border-b-2 border-black" : ""
            } cursor-pointer flex group relative items-center gap-3`}
          >
            {myuser.profile !== "icon" ? (
              <div
                style={{ backgroundImage: `url(${myuser.profile})` }}
                className="h-[3rem] w-[3rem] bg-top rounded-full bg-cover  "
              ></div>
            ) : (
              <AccountCircleOutlined style={{ width: 30, height: 30 }} />
            )}
            <span>{myuser.username}</span>
            <div className="absolute top-8 bg-white group-hover:flex hidden z-10 flex-col">
              {datas.map((data, index) => (
                <Link
                  to={
                    data.toLowerCase() === "profile"
                      ? "/" + data.toLocaleLowerCase() + "/" + myuser.username
                      : "/" + data.toLocaleLowerCase()
                  }
                  key={index}
                  className="hover:bg-[blue] hover:text-white px-3 py-2 font-medium"
                >
                  {data}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Navigation;
