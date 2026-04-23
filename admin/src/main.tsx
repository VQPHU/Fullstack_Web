
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
import Reviews from './pages/Reviews'
import Notifications from './pages/Notifications'
import Employees from './pages/Employees'
import Salaries from './pages/Salaries'
import SocialMedia from './pages/SocialMedia'
import WebsiteConfig from './pages/WebsiteConfig'
import WebsiteIcons from './pages/WebsiteIcons'
import ComponentTypes from './pages/ComponentTypes'


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
      },
      {
        path: "/dashboard/reviews",
        element: <Reviews />
      },
      {
        path: "/dashboard/notifications",
        element: <Notifications />
      },
      {
        path: "/dashboard/employees",
        element: <Employees />
      },
      {
        path: "/dashboard/salaries",
        element: <Salaries />
      },
      {
        path: "dashboard/social-media",
        element: <SocialMedia />
      },
      {
        path: "dashboard/website-config",
        element: <WebsiteConfig />
      },
      {
        path: "dashboard/website-icons",
        element: <WebsiteIcons />
      },
      {path: "/dashboard/component-types",
        element: <ComponentTypes />
      }
    ],
  },

]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
