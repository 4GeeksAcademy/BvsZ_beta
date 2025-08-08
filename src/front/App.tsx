import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./hooks/useGlobalReducer";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import BackendTest from "./pages/BackendTest";
import NotFound from "./pages/NotFound";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useRef, useState, useEffect } from 'react';
import ResetPasswordWithCode from "./pages/ResetPasswordWithCode";
import VerifyAccount from "./pages/VerifyAccount";


const queryClient = new QueryClient();   

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password-code" element={<ResetPasswordWithCode />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/backend-test" element={<BackendTest />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </QueryClientProvider>
);

export default App;
