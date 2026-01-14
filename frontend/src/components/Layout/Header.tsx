/**
 * Header Component
 */

import React from "react";
import { Header as LobeHeader, Logo, ActionIcon } from "@lobehub/ui";
import { createStyles } from "antd-style";
import {
  MenuOutlined,
  SettingOutlined,
  GithubOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useChatStore } from "../../store";

const useStyles = createStyles(({ css, token }) => ({
  header: css`
    border-bottom: 1px solid ${token.colorBorderSecondary};
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    background: ${token.colorBgContainer};
  `,
  left: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  title: css`
    font-size: 18px;
    font-weight: 600;
    color: ${token.colorText};
    margin-left: 8px;
  `,
  right: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
}));

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { styles } = useStyles();
  const clearChat = useChatStore((state) => state.clearChat);

  const handleNewChat = () => {
    clearChat();
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <ActionIcon
          icon={MenuOutlined}
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        />
        <Logo size={32} />
        <span className={styles.title}>AI Agents Platform</span>
      </div>
      <div className={styles.right}>
        <Tooltip title="New Chat">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewChat}
          >
            New Chat
          </Button>
        </Tooltip>
        <ActionIcon
          icon={GithubOutlined}
          title="GitHub"
          onClick={() => window.open("https://github.com", "_blank")}
        />
        <ActionIcon icon={SettingOutlined} title="Settings" />
      </div>
    </header>
  );
};
