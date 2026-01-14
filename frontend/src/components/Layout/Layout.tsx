/**
 * Main Layout Component
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { createStyles } from "antd-style";


const useStyles = createStyles(({ css }) => ({
  layout: css`
    display: flex;
    flex-direction: column;
    background: #0d1a2d;
    min-height: 100vh;
  `,
  container: css`
    display: flex;
    flex: 1;
    overflow: hidden;
  `,
  main: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `,
}));

export const Layout: React.FC = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
