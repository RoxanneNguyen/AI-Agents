/**
 * Chat Input Component
 */

import React, { useState, useRef, useEffect } from "react";
import { createStyles } from "antd-style";
import { Button, Input, Tooltip } from "antd";
import {
  SendOutlined,
  StopOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 16px;
    background: #fafafa;
    border-radius: 24px;
    border: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `,
  inputWrapper: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
  `,
  textAreaWrapper: css`
    width: 100%;
  `,
  textArea: css`
    resize: none;
    background: transparent;
    border: none;
    box-shadow: none !important;
    padding: 0;
    font-size: 16px;
    line-height: 1.6;
    min-height: 60px;
    color: #1a1a1a;

    &::placeholder {
      color: #888888;
    }
  `,
  footer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
  `,
  leftActions: css`
    display: flex;
    gap: 8px;
  `,
  attachButton: css`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 12px;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.05);
    color: #666666;
    border: none;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #333333;
    }
  `,
  sendButton: css`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${token.colorPrimary};
    color: white;
    border: none;
    cursor: pointer;
    
    &:disabled {
      background: rgba(0, 0, 0, 0.1);
      color: #999999;
    }
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... I can browse the web, analyze data, and create documents."
            autoSize={{ minRows: 2, maxRows: 12 }}
            className={styles.textArea}
            disabled={isLoading || disabled}
          />
        </div>
        
        <div className={styles.footer}>
          <div className={styles.leftActions}>
             <button className={styles.attachButton}>
               <PaperClipOutlined />
               <span>Attach</span>
             </button>
          </div>
          
          <Button
            type="primary"
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            loading={isLoading}
            icon={!isLoading && <SendOutlined />}
          />
        </div>
      </div>
    </div>
  );
};
