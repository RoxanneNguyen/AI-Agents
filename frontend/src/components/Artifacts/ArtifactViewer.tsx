/**
 * Artifact Viewer Component - Full view of an artifact (like Claude Artifacts)
 */

import React, { useState } from "react";
import { createStyles } from "antd-style";
import { Button, Tabs, message, Tooltip } from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
  CloseOutlined,
  ExpandOutlined,
  CodeOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Artifact } from "../../types";
import { ChartRenderer } from "./ChartRenderer";

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${token.colorBgContainer};
    border-left: 1px solid ${token.colorBorderSecondary};
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
  `,
  title: css`
    font-weight: 600;
    font-size: 14px;
    color: ${token.colorText};
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  actions: css`
    display: flex;
    gap: 4px;
  `,
  content: css`
    flex: 1;
    overflow: auto;
    padding: 0;
  `,
  codeContent: css`
    height: 100%;
    overflow: auto;

    pre {
      margin: 0 !important;
      border-radius: 0 !important;
      height: 100%;
    }
  `,
  previewContent: css`
    padding: 24px;
    height: 100%;
    overflow: auto;

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }
  `,
  documentContent: css`
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.8;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 24px;
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 16px;
    }

    code {
      background: ${token.colorFillSecondary};
      padding: 2px 6px;
      border-radius: 4px;
    }

    pre {
      background: ${token.colorFillTertiary};
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
  `,
  tabs: css`
    height: 100%;

    .ant-tabs-content {
      height: 100%;
    }

    .ant-tabs-tabpane {
      height: 100%;
    }
  `,
  tableContent: css`
    padding: 16px;
    overflow: auto;

    table {
      width: 100%;
      border-collapse: collapse;

      th,
      td {
        border: 1px solid ${token.colorBorderSecondary};
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background: ${token.colorFillSecondary};
        font-weight: 600;
      }

      tr:hover {
        background: ${token.colorFillQuaternary};
      }
    }
  `,
}));

interface ArtifactViewerProps {
  artifact: Artifact;
  onClose?: () => void;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({
  artifact,
  onClose,
}) => {
  const { styles } = useStyles();
  const [activeTab, setActiveTab] = useState("preview");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      message.success("Copied to clipboard!");
    } catch {
      message.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      code: artifact.language ? `.${artifact.language}` : ".txt",
      document: ".md",
      html: ".html",
      table: ".csv",
      chart: ".json",
      text: ".txt",
    };

    const ext = extensions[artifact.type] || ".txt";
    const filename = `${artifact.title.replace(/\s+/g, "_")}${ext}`;

    const blob = new Blob([artifact.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success(`Downloaded ${filename}`);
  };

  const renderContent = () => {
    switch (artifact.type) {
      case "code":
        return (
          <Tabs
            className={styles.tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "code",
                label: (
                  <span>
                    <CodeOutlined /> Code
                  </span>
                ),
                children: (
                  <div className={styles.codeContent}>
                    <SyntaxHighlighter
                      style={oneDark}
                      language={artifact.language || "text"}
                      showLineNumbers
                      customStyle={{ height: "100%", margin: 0 }}
                    >
                      {artifact.content}
                    </SyntaxHighlighter>
                  </div>
                ),
              },
            ]}
          />
        );

      case "html":
        return (
          <Tabs
            className={styles.tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "preview",
                label: (
                  <span>
                    <EyeOutlined /> Preview
                  </span>
                ),
                children: (
                  <div className={styles.previewContent}>
                    <iframe
                      srcDoc={artifact.content}
                      title={artifact.title}
                      sandbox="allow-scripts"
                    />
                  </div>
                ),
              },
              {
                key: "code",
                label: (
                  <span>
                    <CodeOutlined /> Code
                  </span>
                ),
                children: (
                  <div className={styles.codeContent}>
                    <SyntaxHighlighter
                      style={oneDark}
                      language="html"
                      showLineNumbers
                    >
                      {artifact.content}
                    </SyntaxHighlighter>
                  </div>
                ),
              },
            ]}
          />
        );

      case "document":
        return (
          <div className={styles.documentContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {artifact.content}
            </ReactMarkdown>
          </div>
        );

      case "chart":
        return (
          <div className={styles.previewContent}>
            <ChartRenderer data={artifact.content} />
          </div>
        );

      case "table":
        return (
          <div
            className={styles.tableContent}
            dangerouslySetInnerHTML={{
              __html: artifact.content.includes("<table")
                ? artifact.content
                : `<pre>${artifact.content}</pre>`,
            }}
          />
        );

      default:
        return (
          <div className={styles.documentContent}>
            <pre>{artifact.content}</pre>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          {artifact.title}
          {artifact.language && <span>({artifact.language})</span>}
        </div>
        <div className={styles.actions}>
          <Tooltip title="Copy">
            <Button type="text" icon={<CopyOutlined />} onClick={handleCopy} />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
          <Tooltip title="Close">
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </Tooltip>
        </div>
      </div>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
};
