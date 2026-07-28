import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useHandleCurrentLoggedInUserQuery } from '../features/auth/authApi'

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state?.auth);
  const { data: userInfo, isLoading } = useHandleCurrentLoggedInUserQuery();

  if (isLoading) {
    return <div>Loading....</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'VENDOR' || userInfo?.data?.role === 'VENDOR') {
    return <Navigate to="/shop-overview" replace />;
  }

  if (user?.role === 'ADMIN' || userInfo?.data?.role === 'ADMIN') {
    return children ?? <Outlet />;
  }
  return <Navigate to="/shop-overview" replace />;
};

export default AdminRoute;
