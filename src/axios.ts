import { io } from "socket.io-client";
export const baseURL = "http://localhost:3597";
export default io(baseURL);