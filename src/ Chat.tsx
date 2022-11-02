import {
  AccountCircleOutlined,
  Audiotrack,
  Circle,
  Close,
  Group,
  InsertEmoticon,
  Send,
  VideoCall,
} from "@mui/icons-material";
import { Backdrop, Button, IconButton } from "@mui/material";
import Picker, { EmojiClickData } from "emoji-picker-react";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { selectedNav, user, Users } from "./atom";
import Navigation from "./components/Navigation";
import { User } from "./types";
import socket from "./axios";
import Peer from "simple-peer";
function Chat() {
  const setSelectedNav = useSetRecoilState(selectedNav);
  const users = useRecoilValue(Users);
  const [User, setUser] = useRecoilState<User>(user);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  useEffect(() => {
    setSelectedNav("message");
  }, []);
  const [room, setRoom] = useState<string>("");
  const order_ids = (id1: string, id2: string): string => {
    let room = id1 > id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    setRoom(room);
    return room;
  };

  const handleSelecteuser = (user: User) => {
    let room = order_ids(User._id!, user._id!);

    setSelectedUser(user);
    socket.emit("join-room", room, (response: any) => {
      setMessages(response);
    });
  };
  const date = new Date();
  const getTime = (): string => {
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    hours = hours.length > 1 ? hours : `0${hours}`;
    minutes = minutes.length > 1 ? minutes : `0${minutes}`;
    return `${hours}:${minutes}`;
  };
  const getDate = (): string => {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    let day = date.getDate().toString();
    month = month.length > 1 ? month : `0${month}`;
    day = day.length > 1 ? day : `0${day}`;
    return `${day}/${month}/${year}`;
  };
  const sendMessage = (e: FormEvent<HTMLElement>) => {
    const time = getTime();
    const date = getDate();
    e.preventDefault();
    socket.emit("send-message", {
      room,
      sender: User._id,
      message,
      replying: false,
      time,
      date,
    });
    setMessage("");
  };
  interface Message {
    _id: string;
    messages: {
      message: string;
      time: string;
      sender: string;
      date: string;
    }[];
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const handleEmojiClick = (emoji: EmojiClickData, _event: MouseEvent) => {
    let msg = message;
    msg += emoji.emoji;
    setMessage(msg);
  };
  const [message, setMessage] = useState<string>("");
  const defaultRooms = ["General", "announcement"];
  socket.off("another-message").on("another-message", (messages) => {
    setMessages(messages);
    if (messageDiv.current) messageDiv.current.scrollIntoView();
  });
  const messageDiv = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (messageDiv.current) messageDiv.current.scrollIntoView();
  }, [messageDiv, messages]);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const connnectionRef = useRef<Peer.Instance | null>(null);
  const [call, setCall] = useState<
    {
      _id: string;
      isRecieved: boolean;
      from: string;
      signal: any;
    }[]
  >([]);
  const callerVideo = useRef<HTMLVideoElement | null>(null);
  const findIndexinUsers = (id: string) => {
    let someUsers: User[] = [...users];
    return someUsers.findIndex((value) => value._id === id);
  };
  socket
    .off("calling-room")
    .on(
      "calling-room",
      ({
        user,
        from,
        signal,
        _id,
      }: {
        user: User;
        from: string;
        signal: any;
        _id: string;
      }) => {
        setCallEnded(false);
        let user1index = findIndexinUsers(from!);
        if (user._id === User._id) {
          setUser(user);
        }
        let user1: User = users[user1index];
        document.title =
          user1._id === User._id
            ? user1.username + " is calling you"
            : "you're calling";
        setCall([...call, { isRecieved: true, from, signal, _id }]);
      }
    );
  var [firstTime, setFirstTime] = useState<number>(0);
  const [stopCounting, setStopCounting] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const goToVideoCall = () => {
    setOpen(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        setCallEnded(false);
        setCallAppected(false);
        const peer = new Peer({ initiator: true, trickle: false, stream });
        if (callerVideo.current) {
          setStream(stream);
          callerVideo.current.srcObject = stream;
          peer.on("signal", (data) => {
            socket.emit("call-user", {
              userToCall: selectedUser?._id,
              signalData: data,
              from: User._id,
            });
          });
          peer.on("stream", (currentStream) => {
            console.log(currentStream);
            if (userVideo.current) {
              userVideo.current.srcObject = currentStream;
            }
          });
          // let stop = false;
          // if (!stopCounting || !  stop) {
          //   setInterval(() => {
          //     console.log(!stop)
          //     if (!stop || !stopCounting) {
          //       firstTime++;
          //       setFirstTime(firstTime);
          //     }
          //   }, 1000);
          // } else {
          //   setFirstTime(0);
          // }
          socket.on("call-accepted", (signal) => {
            console.log(signal);
            // stop = true;
            // setStopCounting(true);
            // setCallEnded(false);
            setCallAppected(true);
            // setOnCall(true);
            peer.signal(signal);
            if (connnectionRef.current) connnectionRef.current = peer;
          });
        }
      });
  };
  const [callAccepted, setCallAppected] = useState<boolean>(false);
  const [callEnded, setCallEnded] = useState<boolean>(false);
  socket.off("immed-hang-up").on("immed-hang-up", (data) => {
    console.log(data);
  });
  useEffect(() => {
    console.log(firstTime);
  }, [firstTime]);
  const [contact, setContact] = useState<string | null>(null);
  const answerCall = (id: string, from: string) => {
    setOpen(true);
    setContact(from);
    setCallAppected(true);
    setCallEnded(false);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        console.log(stream);
        if (callerVideo.current) {
          callerVideo.current.srcObject = stream;
        }
        setStream(stream);
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on("signal", (data) => {
          socket.emit("answer-call", { signal: data, to: from });
          setOnCall(true);
        });
        peer.on("stream", (currentStream) => {
          if (userVideo.current) userVideo.current.srcObject = currentStream;
        });
        peer.signal(call?.find((value) => value._id === id)?.signal);
        if (connnectionRef.current) connnectionRef.current = peer;
      });
  };
  const [onCall, setOnCall] = useState<boolean>(false);
  socket.off("call-ended").on("call-ended", () => {
    setOpen(false);
    stream?.getTracks().forEach((track) => track.stop());
    if (connnectionRef.current) connnectionRef.current.destroy();
  });
  const leaveCall = () => {
    setCallEnded(true);
    setOpen(false);
    stream?.getTracks().forEach((track) => track.stop());
    if (connnectionRef.current) connnectionRef.current.destroy();
    if (!contact) {
      socket.emit("ended-call", { to: selectedUser?._id });
    } else {
      socket.emit("ended-call", { to: contact });
    }
    setCallEnded(false);
  };
  const hangup = (id: string, from: string) => {
    socket.emit("immed-hang-up", from);
  };
  return (
    <div>
      <Navigation />
      <Backdrop
        className="z-50 relative flex items-center justify-center"
        open={open}
      >
        <div
          onClick={() => {
            if (onCall) {
              leaveCall();
            } else {
              setCallEnded(true);
              setStopCounting(true);
              setOpen(false);
              stream?.getTracks().forEach((track) => track.stop());
              if (connnectionRef.current) connnectionRef.current.destroy();
            }
          }}
          className="absolute text-white cursor-pointer right-5 top-5"
        >
          <Close />
        </div>
        {!callAccepted ? (
          <div className="flex items-center gap-3 flex-col">
            <div className="font-bold text-2xl text-white">
              Calling {selectedUser?.username}
            </div>
            <Button
              onClick={() => {
                setCallEnded(true);
                setOpen(false);
                setStopCounting(true);
                stream?.getTracks().forEach((track) => track.stop());
                if (connnectionRef.current) connnectionRef.current.destroy();
              }}
              variant="contained"
              sx={{ width: 100 }}
            >
              Hung up
            </Button>
          </div>
        ) : !callEnded ? (
          <div className="flex flex-col items-center gap-3">
            <video
              ref={userVideo}
              className="w-[70rem]"
              playsInline
              autoPlay
            ></video>
            <Button onClick={leaveCall} variant="contained" sx={{ width: 100 }}>
              Hung up
            </Button>
          </div>
        ) : (
          <div className="font-bold text-2xl text-white">call ended</div>
        )}
        <video
          ref={callerVideo}
          playsInline
          className="absolute bottom-0 right-0 h-[20rem] w-[20rem] "
          autoPlay
        ></video>
      </Backdrop>
      <div className="flex pl-20 pt-[10rem] h-[52rem] justify-center">
        <div className="flex border w-[20rem] flex-col">
          <div className="border-b  p-5 text-lg font-bold">calls</div>
          {User.calls && User.calls.length > 0 && (
            <div className="flex flex-col overflow-auto p-2 gap-4">
              {User.calls.map((call, index) => {
                let userToIndex = findIndexinUsers(call.to);
                let user: User | undefined =
                  call.from !== User._id ? User : users[userToIndex];
                return (
                  user && (
                    <div
                      key={index}
                      className="flex w-full justify-between items-center"
                    >
                      <div className="flex items-center gap-1">
                        <div
                          style={{ backgroundImage: `url(${user.profile})` }}
                          className="h-[3rem] rounded-full w-[3rem] bg-cover bg-top"
                        ></div>
                        <div className="flex flex-col gap-1">
                          <div className="font-bold text-lg">
                            {user.username}
                          </div>
                          {call.time ? (
                            <div>your call lasted{call.time}</div>
                          ) : (
                            <div>is calling you</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => answerCall(call._id, call.from)}
                          variant="contained"
                          className=""
                        >
                          Answer
                        </Button>
                        <Button
                          onClick={() => hangup(call._id, call.from)}
                          variant="contained"
                          className=""
                        >
                          Hung up
                        </Button>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t border-l border-b h-[42rem] w-[25rem]">
          <div className="border-b flex items-center gap-2 w-full py-2 px-2">
            <div>
              {User.profile !== "icon" ? (
                <div
                  style={{ backgroundImage: `url(${User.profile})` }}
                  className="h-[3.2rem] w-[3.2rem] bg-top rounded-full bg-cover  "
                ></div>
              ) : (
                <AccountCircleOutlined style={{ width: 51.2, height: 51.2 }} />
              )}
            </div>
            <div className="font-bold text-lg">{User.username}</div>
          </div>
          <div className="flex flex-col gap-2 py-5">
            <div className="flex flex-col gap-2 border-b pb-2">
              {defaultRooms.map((room, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Group
                    style={{
                      height: 51.2,
                      width: 51.2,
                      border: "2px solid gray",
                      borderRadius: "50%",
                      padding: 5,
                    }}
                  />
                  <div>{room}</div>
                </div>
              ))}
            </div>
            {users.map((user: User, index) => (
              <div
                className={`flex gap-3 border-b py-2 hover:text-white hover:bg-[#1b1b83] cursor-pointer items-center ${
                  selectedUser?._id === user._id && "bg-[#1b1b83] text-white"
                }`}
                key={index}
                onClick={() => handleSelecteuser(user)}
              >
                <div className="relative">
                  {user.profile !== "icon" ? (
                    <div
                      style={{ backgroundImage: `url(${user.profile})` }}
                      className="h-[3.2rem] w-[3.2rem] bg-top rounded-full bg-cover  "
                    ></div>
                  ) : (
                    <AccountCircleOutlined
                      style={{ width: 51.2, height: 51.2 }}
                    />
                  )}
                  <div className="absolute -bottom-1 right-0">
                    {user.status ? (
                      <Circle
                        titleAccess="active"
                        style={{ height: 12, width: 12 }}
                        className="text-green-500"
                      />
                    ) : (
                      <Circle
                        titleAccess="not active"
                        style={{ height: 12, width: 12 }}
                        className="text-gray-500"
                      />
                    )}
                  </div>
                </div>
                <div className=" font-medium">{user.username}</div>
                {user._id === User._id && <div>(you)</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="border h-[42rem] w-[50rem]">
          {selectedUser ? (
            <div className="relative h-full ">
              <div className="border-b bg-white z-40 absolute w-full top-0 py-2 px-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Link
                    title={`Go to ${selectedUser.username}'s profile`}
                    to={`/profile/${selectedUser.username}`}
                    className="flex items-center gap-2 "
                  >
                    <div className="relative">
                      {selectedUser.profile !== "icon" ? (
                        <div
                          style={{
                            backgroundImage: `url(${selectedUser.profile})`,
                          }}
                          className="h-[3.2rem] w-[3.2rem] bg-top rounded-full bg-cover  "
                        ></div>
                      ) : (
                        <AccountCircleOutlined
                          style={{ width: 51.2, height: 51.2 }}
                        />
                      )}
                      <div className="absolute -bottom-1 right-0">
                        {selectedUser.status ? (
                          <Circle
                            titleAccess="active"
                            style={{ height: 12, width: 12 }}
                            className="text-green-500"
                          />
                        ) : (
                          <Circle
                            titleAccess="not active"
                            style={{ height: 12, width: 12 }}
                            className="text-gray-500"
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-medium">
                      {selectedUser.username}
                    </div>
                  </Link>
                </div>
                <div className="flex items-center">
                  <IconButton title={`audio call ${selectedUser.username}`}>
                    <Audiotrack />
                  </IconButton>
                  <IconButton
                    onClick={goToVideoCall}
                    title={`video call ${selectedUser.username}`}
                  >
                    <VideoCall />
                  </IconButton>
                </div>
              </div>
              <div className="flex pt-[4rem] h-[95%] pb-[2rem] overflow-auto flex-col gap-5">
                {messages.map((message, index) => {
                  let today: number | string = date.getDate();
                  let yesterday: number | string = today - 1;
                  today = today.toString();
                  yesterday = yesterday.toString();
                  today = today.length > 1 ? today : `0${today}`;
                  yesterday =
                    yesterday.length > 1 ? yesterday : `0${yesterday}`;
                  return (
                    <div key={index} className="flex flex-col gap-3">
                      <div className="w-full sticky top-0 flex justify-center bg-[#127912] text-white py-2">
                        {message._id.split("/")[0] === today
                          ? "today"
                          : message._id.split("/")[0] === yesterday
                          ? "yesterday"
                          : message._id}
                      </div>
                      <div className="flex flex-col gap-2">
                        {message.messages.map((message, index) => {
                          let sender: User | undefined = users.find(
                            (user: User) => user._id === message.sender
                          );

                          return (
                            <div
                              className={`flex px-3 ${
                                message.sender !== User._id
                                  ? "justify-start"
                                  : "justify-end"
                              }`}
                              key={index}
                            >
                              <div className="flex border max-w-[23rem] break-words p-2 rounded-md flex-col">
                                {sender!._id !== User._id && (
                                  <Link
                                    to={`/profile/${sender!.username}`}
                                    className="flex border-b items-center"
                                  >
                                    <div
                                      className="bg-top bg-cover h-[1.5rem] w-[1.5rem] rounded-full"
                                      style={{
                                        backgroundImage: `url(${
                                          sender!.profile
                                        })`,
                                      }}
                                    ></div>
                                    <div className="font-semibold text-lg">
                                      {sender!.username}
                                    </div>
                                  </Link>
                                )}
                                <div className="">{message.message}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messageDiv}></div>
              </div>
              <form
                onSubmit={sendMessage}
                className="absolute w-full flex items-center bottom-0"
              >
                <div className="relative">
                  <InsertEmoticon
                    onClick={handleEmojiPicker}
                    style={{
                      width: "1.6rem",
                      height: "1.6rem",
                      cursor: "pointer",
                    }}
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-10">
                      <Picker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  className="w-full resize-none outline-none border h-10 p-2"
                />
                <IconButton title="send audio">
                  <Audiotrack />
                </IconButton>
                <Button type="submit" variant="contained">
                  <span>send</span>
                  <Send />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full font-semibold text-lg capitalize">
              no user selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
