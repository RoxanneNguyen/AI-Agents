/**
 * Welcome Screen Component - Shown when no messages
 */

import React from "react";
import { createStyles } from "antd-style";


const useStyles = createStyles(({ css, token }) => ({
  container: css`
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 24px;
  `,
  header: css`
    text-align: center;
    margin-bottom: 48px;
  `,

  title: css`
    font-size: 42px;
    font-weight: 800;
    margin-bottom: 8px;
    background: transparent;
    color: #ffffff;
    letter-spacing: -0.5px;
  `,
  subtitle: css`
    font-size: 16px;
    color: ${token.colorTextSecondary};
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  `,
  capabilities: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 48px;
  `,
  capability: css`
    background: ${token.colorBgContainer};
    border-radius: 12px;
    padding: 20px;
    border: 1px solid ${token.colorBorderSecondary};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `,
  capabilityIcon: css`
    font-size: 28px;
    color: ${token.colorPrimary};
    margin-bottom: 12px;
    display: block;
  `,
  capabilityTitle: css`
    font-size: 16px;
    font-weight: 600;
    color: ${token.colorText};
    margin-bottom: 8px;
  `,
  capabilityDesc: css`
    font-size: 13px;
    color: ${token.colorTextSecondary};
    line-height: 1.5;
  `,
  examples: css`
    background: ${token.colorFillSecondary};
    border-radius: 12px;
    padding: 24px;
  `,
  examplesTitle: css`
    font-size: 14px;
    font-weight: 600;
    color: ${token.colorText};
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  examplesList: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `,
  example: css`
    background: ${token.colorBgContainer};
    padding: 10px 16px;
    border-radius: 20px;
    font-size: 13px;
    color: ${token.colorText};
    cursor: pointer;
    border: 1px solid ${token.colorBorderSecondary};
    transition: all 0.15s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      color: ${token.colorPrimary};
    }
  `,
}));



export const WelcomeScreen: React.FC = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome to AI Agents Platform</h1>
        <p className={styles.subtitle}>
          I'm Atlas, your AI assistant. I can browse the web, analyze data, and
          create documents. Ask me anything or give me a task to complete.
        </p>
      </div>
    </div>
  );
};
