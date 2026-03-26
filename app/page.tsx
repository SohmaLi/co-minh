"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layout, Input, Button, Modal, Typography, Popconfirm, Popover, Select, Tag } from "antd";
import { SendOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const SIDEBAR_WIDTH = 250;

interface StudentProfile {
  level: string;
  commonErrors: string;
  improvements: string;
}

const LEVELS = [
  { value: "beginner", label: "🌱 Mới bắt đầu (A1-A2)" },
  { value: "elementary", label: "📖 Sơ cấp (B1)" },
  { value: "intermediate", label: "📚 Trung cấp (B2)" },
  { value: "upper-intermediate", label: "🎓 Khá (C1)" },
  { value: "advanced", label: "🏆 Nâng cao (C2)" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [showNameModal, setShowNameModal] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile>({
    level: "intermediate",
    commonErrors: "",
    improvements: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      setStudentName(nameInput.trim());
      setShowNameModal(false);
    }
  };

  const handleClearChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    setError(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.slice(-20),
          studentName: studentName || "em",
          profile,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      if (!response.body) throw new Error("Response body is empty");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        let hasPrefix = false;

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("0:")) {
            hasPrefix = true;
            try {
              const textPart = JSON.parse(line.slice(2));
              if (typeof textPart === "string") fullText += textPart;
            } catch { /* ignore */ }
          } else if (line.startsWith("data: ")) {
            hasPrefix = true;
            const data = line.slice(6);
            if (data && data !== "[DONE]") fullText += data;
          } else if (line.startsWith("e:") || line.startsWith("d:") || line.startsWith("f:")) {
            hasPrefix = true;
          }
        }

        if (!hasPrefix && chunk.trim()) fullText += chunk;

        if (fullText) {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Dừng stream - giữ nội dung đã nhận
      } else {
        const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi.";
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => abortControllerRef.current?.abort();

  const handleFormSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const profileContent = (
    <div style={{ width: 300, padding: 8 }}>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Trình độ
        </Text>
        <Select
          value={profile.level}
          onChange={(val) => setProfile({ ...profile, level: val })}
          options={LEVELS}
          style={{ width: "100%" }}
          size="small"
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Lỗi hay mắc phải
        </Text>
        <TextArea
          value={profile.commonErrors}
          onChange={(e) => setProfile({ ...profile, commonErrors: e.target.value })}
          placeholder="VD: nhầm lẫn thì, thiếu mạo từ..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          size="small"
          style={{ fontSize: 12 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Điều cần cải thiện
        </Text>
        <TextArea
          value={profile.improvements}
          onChange={(e) => setProfile({ ...profile, improvements: e.target.value })}
          placeholder="VD: phát âm, giao tiếp tự nhiên hơn..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          size="small"
          style={{ fontSize: 12 }}
        />
      </div>
      <Tag color="blue" style={{ fontSize: 11, display: "block", textAlign: "center" }}>
        Cô Minh sẽ dạy theo form này nhé!
      </Tag>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />

      <Layout style={{ marginLeft: SIDEBAR_WIDTH }}>
        <Content
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "#f5f5f5",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #f0f0f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              flexShrink: 0,
            }}
          >
            <Text strong style={{ fontSize: 15 }}>
              🇬🇧 Cô Minh English {studentName && <Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>— Học viên: {studentName}</Text>}
            </Text>
            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Popover 
                content={profileContent} 
                title={<div style={{ fontWeight: 600 }}>Cấu hình kiến thức</div>} 
                trigger="click" 
                placement="bottomRight"
              >
                <Button icon={<SettingOutlined />} size="small" type="dashed">
                  Tuỳ chỉnh kiến thức
                </Button>
              </Popover>

              {messages.length > 0 && (
                <Popconfirm
                  title="Xoá toàn bộ hội thoại?"
                  description="Lịch sử chat sẽ bị xoá và không thể khôi phục."
                  onConfirm={handleClearChat}
                  okText="Xoá"
                  cancelText="Huỷ"
                  okButtonProps={{ danger: true }}
                >
                  <Button icon={<DeleteOutlined />} size="small" type="text" danger>
                    Xoá hội thoại
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className="chat-messages-container"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 10%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8c8c8c",
                  textAlign: "center",
                }}
              >
                <Title level={3} style={{ color: "#1677ff" }}>
                  Chào mừng {studentName ? `"${studentName}"` : "bạn"} đến với lớp học của Cô Minh!
                </Title>
                <Text style={{ fontSize: 15 }}>
                  Hãy bắt đầu bài giao tiếp với cô nhé. Đừng lo nếu bạn sai ngữ pháp, cô sẽ sửa! 😉
                </Text>
              </div>
            ) : (
              messages.map((m) => {
                if (m.role === "assistant" && !m.content) {
                  return (
                    <div key={m.id} style={{ display: "flex", alignItems: "flex-start", marginBottom: 24, gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#52c41a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 18 }}>🤖</span>
                      </div>
                      <div style={{ backgroundColor: "#ffffff", padding: "14px 18px", borderRadius: 16, borderTopLeftRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  );
                }
                return <MessageBubble key={m.id} role={m.role} content={m.content} />;
              })
            )}

            {error && (
              <div style={{ color: "red", textAlign: "center", marginBottom: 16, padding: "8px 16px", background: "#fff2f0", borderRadius: 8, border: "1px solid #ffccc7" }}>
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "14px 10%",
              backgroundColor: "#ffffff",
              borderTop: "1px solid #f0f0f0",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <form
              onSubmit={handleFormSubmit}
              style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
            >
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onEnterPress}
                placeholder="Nhập câu trả lời bằng tiếng Anh (Enter để gửi, Shift+Enter xuống dòng)..."
                autoSize={{ minRows: 2, maxRows: 5 }}
                disabled={isStreaming}
                style={{ borderRadius: 8, fontSize: 14, padding: "8px 12px" }}
              />
              {isStreaming ? (
                <Button danger onClick={handleStop} style={{ height: 44, borderRadius: 8, padding: "0 18px" }}>
                  Dừng
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  disabled={!input.trim()}
                  style={{ height: 44, borderRadius: 8, padding: "0 18px" }}
                >
                  Gửi
                </Button>
              )}
            </form>
          </div>
        </Content>
      </Layout>

      {/* Name Modal */}
      {mounted && (
        <Modal
          title={<div style={{ fontSize: 20, textAlign: "center", marginBottom: 8 }}>👋 Xin chào!</div>}
          open={showNameModal}
          closable={false}
          footer={null}
          keyboard={false}
          centered
        >
          <div style={{ textAlign: "center" }}>
            <Text style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
              Tên học viên của bạn là gì để Cô Minh xưng hô cho thân mật nhỉ?
            </Text>
            <Input
              placeholder="Nhập tên của bạn (VD: Linh)"
              size="large"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onPressEnter={handleNameSubmit}
              style={{ marginBottom: 16 }}
              autoFocus
            />
            <Button type="primary" size="large" block onClick={handleNameSubmit} disabled={!nameInput.trim()}>
              Bắt đầu lớp học
            </Button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
