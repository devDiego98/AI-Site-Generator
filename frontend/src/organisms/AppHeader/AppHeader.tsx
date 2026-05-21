import { Text } from "@/atoms/Text";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Text variant="h2" color="primary">
          AI UI Builder
        </Text>
      </div>
      <Text variant="caption" color="muted">
        Describe an interface · Preview or inspect code
      </Text>
    </header>
  );
}
