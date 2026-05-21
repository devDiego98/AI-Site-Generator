import type { ReactNode } from "react";
import { AppHeader } from "@/organisms/AppHeader";
import styles from "./BuilderLayout.module.css";
export interface BuilderLayoutProps {
  projectsSlot: ReactNode;
  editorSlot?: ReactNode;
  outputSlot: ReactNode;
}

export function BuilderLayout({
  projectsSlot,
  editorSlot,
  outputSlot,
}: BuilderLayoutProps) {
  return (
    <div className={styles.layout}>
      <AppHeader />
      <div className={styles.body}>
        {projectsSlot}
        {editorSlot}
        {outputSlot}
      </div>
    </div>
  );
}
