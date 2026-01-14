/**
 * Chat Page - Main chat interface
 */

import React, { useCallback, useEffect } from "react";
import { createStyles } from "antd-style";
import { message } from "antd";
import { ChatInput, ChatMessages, WelcomeScreen } from "../components/Chat";
import { ArtifactViewer } from "../components/Artifacts";
import { useChatStore } from "../store";
import { api } from "../services";
import type { Message, Artifact } from "../types";

const useStyles = createStyles(({ css }) => ({
  container: css`
    display: flex;
    height: 100%;
    overflow: hidden;
  `,
  chatSection: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  `,
  artifactSection: css`
    width: 500px;
    min-width: 400px;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;

    @media (max-width: 1200px) {
      width: 400px;
    }
  `,
  hidden: css`
    width: 0;
    min-width: 0;
    overflow: hidden;
  `,
}));

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 11);

export const ChatPage: React.FC = () => {
  const { styles, cx } = useStyles();
  const {
    sessionId,
    messages,
    isLoading,
    selectedArtifact,
    setSessionId,
    addMessage,
    updateMessage,
    setLoading,
    addArtifact,
    setSelectedArtifact,
  } = useChatStore();

  // Initialize session
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateId());
    }
  }, [sessionId, setSessionId]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessageId = generateId();
      const assistantMessageId = generateId();

      // Add user message
      addMessage({
        id: userMessageId,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      });

      // Add loading assistant message
      addMessage({
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isLoading: true,
      });

      setLoading(true);

      try {
        const response = await api.sendMessage(content, sessionId || undefined);

        // Update assistant message with response
        const assistantMessage: Partial<Message> = {
          content: response.message,
          isLoading: false,
          artifacts: response.artifacts,
          steps: response.steps,
        };

        updateMessage(assistantMessageId, assistantMessage);

        // Add artifacts to store
        response.artifacts.forEach((artifact: Artifact) => {
          addArtifact(artifact);
        });

        // Update session ID if new
        if (response.session_id && response.session_id !== sessionId) {
          setSessionId(response.session_id);
        }
      } catch (error: any) {
        console.error("Error sending message:", error);

        updateMessage(assistantMessageId, {
          content: `Sorry, I encountered an error: ${
            error.message || "Unknown error"
          }. Please try again.`,
          isLoading: false,
        });

        message.error("Failed to send message");
      } finally {
        setLoading(false);
      }
    },
    [
      sessionId,
      isLoading,
      addMessage,
      updateMessage,
      setLoading,
      addArtifact,
      setSessionId,
    ]
  );

  const handleArtifactClick = useCallback(
    (artifactId: string) => {
      // Find artifact in messages
      for (const msg of messages) {
        const artifact = msg.artifacts?.find((a) => a.id === artifactId);
        if (artifact) {
          setSelectedArtifact(artifact);
          return;
        }
      }
    },
    [messages, setSelectedArtifact]
  );

  const handleCloseArtifact = useCallback(() => {
    setSelectedArtifact(null);
  }, [setSelectedArtifact]);

  // Center style for empty state
  const isEmpty = messages.length === 0;

  return (
    <div className={styles.container}>
      <div className={styles.chatSection}>
        {isEmpty ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingBottom: '20vh'
          }}>
             <WelcomeScreen />
             <div style={{ width: '100%', maxWidth: '800px' }}>
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
             </div>
          </div>
        ) : (
          <>
            <ChatMessages
              messages={messages}
              onArtifactClick={handleArtifactClick}
            />
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </>
        )}
      </div>

      {selectedArtifact && (
        <div className={cx(styles.artifactSection)}>
          <ArtifactViewer
            artifact={selectedArtifact}
            onClose={handleCloseArtifact}
          />
        </div>
      )}
    </div>
  );
};
