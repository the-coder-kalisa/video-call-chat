import { atom, RecoilState } from "recoil";
import { User as User } from "./types";
export const selectedNav: RecoilState<string> = atom({
  key: "sectedNav",
  default: "home",
});
export const Users: RecoilState<never[]> = atom({
  key: "users",
  default: [],
});
export const user: RecoilState<any> = atom({
  key: "user",
  default: {},
});
export const logedIn: RecoilState<boolean> = atom({
  key: "logedIn",
  default: false,
});
