import { FC, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { selectedNav } from "./atom";
import LeftSide from "./components/LeftSide";
import Navigation from "./components/Navigation";
import RightSide from "./components/RightSide";

const App: FC = () => {
  const setSelectedNav = useSetRecoilState(selectedNav)
  useEffect(() => {
    return () => {
      setSelectedNav("home")
    }
  },[])
  return (
    <div>
      <Navigation />
      <div className="flex justify-center w-full pt-32">
        <LeftSide />
        <RightSide /> 
      </div>
    </div>
  );
};
export default App;
