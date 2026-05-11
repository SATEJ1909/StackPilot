"use client";

import { useSyncExternalStore } from "react";

const TOKEN_KEY = "stackpilot_token";
const TOKEN_EVENT = "stackpilot_token_change";

export const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(TOKEN_EVENT));
};

export const clearToken = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(TOKEN_EVENT));
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

const subscribeToToken = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(TOKEN_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(TOKEN_EVENT, onStoreChange);
  };
};

export const useAuthToken = () => {
  return useSyncExternalStore(subscribeToToken, getToken, () => null);
};
