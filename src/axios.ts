import { io } from "socket.io-client";
export const baseURL = "https://video-call-the-coder.herokuapp.com";
export default io(baseURL);