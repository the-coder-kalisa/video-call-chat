import { Alert, Button, LinearProgress } from "@mui/material";
import { AxiosResponse } from "axios";
import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shake from "react-reveal/Shake";
import axios from "./axios";
function Forgot() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const inputs = ["Email or username", "Password"];
  const [values, setValues] = useState<{
    email_username: string;
    password: string;
  } | null>(null);
  const validation = async (): Promise<string | boolean> => {
    if (!values?.email_username) return "Enter your email or username";
    if (!values.password) return "Enter your password";
    return true;
  };
  const [shakes, setShakes] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setShakes(!shakes);
    }, 2);
  }, [error]);
  const [loading, setLoading] = useState<boolean>(false);
  const formSubmit = async (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      const validated = await validation();
      if (typeof validated === "boolean") {
        setLoading(true);
        const { email_username, password } = values!;
        // post
        // localStorage.setItem("token", token);
        navigate("/");
        setLoading(false);
      } else {
        setShakes(!shakes);
        setError(validated);
      }
    } catch (err: any) {
      setLoading(false);
      setShakes(!shakes);
      setError(err.response.data);
    }
  };
  return (
    <div className="flex items-center w-full h-screen justify-center">
      <form
        onSubmit={formSubmit}
        className="bg-blue-900 w-[27rem] relative flex flex-col gap-6 rounded-md items-center p-10"
      >
        {loading && (
          <div className="bg-[#0000ff5e] flex flex-col justify-between absolute top-0 z-50 w-full h-full">
            <LinearProgress />
            <LinearProgress />
          </div>
        )}
        <h1 className="text-white text-xl font-semibold">Login to coders</h1>
        {error && (
          <Shake spy={shakes}>
            {" "}
            <Alert severity="error" className="w-[20rem]">
              {error}
            </Alert>
          </Shake>
        )}
        {inputs.map((input, index) => (
          <div key={index}>
            <input
              className="outline-none border-none w-[20rem] p-3 rounded-md"
              type="text"
              onChange={(e) => {
                setValues({
                  ...values!,
                  [input === "Email or username"
                    ? "email_username"
                    : input.toLocaleLowerCase()]: e.target.value,
                });
              }}
              key={index}
              placeholder={input}
            />
          </div>
        ))}
        <Button variant="contained" type="submit">
          Login
        </Button>
        <Link
          to="/forgot"
          className="text-white hover:text-blue-400 cursor-pointer"
        >
          Forgot Password?
        </Link>
        <div className="text-white">
          Don't have an account{" "}
          <Link to="/signup" className=" text-[#2ce253] hover:text-blue-400">
            signup
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Forgot;
