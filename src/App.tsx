import React from "react";

import { Refine, useRouterContext, TitleProps } from "@pankod/refine-core";
import {
  notificationProvider,
  Layout,
  ReadyPage,
  ErrorComponent,
  AuthPage,
} from "@pankod/refine-antd";

// import dataProvider from "@pankod/refine-simple-rest";
import { RedmineDataProvider } from "./components/redmine/dataProvider";
import routerProvider from "@pankod/refine-react-router-v6";
import "@pankod/refine-antd/dist/styles.min.css";
import { RedmineAuthProvider } from "./components/redmine/authProvider";
import { Login } from "./pages/login";
import { TimeEntryList, TimeEntryShow } from "./pages";
import { RedmineTitle } from "./components/redmine/title";
import { DashboardPage } from "./pages/dashboard/index";

console.log(process.env);
const API_URL = process.env.REACT_APP_REDMINE_API_URL ?? "";

function App() {
  return (
    <Refine
      dataProvider={RedmineDataProvider(API_URL)}
      notificationProvider={notificationProvider}
      Title={RedmineTitle}
      Layout={Layout}
      ReadyPage={ReadyPage}
      catchAll={<ErrorComponent />}
      routerProvider={routerProvider}
      authProvider={RedmineAuthProvider}
      LoginPage={Login}
      DashboardPage={DashboardPage}
      resources={[{ 
        name: "time_entries", 
        // list: TimeEntryList,
        // show: TimeEntryShow
      }]}
    />
  );
}

export default App;
