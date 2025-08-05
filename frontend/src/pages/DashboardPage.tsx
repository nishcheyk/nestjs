import React from "react";
import ChatBox from "../components/ChatBox";

export default function Home() {
  return (
    <div>
      <h2>Welcome Home!</h2>
      <p>This page is protected and accessible after login.</p>
      <h1 style={{ textAlign: "center" }}>Socket.IO Chat</h1>
      <ChatBox />
    </div>
  );
}
