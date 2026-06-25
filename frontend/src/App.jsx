import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";
import EventDetails from "./admin/EventDetails";
import ClientFavorites from "./admin/ClientFavorites";
import ClientAuth from "./gallery/ClientAuth";
import Gallery from "./gallery/Gallery";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/events/:id" element={<EventDetails />} />
        <Route path="/admin/clients/:clientId/favorites" element={<ClientFavorites />} />
        <Route path="/event/:eventId" element={<ClientAuth />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}
