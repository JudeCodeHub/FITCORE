"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/shared/api-client/http";
import { getAccessToken } from "@/shared/auth/token-store";
import type { ICheckInResult } from "@/modules/check-in/types/check-in";

export function useCheckInSocket(onCheckIn: (event: ICheckInResult) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const handlerRef = useRef(onCheckIn);

  useEffect(() => {
    handlerRef.current = onCheckIn;
  }, [onCheckIn]);

  useEffect(() => {
    const socket: Socket = io(`${API_URL}/check-ins`, {
      auth: { token: getAccessToken() },
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("check-in:new", (event: ICheckInResult) =>
      handlerRef.current(event),
    );

    return () => {
      socket.close();
    };
  }, []);

  return { isConnected };
}
