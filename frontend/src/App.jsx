import { Routes, Route } from "react-router-dom";
import Home from "../pages/main/index.jsx";
import OAuthCallback from "../pages/oauth/callback.jsx";
import PodDetail from "../pages/podDetail/index.jsx";
import LoginPage from "../pages/login/index.jsx";
import MyPage from "../pages/myPage/index.jsx";
import LayoutWrapper from "./components/common/layout/LayoutWrapper.jsx";
import RequireAuth from "./components/common/layout/auth/index.jsx";
import SearchPage from "../pages/search/index.jsx";
import MyPods from "../pages/myPods/index.jsx";


export default function App() {
  return (
    <div className="flex min-h-screen">
      <Routes>
        <Route path="/" element={<RequireAuth><Home/></RequireAuth>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/search" element={<SearchPage/>} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/myPage" element={<RequireAuth><MyPage/></RequireAuth>} />
        <Route path="/myPods" element={<RequireAuth><MyPods/></RequireAuth>} />
        <Route path="/podDetail/:podId" element={
          <RequireAuth>
            <PodDetail />
          </RequireAuth>
        } />
      </Routes>
    </div>
  );
}

