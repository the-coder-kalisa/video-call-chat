import Navigation from "./components/Navigation";
import { useState, useEffect, Key } from "react";
import { AccountCircleOutlined, ImageSharp } from "@mui/icons-material";
import { Post, User } from "./types";
import axios from "./axios";
import { useParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { selectedNav } from "./atom";
import socket from "./axios";
function Profile() {
  const showImage = (url: string) => {
    return (
      <div
        style={{ backgroundImage: `url(${url})` }}
        className="h-[10rem] w-[10rem] bg-cover rounded-full"
      ></div>
    );
  };
  const datas = ["following", "followers"];
  const [User, setUser] = useState<any>({});
  const username = useParams().username;
  const setSelectedNav = useSetRecoilState(selectedNav);

  useEffect(() => {
    setSelectedNav("");
    socket.emit("user-return", username, (response: any) => {
      setUser(response);
    });
  }, []);
  return (
    <div>
      <Navigation />
      <div className="flex items-center pt-[7rem] justify-center">
        <div className="flex flex-col gap-1 items-center">
          {User.profile !== "icon" ? (
            showImage(User.profile)
          ) : (
            <AccountCircleOutlined style={{ width: 30, height: 30 }} />
          )}
          <span className="font-bold text-xl">{User.username}</span>
          <div className="flex flex-col items-center gap-3">
            <span className="pt-2 font-bold">{User.fullname}</span>
            <div className="flex  gap-2 items-center">
              {datas.map((data, index) => {
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-lg font-medium">{data}</div>
                    <div>{User[data]?.length}</div>
                  </div>
                );
              })}
              <div className="flex items-center gap-3">
                <div className="text-lg font-medium">posts</div>
                <div>{User.totalPosts}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-center mt-5">
        <div className="border-t-2 border-sold border-gray-400 w-[90%] object-center "></div>
      </div>
      <div className="grid px-5 mt-5 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-10">
        {User?.posts?.map((post: Post, index: Key) => {
          return (
            <div key={index} className="border">
              {post.images.length > 0 ? (
                <div
                  style={{ backgroundImage: `url(${post.images[0]})` }}
                  className="h-[20rem] relative w-[20rem] bg-cover bg-top"
                >
                  {post.images.length > 1 && (
                    <div className="absolute top-0 right-0">
                      <ImageSharp />
                    </div>
                  )}
                  {post.text && <div>{post.text}</div>}
                </div>
              ) : (
                <div className="border flex items-center justify-center font-bold text-xl min-h-[15rem]">
                  {post.text}
                </div>
              )}
              <div>{post.likes.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Profile;
