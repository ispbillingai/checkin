
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        mainPage: path.resolve(__dirname, 'src/main.html'),
        booking: path.resolve(__dirname, 'src/pages/BookingForm.html'),
        admin: path.resolve(__dirname, 'src/pages/AdminDashboard.html'),
        notFound: path.resolve(__dirname, 'src/pages/NotFound.html'),
        error: path.resolve(__dirname, 'src/pages/error.html'),
        // Template files
        sidebarTemplate: path.resolve(__dirname, 'src/pages/templates/sidebar-template.html'),
        bookingsTemplate: path.resolve(__dirname, 'src/pages/templates/bookings-template.html'),
        passcodesTemplate: path.resolve(__dirname, 'src/pages/templates/passcodes-template.html'),
        databaseTemplate: path.resolve(__dirname, 'src/pages/templates/database-template.html'),
        roomSettingTemplate: path.resolve(__dirname, 'src/pages/templates/room-setting-template.html'),
        databaseTableTemplate: path.resolve(__dirname, 'src/pages/templates/database-table-template.html'),
        adminHeaderTemplate: path.resolve(__dirname, 'src/pages/templates/admin-header-template.html'),
        usersTemplate: path.resolve(__dirname, 'src/pages/templates/users-template.html'),
        settingsTemplate: path.resolve(__dirname, 'src/pages/templates/settings-template.html'),
        toastTemplate: path.resolve(__dirname, 'src/pages/templates/toast-template.html'),
        emailTemplatesTemplate: path.resolve(__dirname, 'src/pages/templates/email-templates-template.html'),
        smsTemplatesTemplate: path.resolve(__dirname, 'src/pages/templates/sms-templates-template.html')
      }
    }
  }
});
