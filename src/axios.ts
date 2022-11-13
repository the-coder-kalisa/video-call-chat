import { io } from "socket.io-client";
const client = "https://video-callf.herokuapp.com";
export const baseURL = client;
export default io(baseURL);
