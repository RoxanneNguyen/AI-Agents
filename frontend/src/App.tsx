import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@lobehub/ui";
import { Layout } from "./components/Layout";
import { ChatPage } from "./pages/ChatPage";

function App() {
  return (
    <ThemeProvider 
      themeMode="dark"
      theme={{
        token: {
          colorBgLayout: '#000000',
          colorBgContainer: '#0a0a0a',
          colorBgElevated: '#141414',
          colorPrimary: '#2E6BFF', 
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
