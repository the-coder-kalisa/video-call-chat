import { CircularProgress } from "@mui/material";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { logedIn } from "./atom";
import socket from "./axios";

const Logout: FC = () => {
  const navigate = useNavigate();
  const setLog = useSetRecoilState(logedIn);
  useEffect(() => {
    return () => {
      setLog(false);
      socket.emit("forceDisconnect");
      localStorage.removeItem("token");
      navigate("/login");
    };
  }, []);
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <CircularProgress />
    </div>
  );
};
export default Logout;
