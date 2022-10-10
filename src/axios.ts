import { io } from "socket.io-client";
export const baseURL = "https://video-callf.herokuapp.com";
export default io(baseURL);