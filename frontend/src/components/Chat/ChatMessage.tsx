/**
 * Individual Chat Message Component
 */

import React from "react";
import { createStyles } from "antd-style";
import { Avatar, Spin, Tag } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "../../types";
import { ExecutionSteps } from "./ExecutionSteps";
import { ArtifactCard } from "../Artifacts/ArtifactCard";

const useStyles = createStyles(({ css, token }) => ({
  message: css`
    display: flex;
    gap: 16px;
    padding: 24px;
    border-radius: 24px;
    background: transparent;
    width: 100%;
  `,
  userMessage: css`
    background: #111111;
    color: white;
  `,
  assistantMessage: css`
    background: #111111;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `,
  avatar: css`
    flex-shrink: 0;
  `,
  userAvatar: css`
    background: ${token.colorPrimary};
  `,
  assistantAvatar: css`
    background: linear-gradient(
      135deg,
      ${token.colorPrimary} 0%,
      ${token.colorSuccess} 100%
    );
  `,
  content: css`
    flex: 1;
    min-width: 0;
  `,
  role: css`
    font-weight: 600;
    margin-bottom: 8px;
    color: ${token.colorText};
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  text: css`
    color: ${token.colorText};
    line-height: 1.6;

    p {
      margin-bottom: 12px;
    }

    p:last-child {
      margin-bottom: 0;
    }

    code {
      background: ${token.colorFillSecondary};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    pre {
      margin: 12px 0;
      border-radius: 8px;
      overflow: hidden;

      code {
        background: none;
        padding: 0;
      }
    }

    ul,
    ol {
      padding-left: 24px;
      margin-bottom: 12px;
    }

    blockquote {
      border-left: 4px solid ${token.colorPrimary};
      padding-left: 16px;
      margin: 12px 0;
      color: ${token.colorTextSecondary};
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;

      th,
      td {
        border: 1px solid ${token.colorBorderSecondary};
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background: ${token.colorFillSecondary};
      }
    }
  `,
  loading: css`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${token.colorTextSecondary};
  `,
  artifacts: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
  `,
}));

interface ChatMessageProps {
  message: Message;
  onArtifactClick?: (artifactId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onArtifactClick,
}) => {
  const { styles, cx } = useStyles();
  const isUser = message.role === "user";

  return (
    <div
      className={cx(
        styles.message,
        isUser ? styles.userMessage : styles.assistantMessage
      )}
    >
      <Avatar
        size={40}
        className={cx(
          styles.avatar,
          isUser ? styles.userAvatar : styles.assistantAvatar
        )}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
      />
      <div className={styles.content}>
        <div className={styles.role}>
          {isUser ? "You" : "Atlas"}
          {!isUser && <Tag color="blue">AI Agent</Tag>}
        </div>

        {message.isLoading ? (
          <div className={styles.loading}>
            <Spin indicator={<LoadingOutlined spin />} />
            <span>Thinking...</span>
          </div>
        ) : (
          <>
            <div className={styles.text}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Execution Steps */}
            {message.steps && message.steps.length > 0 && (
              <ExecutionSteps steps={message.steps} />
            )}

            {/* Artifacts */}
            {message.artifacts && message.artifacts.length > 0 && (
              <div className={styles.artifacts}>
                {message.artifacts.map((artifact) => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    onClick={() => onArtifactClick?.(artifact.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
