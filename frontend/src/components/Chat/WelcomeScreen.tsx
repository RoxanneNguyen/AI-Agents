/**
 * Welcome Screen Component - Shown when no messages
 */

import React from "react";
import { createStyles } from "antd-style";
import { Card } from "antd";
import {
  GlobalOutlined,
  BarChartOutlined,
  FileTextOutlined,
  RocketOutlined,
} from "@ant-design/icons";

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
  logo: css`
    font-size: 64px;
    margin-bottom: 16px;
    display: block;
  `,
  title: css`
    font-size: 32px;
    font-weight: 700;
    color: ${token.colorText};
    margin-bottom: 8px;
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

const capabilities = [
  {
    icon: GlobalOutlined,
    title: "Web Browser",
    description:
      "Search and browse the web to gather information and research topics.",
  },
  {
    icon: BarChartOutlined,
    title: "Data Analysis",
    description:
      "Process data, perform calculations, and create visualizations.",
  },
  {
    icon: FileTextOutlined,
    title: "Document Editor",
    description: "Create, edit, and format documents, reports, and code files.",
  },
];

const examples = [
  "Research the latest AI trends and summarize them",
  "Analyze this CSV data and create a chart",
  "Write a Python script to process files",
  "Create a project README document",
  "Compare features of React vs Vue",
  "Generate a weekly report template",
];

export const WelcomeScreen: React.FC = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>🤖</span>
        <h1 className={styles.title}>Welcome to AI Agents Platform</h1>
        <p className={styles.subtitle}>
          I'm Atlas, your AI assistant. I can browse the web, analyze data, and
          create documents. Ask me anything or give me a task to complete.
        </p>
      </div>

      <div className={styles.capabilities}>
        {capabilities.map((cap) => (
          <div key={cap.title} className={styles.capability}>
            <cap.icon className={styles.capabilityIcon} />
            <div className={styles.capabilityTitle}>{cap.title}</div>
            <div className={styles.capabilityDesc}>{cap.description}</div>
          </div>
        ))}
      </div>

      <div className={styles.examples}>
        <div className={styles.examplesTitle}>
          <RocketOutlined />
          Try asking me...
        </div>
        <div className={styles.examplesList}>
          {examples.map((example) => (
            <div key={example} className={styles.example}>
              {example}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
