
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Loading from "./components/Loading";

// Lazy loaded pages for better performance
const Login = lazy(() => import("./pages/Login"));
const BookingForm = lazy(() => import("./pages/BookingForm"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Log when the application is initialized
console.log("Initializing React application");

const App = () => {
  useEffect(() => {
    console.log("App component rendered");
    
    // Log user agent and device information
    console.log("User Agent:", navigator.userAgent);
    console.log("Window Size:", window.innerWidth, "x", window.innerHeight);
    
    // Check if we're on a route that should redirect to HTML
    const path = window.location.pathname;
    if (path === "/booking" || path === "/admin") {
      console.log("Redirecting to HTML version of:", path);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/booking" element={<Navigate to="/src/pages/BookingForm.html" />} />
              <Route path="/admin" element={<Navigate to="/admin-dashboard.html" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
