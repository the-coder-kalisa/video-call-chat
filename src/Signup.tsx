import { Alert, Button, CircularProgress, LinearProgress } from "@mui/material";
import { AxiosResponse } from "axios";
import { FC, FormEvent, useEffect, useState } from "react";
import Shake from "react-reveal/Shake";
import axios from "axios";
import { Link } from "react-router-dom";
import { baseURL } from "./axios";
const Signup: FC = () => {
  const [error, setError] = useState<string | null>(null);
  const inputs = [
    "Fullname",
    "Email",
    "Username",
    "Password",
    "Confirm Password",
  ];
  const [values, setValues] = useState<{
    email: string;
    fullname: string;
    username: string;
    password: string;
    confirm_password: string;
  } | null>(null);
  const validation = async (): Promise<string | boolean> => {
    if (!values?.fullname) return "Enter your fullname";
    if (values.fullname.length <= 4 || values.fullname.length >= 30)
      return "fullname must be greater than 4 and less than 30 chars";
    if (!values?.email) return "Enter your email";
    if (!/[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim.test(values.email))
      return "Enter valid email address";
    if (!values.username) return "Enter your username";
    if (values.username.length <= 3 || values.username.length >= 20)
      return "username must be greater than 3 and less than 20 chars";
    if (!values.password) return "Enter your password";
    if (!values.confirm_password || values.password !== values.confirm_password)
      return "Confirm your password";
    return true;
  };
  const [change, setChange] = useState<boolean>(false);
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
        await (
          await axios.post<any, AxiosResponse<Promise<string>>, any>(
            baseURL + "/auth/signup",
            values
          )
        ).data;
        setLoading(false);
        setChange(true);
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
        {change ? (
          <>
            <div className="text-white">
              go and check your email and confirm
            </div>
            <Button variant="contained" onClick={() => setChange(false)}>
              Back to signup
            </Button>
          </>
        ) : (
          <>
            {loading && (
              <div className="bg-[#0000ff5e] flex flex-col justify-between absolute top-0 z-50 w-full h-full">
                <LinearProgress />
                <LinearProgress />
              </div>
            )}
            <h1 className="text-white text-xl font-semibold">
              Signup to coders
            </h1>
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
                      [input === "Confirm Password"
                        ? "confirm_password"
                        : input.toLocaleLowerCase()]: e.target.value,
                    });
                  }}
                  key={index}
                  placeholder={input}
                />
              </div>
            ))}
            <Button variant="contained" type="submit">
              Signup
            </Button>
            <div className="text-white">
              Already have an account{" "}
              <Link to="/login" className=" text-[#2ce253] hover:text-blue-400">
                login
              </Link>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
export default Signup;
