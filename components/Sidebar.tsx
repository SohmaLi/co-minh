"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  MessageOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function Sidebar() {
  return (
    <Sider
      width={250}
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

    </Sider>
  );
}
