import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import UsersList from "./pages/users/UsersList";

import UserDetails from "./pages/users/UserDetails";
import Login from "./pages/auth/Login";
import PrivateRoute from "./components/PrivateRoute";

import ProductList from "./pages/products/ProductList";

import Categories from "./pages/categories/Categories";
import "react-toastify/dist/ReactToastify.css";
import Settings from "./pages/settings/Settings";
// import ProductDetails from "./pages/products/ProductDetails";
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Summary from "./pages/summary/Summary";
import Unauthorized from "./components/Unauthorized";

function App() {
  const { adminUserInfo } = useSelector((state: any) => state.auth);

  return (
    <Routes>
      {/* Root route redirects based on login status */}
      <Route
        path="/"
        element={
          adminUserInfo ? <Navigate to="/productlist" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Login page */}
      <Route path="/login" element={adminUserInfo ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forget-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Admin routes */}
      <Route path="/summary" element={<PrivateRoute element={<Summary />} />} />
      {/* <Route path="/admin" element={<PrivateRoute element={<Order />} />} /> */}
      {/* <Route path="/admin/orders/:orderId" element={<PrivateRoute element={<OrderDetails />} />} /> */}
      <Route path="/userlist" element={<PrivateRoute element={<UsersList />} />} />
      <Route path="/userlist/:userID" element={<PrivateRoute element={<UserDetails />} />} />
      {/* <Route path="/admin/delivery" element={<PrivateRoute element={<Delivery />} />} /> */}
      <Route path="/productlist" element={<PrivateRoute element={<ProductList />} />} />

      {/* <Route path="/admin/discounts" element={<PrivateRoute element={<Discounts />} />} /> */}
      <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
      <Route path="/categories" element={<PrivateRoute element={<Categories />} />} />
    </Routes>
  );
}

export default App;
