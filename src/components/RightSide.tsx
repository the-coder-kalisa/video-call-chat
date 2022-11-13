import {
  AccountCircleOutlined,
  ArrowDownward,
  ArrowUpward,
  Close,
  Comment,
  Delete,
  ThumbDown,
  ThumbUp,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
} from "@mui/material";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Shake from "react-reveal/Shake";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { user } from "../atom";
import socket from "../axios";
import { Post, Comment as Commentss } from "../types";

function RightSide() {
  const postsType = ["Text", "Image(s)"];
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [spyier, setSpier] = useState<boolean>(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const User = useRecoilValue(user);
  const submit = async (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!!filesToUpload.length) {
      setLoading(true);
      const images: string[] = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const image = new FormData();
        image.append("file", filesToUpload[i]);
        image.append("upload_preset", "qhgyuqyk");
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/doubfwhsl/image/upload",
          {
            method: "post",
            body: image,
          }
        );
        const urlData: { url: string } = await res.json();
        images.push(urlData.url);
      }
      socket.emit("post", { text, images }, (response: any) => {
        setLoading(false);
        let me = document.getElementById("first") as HTMLInputElement;
        if (me.value) {
          me.value = "";
        }
        setShowPost(false);
        setFilesToUpload([]);
        setPreviews([]);
      });
    } else {
      if (!!!text.length) {
        setSpier(!spyier);
        setError("nothing to  post");
        setTimeout(() => setError(null), 5000);
        return;
      }
      socket.emit("post", { text }, (response: any) => {
        setLoading(false);
        let me = document.getElementById("first") as HTMLInputElement;
        if (me.value) {
          me.value = "";
        }
      });
    }
  };
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPost, setShowPost] = useState<boolean>(false);

  socket.off("added-post").on("added-post", (data) => {
    const postss = [data, ...posts];
    setPosts(postss);
  });
  useEffect(() => {
    socket.emit("posts", (response: any) => {
      setPosts(response);
    });
  }, []);
  socket.off("got-posts").on("got-posts", (data) => {
    setPosts(data);
  });
  socket.off("got-postss").on("got-postss", (id: string) => {
    const postIndex = posts.findIndex((value) => value._id === id);

    posts[postIndex].totalComments += 1;
    setPosts([...posts]);
    showComments(id);
    setShowCommentss(true);
  });
  const getPost = (e: ChangeEvent<HTMLInputElement>) => {
    const images: string[] = [];
    const loopInsideFiles = (): boolean | void => {
      let gotError = false;
      let files = e.target.files as unknown as MediaStream[];
      [...files].map((file: any) => {
        if(!file.type.includes("image")) {
          setError("onl images allowed");
          setSpier(!spyier);
          gotError = true;
          images.push(URL.createObjectURL(file))
          return setTimeout(() => setError(null), 5000);
        }
      });
        if (gotError) return;
        setPreviews(images);
      //   // setFilesToUpload([...filesToUpload, ...e.target.files!]);
        setShowPost(true);
    };
    loopInsideFiles();
  };
  setTimeout(() => setSpier(true), 100);
  const [info, setInfo] = useState<{ message: string; status: boolean } | null>(
    null
  );
  const likePost = (id: string) => {
    socket.emit("like_post", id, (response: string) => {
      if (response === "posted") {
        setInfo({ message: "You liked this post", status: true });
      } else if (response === "error") {
        setInfo({
          status: false,
          message: "You have already liked or unliked this post",
        });
      } else if (response === "removed the like") {
        setInfo({ status: true, message: "You removed the like on this post" });
      }
      setOpen(true);
    });
  };
  const unlikePost = (id: string) => {
    socket.emit("unlike_post", id, (response: any) => {
      if (response === "posted") {
        setInfo({ message: "You disliked this post", status: true });
      } else if (response === "error") {
        setInfo({
          status: false,
          message: "You have already liked or unliked this post",
        });
      } else if (response === "removed the unlike") {
        setInfo({
          status: true,
          message: "You removed the dislike on this post",
        });
      }
      setOpen(true);
    });
  };
  const [comment, setComment] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [showCommentss, setShowCommentss] = useState<boolean>(false);
  const postComment = (id: string) => {
    if (!!!comment.length) {
      setInfo({ status: false, message: "Enter your comment  " });
      return setOpen(true);
    }
    socket.emit("post-comment", { id, comment }, (response: any) => {
      const last = document.getElementById("last" + id) as HTMLInputElement;
      if (last) {
        last.value = "";
        setComment("");
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
  const [loader, setLoader] = useState<boolean[]>([]);
  const [loaders, setLoaders] = useState<boolean[]>([]);
  useEffect(() => {
    return () => {
      if (posts.length) {
        setLoader(posts.map(() => false));
        setLoaders(posts.map(() => false));
      }
    };
  }, [posts]);
  const [comments, setComments] = useState<
    { id: string; comments: Commentss[] }[]
  >([]);
  const showAllComments = (id: string) => {
    const postIndex = posts.findIndex((post) => post._id === id);
    loaders[postIndex] = true;
    setLoaders([...loaders]);

    socket.emit(
      "show-all-comments",
      id,
      (response: { id: string; comments: Commentss[] }) => {
        const commentIndex = comments.findIndex((comment) => comment.id === id);
        comments[commentIndex].comments = response.comments;
        setComments([...comments]);
        loaders[postIndex] = false;
        setLoaders([...loader]);
      }
    );
  };
  const showComments = (id: string) => {
    const postIndex = posts.findIndex((post) => post._id === id);
    loader[postIndex] = true;
    setLoader([...loader]);
    socket.emit(
      "show-comment",
      id,
      (response: { id: string; comments: Commentss[] }) => {
        const ids = comments.map((comment) => comment.id);
        if (ids.includes(id)) {
          const commentIndex = comments.findIndex(
            (comment) => comment.id === id
          );
          comments[commentIndex].comments = response.comments;
          setComments([...comments]);
        } else {
          setComments([...comments, response]);
          loader[postIndex] = false;
          setLoader([...loader]);
        }
      }
    );
  };
  const [showedLess, setShowedLess] = useState<string[]>([]);
  const unShowLess = (id: string, length: number) => {
    const divd = document.getElementById(id);
    if (divd) {
      divd.style.height = (length * 90).toString() + "px";
      setShowedLess(showedLess.filter((value) => value !== id));
    }
  };
  const showLess = (id: string) => {
    const divd = document.getElementById(id);
    if (divd) {
      divd.style.height = "300px";
      showedLess.push(id);
      setShowedLess([...showedLess]);
    }
  };
  console.log(previews);
  return (
    <div className="flex pb-8 flex-col gap-10">
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 ${
          showPost ? "flex" : "hidden"
        }  items-center justify-center z-50 bg-[#00000073]`}
      >
        <form onSubmit={submit} className="flex bg-white gap-3 h-[50rem]">
          <div className="flex w-[50rem] h-[50rem] overflow-auto">
            {previews.map((preview, index) => (
              <div
                key={index}
                style={{ backgroundImage: `url(${preview})` }}
                className="min-w-full min-h-full bg-top bg-cover"
              ></div>
            ))}
          </div>
          <div className="flex flex-col pb-3 pr-3 items-end  justify-between">
            <div className="w-[20rem] flex gap-5 flex-col p-3 h-full">
              <div className="text-lg font-bold">
                Enter your caption it is option
              </div>
              <textarea
                className="resize-none p-2 rounded-md min-h-[15rem] border-2 border-solid border-gray-300 outline-none"
                placeholder="caption"
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              color="warning"
            >
              {loading ? "posting" : "post"}
            </Button>
          </div>
        </form>
        <Close
          onClick={() => {
            setShowPost(false);
            setFilesToUpload([]);
            setPreviews([]);
          }}
          className="absolute right-3 top-3 cursor-pointer text-white hover:text-blue-500"
          style={{ width: 35, height: 35 }}
        />
      </div>
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
      <form onSubmit={submit} className="flex flex-col gap-5 w-[32rem]">
        <div className="font-bold text-xl">
          Post something that is in your mind
        </div>
        {error && (
          <Shake spy={spyier}>
            <Alert severity="error" className="z-0">
              {error}
            </Alert>
          </Shake>
        )}
        <div className="flex flex-col gap-3 w-full">
          <textarea
            id="first"
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something in your mind..."
            className="outline-none resize-none p-2 w-full border-2 border-solid border-gray-300 rounded-md"
          />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                id="image"
                onChange={getPost}
                hidden
                multiple
              />
              {postsType.map((type, index) =>
                index === 1 ? (
                  <label
                    htmlFor="image"
                    className={`text-lg bg-[#acbb25] text-white py-1 px-4  rounded-md flex items-center justify-center cursor-pointer`}
                    key={index}
                    title={`post ${type}`}
                  >
                    {type}
                  </label>
                ) : (
                  <Button
                    key={index}
                    disabled={loading}
                    title={`post ${type}`}
                    variant="contained"
                    style={{ background: "#b02626" }}
                    className={`text-lg  text-white py-1 px-3  rounded-full flex items-center justify-center cursor-pointer`}
                  >
                    {type}
                  </Button>
                )
              )}
            </div>
            <Button
              type="submit"
              style={{ background: "#2e1a91" }}
              variant="contained"
              title="post"
              disabled={loading}
              className="cursor-pointer text-white p-2 rounded-md"
            >
              {loading ? "posting" : "post"}
            </Button>
          </div>
        </div>
      </form>
      <div className="flex flex-col gap-5">
        {posts.map((post, index) => {
          return (
            <div
              className="flex flex-col bg-white border rounded p-2"
              key={index}
            >
              <div className="flex justify-between">
                <Link
                  to={`/profile/${post.poster.username}`}
                  className="flex  items-center gap-1"
                >
                  {post.poster.profile !== "icon" ? (
                    <div
                      style={{ backgroundImage: `url(${post.poster.profile})` }}
                      className="h-[3rem] w-[3rem] bg-top rounded-full bg-cover  "
                    ></div>
                  ) : (
                    <AccountCircleOutlined style={{ width: 30, height: 30 }} />
                  )}
                  <span>{post.poster.username}</span>
                </Link>
                <IconButton
                  style={{
                    display: post.poster._id === User._id ? "flex" : "none",
                    background: "red",
                    color: "white",
                  }}
                >
                  <Delete />
                </IconButton>
              </div>
              <div className="p-2 flex flex-col gap-2">
                {post.images.length ? (
                  <div className="flex w-[30rem] max-h-[30rem] overflow-y-hidden">
                    {post.images.map((preview, index) => {
                      return (
                        <img
                          alt="post"
                          src={preview}
                          key={index}
                          className="min-w-full h-full"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-lg p-5">{post.text}</div>
                )}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IconButton
                        title={`like ${post.poster.username}'s post`}
                        onClick={() => likePost(post._id)}
                        style={{ background: "rgb(61,61,217)", color: "white" }}
                        className="flex items-center gap-3"
                      >
                        <ThumbUp style={{ height: 15, width: 15 }} />
                      </IconButton>
                      <div className="text-xl">{post.likes.length}</div>
                    </div>
                    <div
                      onClick={() => {
                        showComments(post._id);
                        setShowCommentss(!showCommentss);
                        loader[
                          posts.findIndex((value) => value._id === post._id)
                        ] = false;
                        setLoader([...loader]);
                      }}
                      className="flex items-center gap-3 cursor-pointer py-2 px-4 rounded-md"
                    >
                      <div className="flex gap-1 items-center">
                        <Comment />
                        <div>comments</div>
                      </div>
                      <div className="text-xl">{post.totalComments}</div>
                    </div>
                    <div className="flex items-center">
                      <IconButton
                        title={`dislike ${post.poster.username}'s post`}
                        onClick={() => unlikePost(post._id)}
                        style={{
                          background: "rgb(41,176,151)",
                          color: "white",
                        }}
                        className="flex items-center gap-3"
                      >
                        <ThumbDown style={{ height: 15, width: 15 }} />
                      </IconButton>
                      <div className="text-xl">{post.unlikes.length}</div>
                    </div>
                  </div>
                  {loader.length > 0 &&
                    loader[
                      posts.findIndex((value) => value._id === post._id)
                    ] && (
                      <div className="flex items-center justify-center py-10">
                        <CircularProgress />
                      </div>
                    )}
                  {comments.length > 0 &&
                    showCommentss &&
                    comments.map(({ id, comments }, index) => {
                      return (
                        id === post._id && (
                          <div
                            key={index}
                            style={{ height: comments.length * 90 }}
                            id={post._id}
                            className="flex  relative transition-all duration-[800ms] overflow-hidden flex-col gap-5"
                          >
                            {comments.map((comment, index) => (
                              <div className="flex flex-col gap-2" key={index}>
                                <Link
                                  to={`/profile/${comment.poster.username}`}
                                  className="flex items-center gap-1"
                                >
                                  {comment.poster.profile !== "icon" ? (
                                    <div
                                      style={{
                                        backgroundImage: `url(${comment.poster.profile})`,
                                      }}
                                      className="h-[3rem] w-[3rem] bg-top rounded-full bg-cover  "
                                    ></div>
                                  ) : (
                                    <AccountCircleOutlined
                                      style={{ width: 30, height: 30 }}
                                    />
                                  )}
                                  <span>{comment.poster.username}</span>
                                </Link>
                                <div>{comment.comment}</div>
                              </div>
                            ))}
                            {loaders.length > 0 &&
                              loaders[
                                posts.findIndex(
                                  (value) => value._id === post._id
                                )
                              ] && (
                                <div className="flex items-center justify-center py-10">
                                  <CircularProgress />
                                </div>
                              )}

                            <div className="absolute -bottom-[0.6rem] my-2 left-[35%]">
                              {comments.length === 4 ? (
                                <Button
                                  variant="contained"
                                  onClick={() => showAllComments(post._id)}
                                >
                                  <span>show more</span>
                                  <ArrowDownward />
                                </Button>
                              ) : comments.length > 4 ? (
                                showedLess.includes(post._id) ? (
                                  <Button
                                    variant="contained"
                                    onClick={() =>
                                      unShowLess(post._id, comments.length)
                                    }
                                  >
                                    <span>show more</span>
                                    <ArrowDownward />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="contained"
                                    onClick={() => showLess(post._id)}
                                  >
                                    <span>show less</span>
                                    <ArrowUpward />
                                  </Button>
                                )
                              ) : (
                                <div></div>
                              )}
                            </div>
                          </div>
                        )
                      );
                    })}
                  <div className="flex flex-col items-end gap-3">
                    <textarea
                      onChange={(e) => {
                        setComment(e.target.value);
                      }}
                      id={"last" + post._id}
                      placeholder="Enter your comment..."
                      className="w-full resize-none border p-2 rounded-md h-[4rem] outline-none"
                    />
                    <Button
                      title={`comment on ${post.poster.username}'s post`}
                      onClick={() => postComment(post._id)}
                      variant="contained"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RightSide;
