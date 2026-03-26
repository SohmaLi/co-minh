"use client";

import React from "react";
import { Layout, Menu, Select, Input, Typography, Divider, Tag } from "antd";
import {
  MessageOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

export interface StudentProfile {
  level: string;
  commonErrors: string;
  improvements: string;
}

interface SidebarProps {
  profile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
}

const LEVELS = [
  { value: "beginner", label: "🌱 Mới bắt đầu (A1-A2)" },
  { value: "elementary", label: "📖 Sơ cấp (B1)" },
  { value: "intermediate", label: "📚 Trung cấp (B2)" },
  { value: "upper-intermediate", label: "🎓 Khá (C1)" },
  { value: "advanced", label: "🏆 Nâng cao (C2)" },
];

export default function Sidebar({ profile, onProfileChange }: SidebarProps) {
  return (
    <Sider
      width={300}
      theme="light"
      style={{
        borderRight: "1px solid #f0f0f0",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          fontWeight: "bold",
          fontSize: 17,
          borderBottom: "1px solid #f0f0f0",
          color: "#1677ff",
          flexShrink: 0,
        }}
      >
        📚 Home Work
      </div>

      {/* Navigation */}
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        style={{ borderRight: 0 }}
        items={[
          {
            key: "1",
            icon: <MessageOutlined />,
            label: "Cô Minh English",
          },
          {
            key: "2",
            icon: <BookOutlined />,
            label: "Bài tập 2 (Coming soon)",
            disabled: true,
          },
        ]}
      />

      <Divider style={{ margin: "0 0 12px 0" }} />

      {/* Student Profile */}
      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            color: "#595959",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <UserOutlined />
          <span>Hồ sơ học viên</span>
        </div>

        {/* Level */}
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Trình độ
          </Text>
          <Select
            value={profile.level}
            onChange={(val) => onProfileChange({ ...profile, level: val })}
            options={LEVELS}
            style={{ width: "100%" }}
            size="small"
          />
        </div>

        {/* Common Errors */}
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Lỗi hay mắc phải
          </Text>
          <TextArea
            value={profile.commonErrors}
            onChange={(e) =>
              onProfileChange({ ...profile, commonErrors: e.target.value })
            }
            placeholder="VD: nhầm lẫn thì, thiếu mạo từ..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            size="small"
            style={{ fontSize: 12 }}
          />
        </div>

        {/* Improvements */}
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Điều cần cải thiện
          </Text>
          <TextArea
            value={profile.improvements}
            onChange={(e) =>
              onProfileChange({ ...profile, improvements: e.target.value })
            }
            placeholder="VD: phát âm, giao tiếp tự nhiên hơn..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            size="small"
            style={{ fontSize: 12 }}
          />
        </div>

        <Tag color="blue" style={{ fontSize: 11 }}>
          Cô Minh sẽ điều chỉnh theo hồ sơ này
        </Tag>
      </div>
    </Sider>
  );
}
