import { AuthProvider } from "@pankod/refine-core";
import axios, { AxiosInstance } from "axios";
import { stringify } from "query-string";
import {
    DataProvider,
    HttpError,
    CrudOperators,
    CrudFilters,
    CrudSorting,
} from "@pankod/refine-core";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const customError: HttpError = {
            ...error,
            message: error.response?.data?.message,
            statusCode: error.response?.status,
        };

        return Promise.reject(customError);
    },
);

export const TOKEN_KEY = "redmine_api_key";
export const REDMINE_USER = "redmine_user";
// export const API_URL = process.env.REDMINE_URL;
export const API_URL = "";

export const RedmineAuthProvider: AuthProvider = {
    login: async ({ username, password }) => {
        const resource = "/users/current.json";
        const url = `${API_URL}${resource}`;
        console.log(url);
        const { data } = await axiosInstance.get(url, { 
          headers: {
            Accept: "application/json"
          },
          auth: {
            username: username,
            password: password
          }
        });
        console.log(data);
        if (data && data.user && data.user.api_key) {
            localStorage.setItem(TOKEN_KEY, data.user.api_key);
            localStorage.setItem(REDMINE_USER, JSON.stringify(data.user));
            return Promise.resolve();
        }
        
        return Promise.reject(new Error("Failed to login your Redmine account. Invalid username or password."));
    },
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REDMINE_USER);
        return Promise.resolve();
    },
    checkError: () => Promise.resolve(),
    checkAuth: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            return Promise.resolve();
        }

        return Promise.reject();
    },
    getPermissions: () => Promise.resolve(),
    getUserIdentity: async () => {
        const redmine_user = localStorage.getItem(REDMINE_USER);
        if (!redmine_user) {
            return Promise.reject();
        }

        return Promise.resolve(JSON.parse(redmine_user));
    },
};
