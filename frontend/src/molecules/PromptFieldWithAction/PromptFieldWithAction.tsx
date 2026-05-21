import { Button } from "@/atoms/Button";
import { Icon } from "@/atoms/Icon";
import { Text } from "@/atoms/Text";
import { Textarea } from "@/atoms/Textarea";
import styles from "./PromptFieldWithAction.module.css";

export interface PromptFieldWithActionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  canModify: boolean;
  disabled?: boolean;
  error?: string | null;
}

export function PromptFieldWithAction({
  value,
  onChange,
  onSubmit,
  isGenerating,
  canModify,
  disabled = false,
  error = null,
}: PromptFieldWithActionProps) {
  const isEmpty = !value.trim();
  const ctaLabel = canModify ? "Modify page" : "Generate page";
  const loadingLabel = canModify ? "Modifying page…" : "Generating page…";

  return (
    <div className={styles.field}>
      <label htmlFor="editor-prompt" className={styles.label}>
        {canModify ? "Modify your page" : "Describe your page"}
      </label>
      <div className={styles.column}>
        <div className={styles.textareaWrap}>
          <Textarea
            id="editor-prompt"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              canModify
                ? "e.g. Change the hero background to dark blue and make the CTA larger."
                : "e.g. Create a landing page for an AI course for entrepreneurs."
            }
            disabled={disabled || isGenerating}
            hasError={Boolean(error)}
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          isLoading={isGenerating}
          disabled={isEmpty || disabled}
          leftIcon={<Icon name={canModify ? "pencil" : "sparkles"} size={18} />}
          onClick={onSubmit}
        >
          {isGenerating ? loadingLabel : ctaLabel}
        </Button>
      </div>
      {error ? (
        <Text variant="caption" color="accent" className={styles.error}>
          {error}
        </Text>
      ) : (
        <Text variant="caption" color="muted">
          {canModify
            ? "Each modification is saved below. You can revert to any version."
            : "Be specific about layout, sections, and tone."}
        </Text>
      )}
    </div>
  );
}
