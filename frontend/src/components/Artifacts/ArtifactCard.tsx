/**
 * Artifact Card Component - Small card preview of an artifact
 */

import React from "react";
import { createStyles } from "antd-style";
import { Tag } from "antd";
import {
  CodeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TableOutlined,
  Html5Outlined,
  FileImageOutlined,
} from "@ant-design/icons";
import type { Artifact } from "../../types";

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 200px;
    max-width: 280px;

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  `,
  icon: css`
    font-size: 24px;
    color: ${token.colorPrimary};
  `,
  title: css`
    font-weight: 600;
    font-size: 14px;
    color: ${token.colorText};
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  preview: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    line-height: 1.5;
    max-height: 48px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  `,
  footer: css`
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  type: css`
    font-size: 11px;
  `,
}));

interface ArtifactCardProps {
  artifact: Artifact;
  onClick?: () => void;
}

const getArtifactIcon = (type: string) => {
  switch (type) {
    case "code":
      return <CodeOutlined />;
    case "document":
      return <FileTextOutlined />;
    case "chart":
      return <BarChartOutlined />;
    case "table":
      return <TableOutlined />;
    case "html":
      return <Html5Outlined />;
    case "image":
      return <FileImageOutlined />;
    default:
      return <FileTextOutlined />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "code":
      return "blue";
    case "document":
      return "green";
    case "chart":
      return "purple";
    case "table":
      return "orange";
    case "html":
      return "red";
    case "image":
      return "cyan";
    default:
      return "default";
  }
};

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onClick,
}) => {
  const { styles } = useStyles();

  // Generate preview text
  const getPreview = () => {
    if (artifact.type === "code") {
      const lines = artifact.content.split("\n").slice(0, 3);
      return lines.join("\n");
    }
    return artifact.content.slice(0, 100);
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <span className={styles.icon}>{getArtifactIcon(artifact.type)}</span>
        <span className={styles.title}>{artifact.title}</span>
      </div>
      <div className={styles.preview}>{getPreview()}</div>
      <div className={styles.footer}>
        <Tag color={getTypeColor(artifact.type)} className={styles.type}>
          {artifact.type.toUpperCase()}
          {artifact.language && ` • ${artifact.language}`}
        </Tag>
      </div>
    </div>
  );
};
