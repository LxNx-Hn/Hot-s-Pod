// main.jsx (또는 index.jsx)
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import store from "../redux/store";
import App from "./App";
import "../styles/global.css";
import { ConfigProvider } from "antd";
import ko_KR from "antd/locale/ko_KR";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <ConfigProvider locale={ko_KR}>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </ConfigProvider>
);
