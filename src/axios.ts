import { io } from "socket.io-client";
// https://video-callf.herokuapp.com
export const baseURL = "http://localhost:3597";
export default io(baseURL);
