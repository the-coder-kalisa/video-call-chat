import { Alert, Button, LinearProgress } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shake from "react-reveal/Shake";
function Forgot() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const inputs = ["Email or username"];
  const [values, setValues] = useState<{
    email: string;
  } | null>(null);
  const validation = async (): Promise<string | boolean> => {
    if (!values?.email) return "Enter your email or username";
    return true;
  };
  const [shakes, setShakes] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setShakes(!shakes);
    }, 2);
  }, [error, shakes]);
  const [loading, setLoading] = useState<boolean>(false);
  const formSubmit = async (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      const validated = await validation();
      if (typeof validated === "boolean") {
        setLoading(true);
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
        <h1 className="text-white text-xl font-semibold">
          Forgot your password
        </h1>
        {error && (
          <Shake spy={shakes}>
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
                  [input === "Email..." ? "email" : input.toLocaleLowerCase()]:
                    e.target.value,
                });
              }}
              key={index}
              placeholder={input}
            />
          </div>
        ))}
        <Button variant="contained" type="submit">
          Send Link
        </Button>

        <div className="text-white items-end w-full flex flex-col">
          <div>

          <Link to="/signup" className=" text-[#0f0f46] hover:text-[#20207e]">
            signup
          </Link>
          <Link to="/login" className=" text-[#0f0f44] hover:text-[#20207e]">
            login
          </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Forgot;
