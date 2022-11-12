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
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { selectedNav, user, Users } from "./atom";
import Navigation from "./components/Navigation";
import { User } from "./types";
import socket from "./axios";
import Peer, { SignalData } from "simple-peer";
function Chat() {
  const setSelectedNav = useSetRecoilState(selectedNav);
  const users = useRecoilValue(Users);
  const User = useRecoilValue<User>(user);
  interface Call {
    caller: string;
    receive?: string;
    duration?: string;
    missed: boolean;
    joins?: string[];
    calledAt: string;
    room: string;
    _id: string;
  }
  const [calls, setCalls] = useState<Call[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  useEffect(() => {
    setSelectedNav("message");
    if (User._id) {
      socket.emit("get-calls", User._id, (calls: Call[]) => {
        let somecalls = calls.map((call) =>
          !call.duration
            ? { ...call, missed: true }
            : { ...call, missed: false }
        );
        setCalls([...somecalls]);
      });
    }
  }, [User._id]);
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
  const callerVideo = useRef<HTMLVideoElement | null>(null);
  const [currentCalls, setCurrentCalls] = useState<
    { signal: SignalData | string; callId: string }[]
  >([]);
  socket
    .off("calling-room")
    .on(
      "calling-room",
      (data: { newCall: Call; signal: SignalData | string }) => {
        setCallEnded(false);
        setCalls([{ ...data.newCall, missed: false }, ...calls]);
        setCurrentCalls([
          ...currentCalls,
          { signal: data.signal, callId: data.newCall._id },
        ]);
        setCurrentCallId(data.newCall._id);
      }
    );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string>();
  const [duration, setDuration] = useState<number>(0);
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
            socket.emit(
              "call-user",
              {
                userToCall: selectedUser?._id,
                signalData: data,
                room: order_ids(User._id!, selectedUser?._id!),
                from: User._id,
              },
              (callId: string) => {
                setCurrentCallId(callId);
                setTimeout(() => {
                  if (!callAccepted) {
                    console.log("call-not-accepted");
                    socket.emit("missed-call", {
                      callId,
                      from: contact || selectedUser?._id,
                      to: User._id,
                    });
                  }
                }, 60000);
              }
            );
          });
          peer.on("stream", (currentStream) => {
            if (userVideo.current) {
              userVideo.current.srcObject = currentStream;
            }
          });

          socket.on("call-accepted", ({ signal, updatedCall }) => {
            console.log(updatedCall);
            setCallAppected(true);
            peer.signal(signal);
            if (connnectionRef.current) connnectionRef.current = peer;
          });
        }
      });
  };
  socket.off("call-missed").on("call-missed", (callId: string) => {
    setCallEnded(true);
    setCallAppected(false);
    setStream(null);
    setOpen(false);
    if (connnectionRef.current) connnectionRef.current.destroy();
    if (userVideo.current) userVideo.current.srcObject = null;
    if (callerVideo.current) callerVideo.current.srcObject = null;
    setCalls((calls: Call[]) => {
      let someCalls = [...calls];
      let index = someCalls.findIndex((value) => value._id === callId);
      someCalls[index].missed = true;
      return someCalls;
    });
  });
  const [callAccepted, setCallAppected] = useState<boolean>(false);
  const [callEnded, setCallEnded] = useState<boolean>(false);
  socket.off("immed-hang-up").on("immed-hang-up", (data) => {
    console.log(data);
  });
  useEffect(() => {
    if (callAccepted) {
      setInterval(() => {
        setDuration((duration) => duration + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
  }, [callAccepted]);

  const [contact, setContact] = useState<string | null>(null);
  const answerCall = (id: string, from: string) => {
    setOpen(true);
    setContact(from);
    setCallAppected(true);
    setCallEnded(false);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (callerVideo.current) {
          callerVideo.current.srcObject = stream;
        }
        setStream(stream);
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on("signal", (data) => {
          socket.emit("answer-call", { signal: data, to: from, callId: id });
          setOnCall(true);
        });
        peer.on("stream", (currentStream) => {
          if (userVideo.current) userVideo.current.srcObject = currentStream;
        });
        peer.signal(
          currentCalls?.find((value) => value.callId === id)?.signal!
        );
        if (connnectionRef.current) connnectionRef.current = peer;
      });
  };
  const [onCall, setOnCall] = useState<boolean>(false);
  socket.off("call-ended").on("call-ended", (updatedCall: Call) => {
    setOpen(false);
    setCallEnded(true);
    console.log(updatedCall);
    stream?.getTracks().forEach((track) => track.stop());
    if (connnectionRef.current) connnectionRef.current.destroy();
    // updated call inside the call array
    setCalls((calls: Call[]) => {
      let someCalls = [...calls];
      let index = calls.findIndex((value) => value._id === updatedCall._id);
      someCalls[index] = updatedCall;
      return someCalls;
    });
  });
  const leaveCall = () => {
    setOpen(false);
    setCallAppected(false);
    stream?.getTracks().forEach((track) => track.stop());
    if (connnectionRef.current) connnectionRef.current.destroy();
    socket.emit(
      "end-call",
      {
        room: order_ids(contact || selectedUser?._id!, User._id!),
        duration,
        from: User!._id,
        to: contact || selectedUser?._id!,
        callId: currentCallId,
      },
      () => {
        setCallEnded(true);
      }
    );
  };
  const hangup = (id: string, from: string) => {
    socket.emit("immed-hang-up", from);
  };
  function convertHMS(value: string) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours: any = Math.floor(sec / 3600); // get hours
    let minutes: any = Math.floor((sec - hours * 3600) / 60); // get minutes
    let seconds: any = sec - hours * 3600 - minutes * 60; //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds; // Return is HH : MM : SS
  }
  const getDiff = (date: string): string => {
    const now = new Date() as unknown as number;
    const then = new Date(date) as unknown as number;
    const diff = now - then;
    const diffInSec = diff / 1000;
    const seconds = Math.floor(diffInSec % 60);
    const minutes = Math.floor(diffInSec / 60) % 60;
    const hours = Math.floor(diffInSec / 3600);
    const days = Math.floor(diffInSec / 3600 / 24);
    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };
  return (
    <div>
      <Navigation />
      <Backdrop
        className="z-50 relative bg-[#00000085] flex items-center justify-center"
        open={open}
      >
        <div
          onClick={() => {
            if (onCall) {
              leaveCall();
            } else {
              setCallEnded(true);
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
            <div className="font-bold text-2xl text-white">
              {convertHMS(duration.toString())}
            </div>
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
          {calls.length > 0 && (
            <div className="flex flex-col overflow-auto p-2 gap-4">
              {calls.map((call) => {
                let userTouse = users.find(
                  (user: User) => user._id !== User._id
                ) as unknown as User;
                let date = new Date();
                return (
                  <div
                    key={call._id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      {userTouse.profile === "icon" ? (
                        <AccountCircleOutlined
                          style={{ width: 45, height: 45 }}
                        />
                      ) : (
                        <div
                          style={{ background: `url("${userTouse.profile})` }}
                        ></div>
                      )}
                      <div className="flex flex-col">
                        <div className="font-semibold">
                          {call.caller === User._id ? (
                            call.duration ? (
                              <div>
                                you called{" "}
                                <Link to={`/profile/${userTouse.username}`}>
                                  {userTouse.username}
                                </Link>{" "}
                              </div>
                            ) : (
                              <div>
                                <Link to={`/profile/${userTouse.username}`}>
                                  {userTouse.username}
                                </Link>{" "}
                                missed your call
                              </div>
                            )
                          ) : call.duration ? (
                            <div>
                              <Link to={`/profile/${userTouse.username}`}>
                                {userTouse.username}
                              </Link>{" "}
                              called you
                            </div>
                          ) : (
                            <div>
                              you missed call from{" "}
                              <Link to={`/profile/${userTouse.username}`}>
                                {userTouse.username}
                              </Link>
                            </div>
                          )}
                        </div>
                        {call.duration ? (
                          <div>{convertHMS(call.duration)}</div>
                        ) : call.missed ? (
                          <div>missed</div>
                        ) : (
                          <div className="flex items-start gap-1 flex-col">
                            <Button
                              style={{
                                padding: 2,
                                fontSize: 12,
                                fontWeight: 400,
                              }}
                              variant="contained"
                              onClick={() => answerCall(call._id, call.caller)}
                            >
                              Answer
                            </Button>
                            <Button
                              style={{
                                padding: 2,
                                fontSize: 12,
                                fontWeight: 400,
                              }}
                              variant="contained"
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>{getDiff(call.calledAt)}</div>
                  </div>
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
                              <div className="flex max-w-[23rem] gap-1 flex-col text-lg break-words">
                                {sender!._id !== User._id && (
                                  <Link
                                    to={`/profile/${sender!.username}`}
                                    className="items-center gap-1 flex"
                                  >
                                    {sender!.profile !== "icon" ? (
                                      <div
                                        style={{
                                          background: `url("${
                                            sender!.profile
                                          }")`,
                                        }}
                                      ></div>
                                    ) : (
                                      <AccountCircleOutlined
                                        sx={{ height: 30, width: 30 }}
                                      />
                                    )}
                                    <div className="font-semibold">
                                      {sender!.username}
                                    </div>
                                  </Link>
                                )}
                                <div className="rounded-md border py-1 px-2">
                                  {message.message}
                                </div>
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
