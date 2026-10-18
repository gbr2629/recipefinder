import { Routes, Route, Outlet } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeDetails from './pages/RecipeDetails';
import Favourites from './pages/Favourites';
import RandomRecipe from './pages/RandomRecipe';
import Categories from './pages/Categories';
import FoodType from './pages/FoodType';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';

import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageRecipes from './pages/admin/ManageRecipes';
import ManageReviews from './pages/admin/ManageReviews';
import ManageUsers from './pages/admin/ManageUsers';

function Layout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </>
  );
}

function NotFound() {
  return <p className="text-muted">Page not found.</p>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:name" element={<Categories />} />
        <Route path="/food/:type" element={<FoodType />} />
        <Route path="/random" element={<RandomRecipe />} />
        <Route path="/search" element={<SearchResults />} />

        <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/recipes" element={<ProtectedRoute adminOnly><ManageRecipes /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><ManageReviews /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}