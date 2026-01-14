/**
 * Main Layout Component
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@lobehub/ui";
import { createStyles } from "antd-style";


const useStyles = createStyles(({ css, token }) => ({
  layout: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: ${token.colorBgLayout};
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
    <ThemeProvider themeMode="auto">
      <div className={styles.layout}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};
