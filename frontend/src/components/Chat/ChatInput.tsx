/**
 * Chat Input Component
 */

import React, { useState, useRef, useEffect } from "react";
import { createStyles } from "antd-style";
import { Button, Input, Tooltip } from "antd";
import {
  SendOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 16px 24px 24px;
    background: ${token.colorBgContainer};
    border-top: 1px solid ${token.colorBorderSecondary};
  `,
  inputWrapper: css`
    display: flex;
    gap: 12px;
    align-items: flex-end;
    max-width: 900px;
    margin: 0 auto;
  `,
  textAreaWrapper: css`
    flex: 1;
    position: relative;
  `,
  textArea: css`
    resize: none;
    border-radius: 24px;
    padding: 12px 16px;
    padding-right: 80px;
    font-size: 15px;
    line-height: 1.5;
    min-height: 52px;
    max-height: 200px;

    &:focus {
      box-shadow: 0 0 0 2px ${token.colorPrimaryBg};
    }
  `,
  actions: css`
    position: absolute;
    right: 8px;
    bottom: 8px;
    display: flex;
    gap: 4px;
    align-items: center;
  `,
  sendButton: css`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  hint: css`
    text-align: center;
    font-size: 12px;
    color: ${token.colorTextSecondary};
    margin-top: 8px;
  `,
}));

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading = false,
  onCancel,
  disabled = false,
}) => {
  const { styles } = useStyles();
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<any>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.resizableTextArea.textArea.style.height = "auto";
      textAreaRef.current.resizableTextArea.textArea.style.height =
        Math.min(
          textAreaRef.current.resizableTextArea.textArea.scrollHeight,
          200
        ) + "px";
    }
  }, [message]);

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <div className={styles.textAreaWrapper}>
          <TextArea
            ref={textAreaRef}
            className={styles.textArea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... I can browse the web, analyze data, and create documents."
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={disabled}
          />
          <div className={styles.actions}>

            {isLoading ? (
              <Tooltip title="Stop generation">
                <Button
                  className={styles.sendButton}
                  type="primary"
                  danger
                  icon={<StopOutlined />}
                  onClick={onCancel}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Send message (Enter)">
                <Button
                  className={styles.sendButton}
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  disabled={!message.trim() || disabled}
                />
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      <div className={styles.hint}>
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};
