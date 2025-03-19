
import { defineConfig } from "vite";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
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
        homePage: path.resolve(__dirname, 'src/pages/HomePage.html'),
        // Components
        header: path.resolve(__dirname, 'src/components/Header.html'),
        heroBanner: path.resolve(__dirname, 'src/components/HeroBanner.html'),
        introSection: path.resolve(__dirname, 'src/components/IntroSection.html'),
        bookingForm: path.resolve(__dirname, 'src/components/BookingForm.html'),
        roomsSection: path.resolve(__dirname, 'src/components/RoomsSection.html'),
        footer: path.resolve(__dirname, 'src/components/Footer.html'),
        toast: path.resolve(__dirname, 'src/components/Toast.html'),
        successModal: path.resolve(__dirname, 'src/components/SuccessModal.html'),
        // Template files
        sidebarTemplate: path.resolve(__dirname, 'src/pages/templates/sidebar-template.html'),
        bookingsTemplate: path.resolve(__dirname, 'src/pages/templates/bookings-template.html'),
        passcodesTemplate: path.resolve(__dirname, 'src/pages/templates/passcodes-template.html'),
        databaseTemplate: path.resolve(__dirname, 'src/pages/templates/database-template.html'),
        databaseTableTemplate: path.resolve(__dirname, 'src/pages/templates/database-table-template.html'),
        adminHeaderTemplate: path.resolve(__dirname, 'src/pages/templates/admin-header-template.html'),
        emailTemplatesTemplate: path.resolve(__dirname, 'src/pages/templates/email-templates-template.html'),
        smsTemplatesTemplate: path.resolve(__dirname, 'src/pages/templates/sms-templates-template.html'),
        roomSettingTemplate: path.resolve(__dirname, 'src/pages/templates/room-setting-template.html'),
        usersTemplate: path.resolve(__dirname, 'src/pages/templates/users-template.html'),
        settingsTemplate: path.resolve(__dirname, 'src/pages/templates/settings-template.html'),
        toastTemplate: path.resolve(__dirname, 'src/pages/templates/toast-template.html')
      }
    }
  }
}));
