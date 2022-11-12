import { io } from "socket.io-client";
const client = "https://video-callf.herokuapp.com";
export const baseURL = "http://localhost:5000";
export default io(baseURL);
