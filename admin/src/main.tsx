
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router"
import './index.css'
import App from './App'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Account from './pages/Account'
import Orders from './pages/Orders'
import Invoices from './pages/Invoices'
import Products from './pages/Products'
import Banners from './pages/Banners'
import Categories from './pages/Categories'
import Brands from './pages/Brands'
import UsersPage from './pages/Users'
import Product_Types from './pages/Producttypes'
import Addresses from './pages/Addresses'
import AdsBanners from './pages/AdsBanners'


const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/account",
        element: <Account />,
      },
      {
        path: "/dashboard/users",
        element: <UsersPage />
      },
      {
        path: "/dashboard/orders",
        element: <Orders />
      },
      {
        path: "/dashboard/invoices",
        element: <Invoices />
      },
      {
        path: "/dashboard/products",
        element: <Products />
      },
      {
        path: "/dashboard/banners",
        element: <Banners />
      },
      {
        path: "/dashboard/categories",
        element: <Categories />
      },
      {
        path: "/dashboard/brands",
        element: <Brands />
      },
      {
        path: "/dashboard/product-types",
        element: <Product_Types />
      },
      {
        path: "/dashboard/addresses",
        element: <Addresses />
      },
      {
        path: "/dashboard/ads-banners",
        element: <AdsBanners />
      }
    ],
  },

]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
