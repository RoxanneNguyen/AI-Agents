/**
 * Sidebar Component
 */

import React from "react";
import { createStyles } from "antd-style";
import {
  MessageOutlined,
  HistoryOutlined,
  ToolOutlined,
  FileTextOutlined,
  GlobalOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";

const useStyles = createStyles(({ css, token }) => ({
  sidebar: css`
    width: ${(props: { collapsed: boolean }) =>
      props.collapsed ? "0" : "240px"};
    min-width: ${(props: { collapsed: boolean }) =>
      props.collapsed ? "0" : "240px"};
    background: ${token.colorBgContainer};
    border-right: 1px solid ${token.colorBorderSecondary};
    transition: all 0.2s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,
  content: css`
    padding: 16px;
    flex: 1;
    overflow-y: auto;
  `,
  section: css`
    margin-bottom: 24px;
  `,
  sectionTitle: css`
    font-size: 12px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
    text-transform: uppercase;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
  `,
  toolList: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  toolItem: css`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    color: ${token.colorText};

    &:hover {
      background: ${token.colorBgTextHover};
    }
  `,
  toolIcon: css`
    font-size: 18px;
    color: ${token.colorPrimary};
  `,
  toolName: css`
    font-size: 14px;
    flex: 1;
  `,
  toolStatus: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${token.colorSuccess};
  `,
}));

interface SidebarProps {
  collapsed: boolean;
}

const tools = [
  {
    icon: GlobalOutlined,
    name: "Web Browser",
    description: "Browse and research the web",
  },
  {
    icon: BarChartOutlined,
    name: "Data Analysis",
    description: "Analyze and visualize data",
  },
  {
    icon: FileTextOutlined,
    name: "Document Editor",
    description: "Create and edit documents",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { styles } = useStyles({ collapsed });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        {/* Tools Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Available Tools</div>
          <div className={styles.toolList}>
            {tools.map((tool) => (
              <Tooltip
                key={tool.name}
                title={tool.description}
                placement="right"
              >
                <div className={styles.toolItem}>
                  <tool.icon className={styles.toolIcon} />
                  <span className={styles.toolName}>{tool.name}</span>
                  <span className={styles.toolStatus} />
                </div>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Recent Chats Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Recent Chats</div>
          <div className={styles.toolList}>
            <div className={styles.toolItem}>
              <MessageOutlined className={styles.toolIcon} />
              <span className={styles.toolName}>Current Session</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Quick Actions</div>
          <div className={styles.toolList}>
            <div className={styles.toolItem}>
              <HistoryOutlined className={styles.toolIcon} />
              <span className={styles.toolName}>View History</span>
            </div>
            <div className={styles.toolItem}>
              <ToolOutlined className={styles.toolIcon} />
              <span className={styles.toolName}>Manage Tools</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
