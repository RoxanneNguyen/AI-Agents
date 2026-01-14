/**
 * Chat Messages List Component
 */

import React, { useRef, useEffect } from "react";
import { createStyles } from "antd-style";
import { ChatMessage } from "./ChatMessage";
import { WelcomeScreen } from "./WelcomeScreen";
import type { Message } from "../../types";

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  `,
  messagesWrapper: css`
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
}));

interface ChatMessagesProps {
  messages: Message[];
  onArtifactClick?: (artifactId: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  onArtifactClick,
}) => {
  const { styles } = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.container}>
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.messagesWrapper}>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onArtifactClick={onArtifactClick}
          />
        ))}
      </div>
    </div>
  );
};
