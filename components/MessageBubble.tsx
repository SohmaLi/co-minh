import React from "react";
import { Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        marginBottom: 24,
        gap: 12,
      }}
    >
      <Avatar
        size={40}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          backgroundColor: isUser ? "#1677ff" : "#52c41a",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          maxWidth: "75%",
          backgroundColor: isUser ? "#1677ff" : "#ffffff",
          color: isUser ? "#ffffff" : "#000000",
          padding: "12px 16px",
          borderRadius: 16,
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          lineHeight: 1.5,
          fontSize: 15,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
    </div>
  );
}
