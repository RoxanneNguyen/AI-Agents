/**
 * Execution Steps Component - Shows the ReAct loop steps
 */

import React, { useState } from "react";
import { createStyles } from "antd-style";
import { Collapse, Tag, Timeline } from "antd";
import {
  BulbOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ExecutionStep } from "../../types";

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    margin-top: 16px;
  `,
  collapse: css`
    background: ${token.colorFillSecondary};
    border-radius: 8px;
    border: none;

    .ant-collapse-header {
      padding: 12px 16px !important;
    }

    .ant-collapse-content-box {
      padding: 0 16px 16px !important;
    }
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  `,
  timeline: css`
    margin-top: 8px;
  `,
  stepItem: css`
    padding-bottom: 8px;
  `,
  stepHeader: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  `,
  stepContent: css`
    font-size: 13px;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgContainer};
    padding: 8px 12px;
    border-radius: 6px;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 150px;
    overflow-y: auto;
  `,
  toolBadge: css`
    font-size: 12px;
  `,
  duration: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
  `,
}));

interface ExecutionStepsProps {
  steps: ExecutionStep[];
}

const getStepIcon = (type: string) => {
  switch (type) {
    case "thought":
      return <BulbOutlined style={{ color: "#faad14" }} />;
    case "action":
      return <ThunderboltOutlined style={{ color: "#1890ff" }} />;
    case "observation":
      return <EyeOutlined style={{ color: "#722ed1" }} />;
    case "final_answer":
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    case "error":
      return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
    default:
      return <BulbOutlined />;
  }
};

const getStepColor = (type: string) => {
  switch (type) {
    case "thought":
      return "gold";
    case "action":
      return "blue";
    case "observation":
      return "purple";
    case "final_answer":
      return "green";
    case "error":
      return "red";
    default:
      return "default";
  }
};

export const ExecutionSteps: React.FC<ExecutionStepsProps> = ({ steps }) => {
  const { styles } = useStyles();
  // Expanded by default only if running or error, otherwise collapsed
  const [expanded, setExpanded] = useState<string[]>([]);

  // Filter out final answer
  const displaySteps = steps.filter(
    (step) => step.type !== "final_answer"
  );

  if (displaySteps.length === 0) return null;

  const currentStep = displaySteps[displaySteps.length - 1];
  const isRunning = displaySteps.some(s => !s.duration_ms && s.type !== "error");
  
  // Minimal status text
  const getStatusText = () => {
    if (!currentStep) return "Ready";
    if (currentStep.type === "error") return "Error encountered";
    if (currentStep.type === "thought") return "Planning...";
    if (currentStep.type === "action") return `Executing: ${currentStep.tool_name || "Action"}`;
    if (currentStep.type === "observation") return "Analyzing results...";
    return "Processing...";
  };

  return (
    <div className={styles.container}>
      <Collapse
        className={styles.collapse}
        ghost
        activeKey={expanded}
        onChange={(keys) => setExpanded(keys as string[])}
        items={[
          {
            key: "steps",
            label: (
              <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   {isRunning ? <ThunderboltOutlined spin /> : <CheckCircleOutlined />}
                   <span>{getStatusText()}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>
                  {displaySteps.length} steps
                </span>
              </div>
            ),
            children: (
              <Timeline
                className={styles.timeline}
                items={displaySteps.map((step) => ({
                  dot: getStepIcon(step.type),
                  children: (
                    <div className={styles.stepItem}>
                      <div className={styles.stepHeader}>
                        <Tag color={getStepColor(step.type)} bordered={false}>
                          {step.type.toUpperCase()}
                        </Tag>
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>
                           {step.tool_name}
                        </span>
                      </div>
                      {/* Only show content if absolutely necessary or debugging */}
                      {/* Minimal UI: hide content by default or show shortened */}
                      <div className={styles.stepContent} style={{ maxHeight: '60px' }}>
                        {step.content.slice(0, 100)}
                        {step.content.length > 100 && "..."}
                      </div>
                    </div>
                  ),
                }))}
              />
            ),
          },
        ]}
      />
    </div>
  );
};
