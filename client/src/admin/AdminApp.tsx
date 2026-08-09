import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { AdminLogin } from "./AdminLogin";
import { AdminShell } from "./AdminShell";
import { AdminDashboard } from "./AdminDashboard";
import { AdminCollections } from "./AdminCollections";
import { AdminSubscribers } from "./AdminSubscribers";

function ProtectedAdmin() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-ink text-sm text-mute">
        Loading...
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<AdminDashboard />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="subscribers" element={<AdminSubscribers />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export function AdminApp() {
  return <ProtectedAdmin />;
}
