import {
    GitHubBanner,
    Refine,
    AuthBindings,
    Authenticated,
} from "@refinedev/core";
import {
    ThemedLayoutV2,
    ErrorComponent,
    RefineThemes,
    notificationProvider,
    RefineSnackbarProvider,
    AuthPage,
} from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { ThemeProvider } from "@mui/material/styles";
import dataProvider from "@refinedev/simple-rest";
import routerProvider, {
    NavigateToResource,
    CatchAllNavigate,
    UnsavedChangesNotifier,
    DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import axios from "axios";
import { PostList, PostCreate, PostEdit } from "../src/pages/posts";

import { LOGIN_API_URL } from "./contents";
import React from "react";
/**
 *  mock auth credentials to simulate authentication
 */


const authCredentials = {
    email: "demo@refine.dev",
    password: "demodemo",
};


const App: React.FC = () => {
    const authProvider: AuthBindings = {
        login: async ({ providerName, email ,password}) => {
            if (providerName === "google") {
                window.location.href =
                    "https://accounts.google.com/o/oauth2/v2/auth";
                return {
                    success: true,
                };
            }

            if (providerName === "github") {
                window.location.href =
                    "https://github.com/login/oauth/authorize";
                return {
                    success: true,
                };
            }

            else{
                
                try {
                    const response = await axios.post(LOGIN_API_URL, {
                      email,
                      password,
                    });
              
                    if (response.data === "Email and password are the same.") {
                        localStorage.setItem("email", email);
                      console.log("OK");
                      //console.log(response?.data?.accessToken);
                      return {
                        success: true,
                        redirectTo: "/",
                            };
                      
                    }else{
                        console.log(response.data);
                       
                    }
                  } catch (error) {
                    //console.error(error);
                    
                  }
                
            } return {
                success: false,
                error: {
                    message: "Login failed",
                    name: "Invalid email or password",
                },
            };

            
        },
        register: async (params) => {
            if (params.email === authCredentials.email && params.password) {
                localStorage.setItem("email", params.email);
                return {
                    success: true,
                    redirectTo: "/",
                };
            }
            return {
                success: false,
                error: {
                    message: "Register failed",
                    name: "Invalid email or password",
                },
            };
        },
        updatePassword: async (params) => {
            if (params.password === authCredentials.password) {
                //we can update password here
                return {
                    success: true,
                };
            }
            return {
                success: false,
                error: {
                    message: "Update password failed",
                    name: "Invalid password",
                },
            };
        },
        forgotPassword: async (params) => {
            if (params.email === authCredentials.email) {
                //we can send email with reset password link here
                return {
                    success: true,
                };
            }
            return {
                success: false,
                error: {
                    message: "Forgot password failed",
                    name: "Invalid email",
                },
            };
        },
        logout: async () => {
            localStorage.removeItem("email");
            return {
                success: true,
                redirectTo: "/login",
            };
        },
        onError: async (error) => {
            console.error(error);
            return { error };
        },
        check: async () =>
            localStorage.getItem("email")
                ? {
                      authenticated: true,
                  }
                : {
                      authenticated: false,
                      error: {
                          message: "Check failed",
                          name: "Not authenticated",
                      },
                      logout: true,
                      redirectTo: "/login",
                  },
        getPermissions: async () => ["admin"],
        getIdentity: async () => ({
            id: 1,
            name: "Jane Doe",
            avatar: "https://unsplash.com/photos/IWLOvomUmWU/download?force=true&w=640",
        }),
    };

    const RememeberMe = () => {
        const { register } = useFormContext();

        return (
            <FormControlLabel
                sx={{
                    span: {
                        fontSize: "12px",
                        color: "text.secondary",
                    },
                }}
                color="secondary"
                control={
                    <Checkbox
                        size="small"
                        id="rememberMe"
                        {...register("rememberMe")}
                    />
                }
                label="Remember me"
            />
        );
    };

    return (
        <BrowserRouter>
            <GitHubBanner />
            <ThemeProvider theme={RefineThemes.Blue}>
                <CssBaseline />
                <GlobalStyles
                    styles={{ html: { WebkitFontSmoothing: "auto" } }}
                />
                <RefineSnackbarProvider>
                    <Refine
                        authProvider={authProvider}
                        dataProvider={dataProvider(
                            "https://api.fake-rest.refine.dev",
                        )}
                        routerProvider={routerProvider}
                        notificationProvider={notificationProvider}
                        resources={[
                            {
                                name: "posts",
                                list: "/posts",
                                edit: "/posts/edit/:id",
                                create: "/posts/create",
                            },
                        ]}
                        options={{
                            syncWithLocation: true,
                            warnWhenUnsavedChanges: true,
                        }}
                    >
                        <Routes>
                            <Route
                                element={
                                    <Authenticated
                                        fallback={
                                            <CatchAllNavigate to="/login" />
                                        }
                                    >
                                        <ThemedLayoutV2>
                                            <Outlet />
                                        </ThemedLayoutV2>
                                    </Authenticated>
                                }
                            >
                                <Route
                                    index
                                    element={
                                        <NavigateToResource resource="posts" />
                                    }
                                />

                                <Route path="/posts">
                                    <Route index element={<PostList />} />
                                    <Route
                                        path="create"
                                        element={<PostCreate />}
                                    />
                                    <Route
                                        path="edit/:id"
                                        element={<PostEdit />}
                                    />
                                </Route>
                            </Route>

                            <Route
                                element={
                                    <Authenticated fallback={<Outlet />}>
                                        <NavigateToResource resource="posts" />
                                    </Authenticated>
                                }
                            >
                                <Route
                                    path="/login"
                                    element={
                                        <AuthPage
                                            type="login"
                                            rememberMe={<RememeberMe />}
                                            formProps={{
                                                defaultValues: {
                                                    ...authCredentials,
                                                },
                                            }}
                                            providers={[
                                                {
                                                    name: "google",
                                                    label: "Sign in with Google",
                                                    icon: (
                                                        <GoogleIcon
                                                            style={{
                                                                fontSize: 24,
                                                            }}
                                                        />
                                                    ),
                                                },
                                                {
                                                    name: "github",
                                                    label: "Sign in with GitHub",
                                                    icon: (
                                                        <GitHubIcon
                                                            style={{
                                                                fontSize: 24,
                                                            }}
                                                        />
                                                    ),
                                                },
                                            ]}
                                        />
                                    }
                                />
                                <Route
                                    path="/register"
                                    element={
                                        <AuthPage
                                            type="register"
                                            providers={[
                                                {
                                                    name: "google",
                                                    label: "Sign in with Google",
                                                    icon: (
                                                        <GoogleIcon
                                                            style={{
                                                                fontSize: 24,
                                                            }}
                                                        />
                                                    ),
                                                },
                                                {
                                                    name: "github",
                                                    label: "Sign in with GitHub",
                                                    icon: (
                                                        <GitHubIcon
                                                            style={{
                                                                fontSize: 24,
                                                            }}
                                                        />
                                                    ),
                                                },
                                            ]}
                                        />
                                    }
                                />
                                <Route
                                    path="/forgot-password"
                                    element={<AuthPage type="forgotPassword" />}
                                />
                                <Route
                                    path="/update-password"
                                    element={<AuthPage type="updatePassword" />}
                                />
                            </Route>

                            <Route
                                element={
                                    <Authenticated>
                                        <ThemedLayoutV2>
                                            <Outlet />
                                        </ThemedLayoutV2>
                                    </Authenticated>
                                }
                            >
                                <Route path="*" element={<ErrorComponent />} />
                            </Route>
                        </Routes>
                        <UnsavedChangesNotifier />
                        <DocumentTitleHandler />
                    </Refine>
                </RefineSnackbarProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
