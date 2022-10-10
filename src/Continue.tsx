import { AccountCircle, Add } from "@mui/icons-material";
import { Alert, Button, CircularProgress } from "@mui/material";
import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import socket from "./axios";
import { useNavigate } from "react-router-dom";
const Continue: FC = () => {
  const showImage = (url: string) => {
    return (
      <div
        style={{ backgroundImage: `url(${url})` }}
        className="h-[10rem] w-[10rem] bg-cover rounded-full"
      ></div>
    );
  };
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const token = useSearchParams()[0].get("token");
  const [loadings, setLoadings] = useState<boolean>(true);
  useEffect(() => {
    setLoadings(true);
    socket.emit(
      "create-user",
      token,
      (response: {
        status: boolean;
        message: string;
        token: string;
        username: string;
      }) => {
        setLoadings(false);
        if (!response.status) {
          setError(response.message);
        } else {
          localStorage.setItem("token", response.token);
          setUsername(response.username);
        }
      }
    );
  }, []);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formSubmit = async (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    setLoading(true);
    const image = new FormData();
    image.append("file", fileToUpload![0]);
    image.append("upload_preset", "qhgyuqyk");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/doubfwhsl/image/upload",
      {
        method: "post",
        body: image,
      }
    );
    const urlData: { url: string } = await res.json();
    socket.emit(
      "update",
      { profile: urlData.url, username, updater: "username" },
      (response: any) => {
        if (response === "updated") {
          navigate("/");
        } else {
          setError(response);
        }
        setLoading(false);
      }
    );
  };
  const [fileToUpload, setFileToUpload] = useState<FileList | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImagePreview(URL.createObjectURL(e.target.files![0]));
    setFileToUpload(e.target.files);
  };
  return (
    <div className="flex items-center w-full h-screen justify-center">
      {loadings ? (
        <CircularProgress />
      ) : (
        <>
          {error ? (
            <Alert severity="error" style={{ width: 300 }}>
              {error === "jwt expired"
                ? "link has been expired.. too late"
                : error.includes("E11000")
                ? "you have already initialized account"
                : error}
            </Alert>
          ) : (
            <form onSubmit={formSubmit} className="flex flex-col items-center ">
              <div className="relative">
                {imagePreview ? (
                  showImage(imagePreview)
                ) : (
                  <AccountCircle style={{ width: 100, height: 100 }} />
                )}
                <label
                  htmlFor="image"
                  className="bg-[#2db60b] absolute text-white cursor-pointer rounded-full right-[1rem] bottom-1"
                >
                  <input
                    onChange={fileChange}
                    hidden
                    type="file"
                    accept="image/*"
                    id="image"
                  />
                  <Add />
                </label>
              </div>
              {fileToUpload && (
                <Button
                  type="submit"
                  variant="contained"
                  style={{ marginTop: 10 }}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </Button>
              )}
              {username && <div className="text-xl font-bold">{username}</div>}
              <div className="my-2 text-lg">Enter your profile picture</div>
              <Link to="/">
                <Button
                  disabled={loading}
                  variant="contained"
                  style={{ marginTop: 10 }}
                >
                  Skip for now
                </Button>
              </Link>
            </form>
          )}
        </>
      )}
    </div>
  );
};
export default Continue;
