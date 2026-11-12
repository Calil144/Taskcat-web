import { Outlet } from "react-router-dom";
import "./Mainlayout.css";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
