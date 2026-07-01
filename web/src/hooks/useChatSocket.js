// hooks/useChatSocket.js
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { upsertConversations } from "@/cache/chatsDB";
import { SocketEvent } from "@/constants/socketEvents";

export const useChatSocket = (idToken, selectedChat, setMessages, setChatMessages) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // 🌟 TUYỆT CHIÊU: Dùng useRef để giữ selectedChat mà không làm Re-render Socket
  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!idToken) return;

    // 🌟 SỬA LỖI LOCALHOST: 
    // Dùng biến môi trường (VITE_API_URL). Nếu không có thì fallback về localhost để dev.
    // Đừng quên thêm biến VITE_SOCKET_URL vào settings của Vercel nhé!
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000/chat";
    
    const socketClient = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: idToken },
      autoConnect: false,
    });

    socketClient.connect();
    setSocket(socketClient);

    // ====== Core events ======
    socketClient.on(SocketEvent.CONNECT, () => setIsConnected(true));
    socketClient.on(SocketEvent.DISCONNECT, () => setIsConnected(false));
    socketClient.on(SocketEvent.CONNECT_ERROR, () => setIsConnected(false));

    // ====== Conversation list ======
    socketClient.emit("get_list_messages", { timestamp: null, token: idToken });

    socketClient.on("list_message", async (data) => {
      if (!Array.isArray(data) || !data.length) return;
      setMessages((prev) => {
        const merged = [...prev];
        data.forEach((newConv) => {
          const index = merged.findIndex((c) => c.uid === newConv.uid);
          if (index > -1) merged[index] = { ...merged[index], ...newConv };
          else merged.unshift(newConv);
        });
        return merged;
      });
      await upsertConversations(data);
    });

    // ====== New message realtime ======
    socketClient.on("new_message", (msg) => {
      setMessages((prev) => {
        const index = prev.findIndex((c) => c.uid === msg.with_user);
        if (index > -1) {
          prev[index] = {
            ...prev[index],
            latestMessage: msg,
            messages: [...(prev[index].messages || []), msg],
          };
        } else {
          prev.unshift({
            uid: msg.with_user,
            latestMessage: msg,
            messages: [msg],
          });
        }
        return [...prev];
      });

      // 🌟 Dùng biến ref thay vì dependency để check chat hiện tại
      if (selectedChatRef.current?.uid === msg.with_user) {
        setChatMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketClient.disconnect();
      setSocket(null);
    };
  // 🌟 ĐÃ XÓA selectedChat KHỎI MẢNG NÀY ĐỂ TRÁNH SPAM DISCONNECT
  }, [idToken, setMessages, setChatMessages]); 

  // helper: gửi request lấy messages với
  // user cụ thể. Dùng khi user click vào 1 conversation để load messages
  const fetchMessagesWithUser = (chatId) => {
    if (!socket) return;
    socket.emit("get_messages_with_user", {
      with_user: chatId,
      timestamp: null,
      token: idToken,
    });
  };

  return { socket, isConnected, fetchMessagesWithUser };
};