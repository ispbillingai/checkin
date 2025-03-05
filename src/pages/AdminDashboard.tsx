
import { useEffect } from "react";
import { Helmet } from "react-helmet";

const AdminDashboard = () => {
  useEffect(() => {
    // Load the required scripts for the admin dashboard
    const loadScript = (src: string) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      return script;
    };

    // Reference to the scripts we're adding
    const scripts: HTMLScriptElement[] = [];

    // Load admin scripts in order
    scripts.push(loadScript("/js/admin-utils.js"));
    scripts.push(loadScript("/js/admin-sidebar.js"));
    scripts.push(loadScript("/js/admin-bookings.js"));
    scripts.push(loadScript("/js/admin-passcodes.js"));
    scripts.push(loadScript("/js/admin-database.js"));

    // Flatpickr for date picking
    const flatpickrCSS = document.createElement('link');
    flatpickrCSS.rel = 'stylesheet';
    flatpickrCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css';
    document.head.appendChild(flatpickrCSS);
    
    const flatpickrScript = document.createElement('script');
    flatpickrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js';
    document.body.appendChild(flatpickrScript);
    scripts.push(flatpickrScript);

    // Cleanup function
    return () => {
      scripts.forEach(script => {
        script.remove();
      });
      flatpickrCSS.remove();
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Booking System</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="flex w-full min-h-screen">
          {/* Sidebar */}
          <aside id="sidebar" className="border-r bg-background transition-all duration-300 ease-in-out w-64">
            <div className="flex flex-col h-full">
              <div className="sidebar-content flex-1 overflow-auto py-2">
                {/* Management section */}
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500">Management</div>
                  <div className="py-1">
                    <ul className="grid gap-1 px-2">
                      <li>
                        <button 
                          className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium bg-blue-100 text-blue-600" 
                          data-section="bookings">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                          <span>Bookings</span>
                        </button>
                      </li>
                      <li>
                        <button 
                          className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100" 
                          data-section="passcodes">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span>Room Passcodes</span>
                        </button>
                      </li>
                      <li>
                        <button 
                          className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100" 
                          data-section="database">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                          <span>Database Schema</span>
                        </button>
                      </li>
                      <li>
                        <button className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100" 
                          data-section="rooms">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Manage Rooms</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Notification section */}
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500">Notification</div>
                  <div className="py-1">
                    <ul className="grid gap-1 px-2">
                      <li>
                        <button className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100"
                          data-section="email-templates">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Email Templates</span>
                        </button>
                      </li>
                      <li>
                        <button className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100"
                          data-section="sms-templates">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>SMS Templates</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* System section */}
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500">System</div>
                  <div className="py-1">
                    <ul className="grid gap-1 px-2">
                      <li>
                        <button className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>Users</span>
                        </button>
                      </li>
                      <li>
                        <button className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="p-4 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <button id="sidebarToggle" className="p-2 rounded-md hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-2xl font-medium">Admin Dashboard</h1>
                </div>
                <a href="/" className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Sign Out
                </a>
              </div>
              
              {/* Content sections */}
              <div className="max-w-7xl mx-auto">
                {/* Bookings section */}
                <div id="bookingsSection" className="section-content">
                  {/* Content will be loaded here by JavaScript */}
                </div>
                
                {/* Passcodes section (hidden by default) */}
                <div id="passcodesSection" className="section-content hidden">
                  {/* Content will be loaded here by JavaScript */}
                </div>
                
                {/* Database section (hidden by default) */}
                <div id="databaseSection" className="section-content hidden">
                  {/* Content will be loaded here by JavaScript */}
                </div>

                {/* Rooms section (hidden by default) */}
                <div id="roomsSection" className="section-content hidden">
                  {/* Content will be loaded here by JavaScript */}
                </div>

                {/* Email Templates section (hidden by default) */}
                <div id="email-templatesSection" className="section-content hidden">
                  {/* Content will be loaded here by JavaScript */}
                </div>

                {/* SMS Templates section (hidden by default) */}
                <div id="sms-templatesSection" className="section-content hidden">
                  {/* Content will be loaded here by JavaScript */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates for section content */}
        <div id="templates" className="hidden">
          {/* Templates will be here but are hidden */}
        </div>

        {/* Toast message for notifications */}
        <div id="toast" className="fixed top-4 right-4 z-50 transform translate-x-full transition-transform duration-300 ease-in-out">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-start max-w-xs">
            <div id="toastIcon" className="flex-shrink-0 w-5 h-5 mr-3"></div>
            <div>
              <p id="toastTitle" className="font-medium text-gray-900 text-sm"></p>
              <p id="toastMessage" className="text-sm text-gray-500 mt-1"></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
