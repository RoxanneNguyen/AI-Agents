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
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: radial-gradient(110% 80% at 50% 0%, #1e4bba 0%, #0a0a0a 100%);
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
