import { AccountCircleOutlined, Circle, Search } from "@mui/icons-material";
import { Alert, Button, Snackbar } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import socket from "../axios";
import { user, Users } from "../atom";
import { User } from "../types";
const LeftSide: FC = () => {
  var users = useRecoilValue<User[]>(Users);
  const [lestUsers, setLestUsers] = useState<User[]>(users);
  const searchUser = (search: string) => {
    var usersf = users.filter((user: User) => user?.username!.includes(search));
    setLestUsers(usersf);
  };
  useEffect(() => {
    setLestUsers(users);
  }, [users]);
  const follow = (id: string) => {
    socket.emit("update", { id, updater: "id" }, (response: any) => {
      setOpen(true);
      if (response === "updated") {

        setInfo({status: true, message: "You followed this user"})
      }else {
        setInfo({status: false, message: response})
      }
    });
  };
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const [info, setInfo] = useState<{ message: string; status: boolean } | null>(
    null
  );
  const [open, setOpen] = useState<boolean>(false);
  const Userme = useRecoilValue(user);
  return (
    <div className="flex gap-5 fixed left-20 bg-white flex-col">
      <div className="text-xl font-semibold">All users</div>
      <Snackbar open={open} autoHideDuration={2500} onClose={handleClose}>
        <Alert
          severity={info?.status ? "success" : "error"}
          style={{
            background: !info?.status ? "#d73131" : "green",
            color: "white",
          }}
        >
          {info?.message}
        </Alert>
      </Snackbar>
      <div className="flex border bg-white gap-2 items-center p-2 rounded-md">
        <Search />
        <input
          type="text"
          placeholder="Search user by username"
          onChange={(e) => {
            // history.pushState({}, "", "?username=" + e.target.value);
            searchUser(e.target.value);
          }}
          className="border-none outline-none"
        />
      </div>
      <div className="flex flex-col gap-3">
        {lestUsers.map(
          (user: User, index) =>
            user._id !== Userme._id && (
              <div
                key={index}
                className="flex w-[20rem] jusity-between items-center gap-2 cursor-pointer hover:text-white rounded-md hover:bg-[#171791] p-3"
              >
                <div className="flex w-full  items-center gap-3">
                  <Link to={`profile/${user.username}`}>
                    <div className="relative">
                      {user.profile !== "icon" ? (
                        <div
                          style={{ backgroundImage: `url(${user.profile})` }}
                          className="h-[4rem] w-[4rem] bg-top rounded-full bg-cover  "
                        ></div>
                      ) : (
                        <AccountCircleOutlined
                          style={{ width: 64, height: 64 }}
                        />
                      )}
                      <div className="absolute bottom-0 right-0">
                        {user.status ? (
                          <Circle
                            titleAccess="active"
                            style={{ height: 15, width: 15 }}
                            className="text-green-500"
                          />
                        ) : (
                          <Circle
                            titleAccess="not active"
                            style={{ height: 15, width: 15 }}
                            className="text-gray-500"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex w-full items-center justify-between">
                      <Link
                        to={`profile/${user.username}`}
                        className="text-lg font-bold"
                      >
                        {user.username}
                      </Link>
                      <Button
                        onClick={() => follow(user._id!)}
                        variant="contained"
                        title={`follow ${user.username}`}
                        sx={{ width: 80, height: 30 }}
                      >
                        follow
                      </Button>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="flex gap-[0.1rem] items-center">
                        <div className="font-semibold">followers</div>
                        <div>{user.followers.length}</div>
                      </div>
                      <div className="flex gap-[0.1rem] items-center">
                        <div className="font-semibold">following</div>
                        <div>{user.following.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};
export default LeftSide;
