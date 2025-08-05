import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  chatMessage: (msg: string) => void;
}

interface ClientToServerEvents {
  chatMessage: (msg: string) => void;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Create socket inside useEffect or useRef to persist once
  const socketRef = React.useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:3000", {
      transports: ["websocket"], // Optional: force websocket, no polling
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected with socket ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for chatMessage events and update state
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off("chatMessage");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current?.connected) return;

    socketRef.current.emit("chatMessage", trimmed);

    setMessages((prev) => [...prev, `You: ${trimmed}`]);
    setInput("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <div key={idx} style={styles.message}>
            {msg}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        style={styles.input}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <button style={styles.button} onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "2rem auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column" as "column",
  },
  chatWindow: {
    height: 300,
    overflowY: "auto" as "auto",
    marginBottom: 10,
    border: "1px solid #ddd",
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column" as "column",
  },
  message: {
    padding: 8,
    marginBottom: 6,
    backgroundColor: "#e1e1e1",
    borderRadius: 4,
    wordWrap: "break-word" as "break-word",
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  button: {
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};

export default ChatBox;
