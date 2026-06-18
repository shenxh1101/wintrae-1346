import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import CourseDetail from "@/pages/CourseDetail";
import Workout from "@/pages/Workout";
import Family from "@/pages/Family";
import History from "@/pages/History";

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/workout/');

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/workout/:id" element={<Workout />} />
        <Route path="/family" element={<Family />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
