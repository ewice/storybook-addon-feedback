// src/manager.tsx
import { addons, types, useParameter } from "storybook/manager-api";
import { IconButton } from "storybook/internal/components";
import { SupportIcon } from "@storybook/icons";
import { styled as styled8 } from "storybook/theming";

// src/components/SurveyForm.tsx
import { useEffect as useEffect2, useState as useState3 } from "react";
import { styled as styled6 } from "storybook/theming";

// src/hooks/useSurveyStorage.ts
import { useState, useEffect, useCallback } from "react";
var useSurveyStorage = (surveyId) => {
  const completedKey = `sb-survey-completed-${surveyId}`;
  const skippedPermanentlyKey = `sb-survey-skipped-${surveyId}`;
  const dismissedAtKey = `sb-survey-dismissed-at-${surveyId}`;
  const impressionCountKey = `sb-survey-impressions-${surveyId}`;
  const draftKey = `sb-survey-draft-${surveyId}`;
  const [state, setState] = useState(() => {
    try {
      const isCompleted = localStorage.getItem(completedKey) === "true";
      const isSkippedPermanently = localStorage.getItem(skippedPermanentlyKey) === "true";
      const dismissed = localStorage.getItem(dismissedAtKey);
      const dismissedAt = dismissed ? Number(dismissed) : null;
      const impressionCount = parseInt(localStorage.getItem(impressionCountKey) || "0", 10);
      return {
        isCompleted,
        isSkippedPermanently,
        dismissedAt,
        impressionCount
      };
    } catch (e) {
      return {
        isCompleted: false,
        isSkippedPermanently: false,
        dismissedAt: null,
        impressionCount: 0
      };
    }
  });
  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(completedKey) === "true";
      const isSkippedPermanently = localStorage.getItem(skippedPermanentlyKey) === "true";
      const dismissed = localStorage.getItem(dismissedAtKey);
      const dismissedAt = dismissed ? Number(dismissed) : null;
      const impressionCount = parseInt(localStorage.getItem(impressionCountKey) || "0", 10);
      setState({
        isCompleted,
        isSkippedPermanently,
        dismissedAt,
        impressionCount
      });
    } catch (e) {
    }
  }, [completedKey, skippedPermanentlyKey, dismissedAtKey, impressionCountKey]);
  const setCompleted = useCallback(() => {
    try {
      localStorage.setItem(completedKey, "true");
      setState((prev) => ({ ...prev, isCompleted: true }));
    } catch (e) {
      console.error("[Feedback Survey Storage] Failed to set completed state:", e);
    }
  }, [completedKey]);
  const setSkippedPermanently = useCallback(() => {
    try {
      localStorage.setItem(skippedPermanentlyKey, "true");
      setState((prev) => ({ ...prev, isSkippedPermanently: true }));
    } catch (e) {
      console.error("[Feedback Survey Storage] Failed to set skippedPermanently state:", e);
    }
  }, [skippedPermanentlyKey]);
  const setDismissed = useCallback((timestamp) => {
    try {
      localStorage.setItem(dismissedAtKey, String(timestamp));
      setState((prev) => ({ ...prev, dismissedAt: timestamp }));
    } catch (e) {
      console.error("[Feedback Survey Storage] Failed to set dismissed state:", e);
    }
  }, [dismissedAtKey]);
  const incrementImpressions = useCallback(() => {
    let nextCount = 0;
    try {
      const current = parseInt(localStorage.getItem(impressionCountKey) || "0", 10);
      nextCount = current + 1;
      localStorage.setItem(impressionCountKey, String(nextCount));
      setState((prev) => ({ ...prev, impressionCount: nextCount }));
    } catch (e) {
      console.error("[Feedback Survey Storage] Failed to increment impression count:", e);
    }
    return nextCount;
  }, [impressionCountKey]);
  const getDraft = useCallback(() => {
    try {
      const draft = sessionStorage.getItem(draftKey);
      return draft ? JSON.parse(draft) : {};
    } catch (e) {
      return {};
    }
  }, [draftKey]);
  const saveDraft = useCallback((values) => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(values));
    } catch (e) {
      console.error("[Feedback Survey Storage] Failed to save draft values:", e);
    }
  }, [draftKey]);
  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(draftKey);
    } catch (e) {
      console.error("[Feedback Survey Storage] Failed to clear draft values:", e);
    }
  }, [draftKey]);
  return {
    ...state,
    setCompleted,
    setSkippedPermanently,
    setDismissed,
    incrementImpressions,
    getDraft,
    saveDraft,
    clearDraft
  };
};

// src/components/ui/Choice.tsx
import { styled } from "storybook/theming";

// src/components/ui/styles.ts
var uiFontFamily = '"Nunito Sans", -apple-system, sans-serif';
var focusRing = (theme) => ({
  outline: "2px solid transparent",
  boxShadow: `0 0 0 2px ${theme.background.content}, 0 0 0 4px ${theme.barSelectedColor}`
});
var modalCardShadow = (theme) => theme.base === "dark" ? "0 12px 36px rgba(0, 0, 0, 0.35)" : "0 12px 36px rgba(38, 85, 115, 0.15)";
var mutedTextStyles = (theme) => theme.base === "dark" ? { color: theme.textColor, opacity: 0.88 } : { color: theme.textMutedColor };
var fieldTextStyles = (theme) => ({
  fontSize: "13px",
  color: theme.textColor
});

// src/components/ui/Choice.tsx
var ChoiceGroup = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "4px 0"
});
var ChoiceRow = styled.label(({ theme }) => ({
  ...fieldTextStyles(theme),
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minHeight: "32px",
  cursor: "pointer",
  userSelect: "none",
  borderRadius: "4px",
  "&:focus-within": focusRing(theme)
}));
var ChoiceInput = styled.input(({ theme }) => ({
  cursor: "pointer",
  accentColor: theme.barSelectedColor
}));

// src/components/inputs/CheckboxGroupInput.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var CheckboxGroupInput = ({
  name,
  options,
  values = [],
  onChange,
  ariaDescribedBy,
  ariaInvalid
}) => {
  return /* @__PURE__ */ jsx(ChoiceGroup, { children: options.map((option, index) => {
    const isChecked = values.includes(option);
    return /* @__PURE__ */ jsxs(ChoiceRow, { htmlFor: `${name}-${index}`, children: [
      /* @__PURE__ */ jsx(
        ChoiceInput,
        {
          id: `${name}-${index}`,
          type: "checkbox",
          checked: isChecked,
          onChange: (e) => onChange(option, e.target.checked),
          "aria-describedby": ariaDescribedBy,
          "aria-invalid": ariaInvalid || void 0
        }
      ),
      option
    ] }, option);
  }) });
};

// src/components/inputs/RadioGroupInput.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var RadioGroupInput = ({
  name,
  options,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid
}) => {
  return /* @__PURE__ */ jsx2(ChoiceGroup, { children: options.map((option, index) => /* @__PURE__ */ jsxs2(ChoiceRow, { htmlFor: `${name}-${index}`, children: [
    /* @__PURE__ */ jsx2(
      ChoiceInput,
      {
        id: `${name}-${index}`,
        type: "radio",
        name,
        checked: value === option,
        onChange: () => onChange(option),
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid || void 0
      }
    ),
    option
  ] }, option)) });
};

// src/components/inputs/StarRatingInput.tsx
import { useState as useState2 } from "react";
import { styled as styled2 } from "storybook/theming";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var StarsContainer = styled2.div({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "4px 0"
});
var VisuallyHiddenInput = styled2.input({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0
});
var StarOption = styled2.label(({ theme, active, hoverActive }) => ({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "44px",
  minHeight: "44px",
  borderRadius: "6px",
  cursor: "pointer",
  padding: 0,
  color: hoverActive || active ? theme.barSelectedColor : theme.appBorderColor,
  transition: "transform 0.1s, color 0.1s, box-shadow 0.2s",
  "&:hover": {
    transform: "scale(1.15)"
  },
  "&:focus-within": focusRing(theme)
}));
var StarIcon = () => /* @__PURE__ */ jsx3("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx3("path", { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" }) });
var StarRatingInput = ({
  name,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid
}) => {
  const [hoverRating, setHoverRating] = useState2(0);
  return /* @__PURE__ */ jsx3(StarsContainer, { children: [1, 2, 3, 4, 5].map((starValue) => {
    const active = value >= starValue;
    const hoverActive = hoverRating >= starValue;
    return /* @__PURE__ */ jsxs3(
      StarOption,
      {
        active,
        hoverActive,
        onMouseEnter: () => setHoverRating(starValue),
        onMouseLeave: () => setHoverRating(0),
        onFocus: () => setHoverRating(starValue),
        onBlur: () => setHoverRating(0),
        children: [
          /* @__PURE__ */ jsx3(
            VisuallyHiddenInput,
            {
              id: `${name}-${starValue}`,
              type: "radio",
              name,
              value: String(starValue),
              checked: value === starValue,
              onChange: () => onChange(starValue),
              "aria-label": `${starValue} out of 5 stars`,
              "aria-describedby": ariaDescribedBy,
              "aria-invalid": ariaInvalid || void 0
            }
          ),
          /* @__PURE__ */ jsx3(StarIcon, {})
        ]
      },
      starValue
    );
  }) });
};

// src/components/inputs/TextInputFields.tsx
import { styled as styled3 } from "storybook/theming";
import { jsx as jsx4 } from "react/jsx-runtime";
var InputText = styled3.input(({ theme }) => ({
  padding: "8px 12px",
  minHeight: "36px",
  fontSize: "13px",
  borderRadius: "4px",
  border: `1px solid ${theme.appBorderColor}`,
  backgroundColor: theme.background.app,
  color: theme.textColor,
  transition: "border-color 0.2s, box-shadow 0.2s",
  "&:focus-visible": {
    borderColor: theme.barSelectedColor,
    ...focusRing(theme)
  }
}));
var TextArea = styled3.textarea(({ theme }) => ({
  padding: "8px 12px",
  fontSize: "13px",
  borderRadius: "4px",
  border: `1px solid ${theme.appBorderColor}`,
  backgroundColor: theme.background.app,
  color: theme.color.primary,
  resize: "vertical",
  minHeight: "80px",
  transition: "border-color 0.2s, box-shadow 0.2s",
  "&:focus-visible": {
    borderColor: theme.barSelectedColor,
    ...focusRing(theme)
  }
}));
var TextInputField = ({
  id,
  placeholder,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  required
}) => {
  return /* @__PURE__ */ jsx4(
    InputText,
    {
      type: "text",
      id,
      placeholder,
      value,
      onChange: (e) => onChange(e.target.value),
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid || void 0,
      required
    }
  );
};
var TextAreaField = ({
  id,
  placeholder,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  required
}) => {
  return /* @__PURE__ */ jsx4(
    TextArea,
    {
      id,
      placeholder,
      value,
      onChange: (e) => onChange(e.target.value),
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid || void 0,
      required
    }
  );
};

// src/components/ui/Button.tsx
import { styled as styled4 } from "storybook/theming";
import { jsx as jsx5 } from "react/jsx-runtime";
var StyledButton = styled4.button(({ theme, $variant, disabled }) => {
  const baseStyles = {
    padding: "8px 16px",
    minHeight: "36px",
    minWidth: "36px",
    fontSize: "13px",
    fontWeight: "700",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s, border-color 0.2s, color 0.2s",
    "&:focus-visible": focusRing(theme)
  };
  if ($variant === "secondary") {
    return {
      ...baseStyles,
      border: `1px solid ${theme.appBorderColor}`,
      backgroundColor: theme.background.content,
      color: theme.textColor,
      "&:hover": disabled ? void 0 : {
        backgroundColor: theme.background.app
      }
    };
  }
  if ($variant === "dangerSubtle") {
    return {
      ...baseStyles,
      border: `1px solid ${theme.color.negative}`,
      backgroundColor: "transparent",
      color: theme.color.negative,
      "&:hover": disabled ? void 0 : {
        backgroundColor: theme.base === "dark" ? `color-mix(in srgb, ${theme.color.negative} 14%, transparent)` : `color-mix(in srgb, ${theme.color.negative} 8%, transparent)`
      }
    };
  }
  return {
    ...baseStyles,
    border: "none",
    backgroundColor: disabled ? theme.appBorderColor : theme.color.secondary,
    color: theme.textInverseColor,
    "&:hover": disabled ? void 0 : {
      backgroundColor: theme.color.secondaryHot || theme.color.secondary
    }
  };
});
var Button = ({
  variant = "primary",
  type = "button",
  ...props
}) => /* @__PURE__ */ jsx5(StyledButton, { type, $variant: variant, ...props });

// src/components/ui/Field.tsx
import { styled as styled5 } from "storybook/theming";
import { Fragment, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var FieldContainer = styled5.div({
  display: "flex",
  flexDirection: "column",
  gap: "6px"
});
var GroupFieldContainer = styled5.fieldset({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  margin: 0,
  padding: 0,
  border: "none",
  minWidth: 0
});
var Label = styled5.label(({ theme }) => ({
  ...fieldTextStyles(theme),
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  gap: "4px"
}));
var Legend = styled5.legend(({ theme }) => ({
  ...fieldTextStyles(theme),
  fontWeight: "700",
  marginBottom: "6px",
  padding: 0
}));
var RequiredAsterisk = styled5.span(({ theme }) => ({
  color: theme.color.negative
}));
var VisuallyHidden = styled5.span({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0
});
var ErrorText = styled5.p(({ theme }) => ({
  fontSize: "11px",
  color: theme.color.negative,
  margin: "2px 0 0 0"
}));
var ErrorSummaryContainer = styled5.div(({ theme }) => ({
  border: `1px solid ${theme.color.negative}`,
  borderRadius: "6px",
  padding: "12px",
  backgroundColor: theme.base === "dark" ? `color-mix(in srgb, ${theme.color.negative} 14%, transparent)` : `color-mix(in srgb, ${theme.color.negative} 8%, transparent)`,
  color: theme.textColor
}));
var ErrorSummaryTitle = styled5.p({
  margin: "0 0 6px 0",
  fontSize: "13px",
  fontWeight: "700"
});
var ErrorSummaryList = styled5.ul({
  margin: 0,
  paddingLeft: "18px",
  fontSize: "12px"
});
var LabelContent = ({ label, required }) => /* @__PURE__ */ jsxs4(Fragment, { children: [
  label,
  required && /* @__PURE__ */ jsxs4(Fragment, { children: [
    /* @__PURE__ */ jsx6(RequiredAsterisk, { "aria-hidden": "true", children: "*" }),
    /* @__PURE__ */ jsx6(VisuallyHidden, { children: "Required" })
  ] })
] });
var Field = ({ id, label, required, error, children }) => {
  const errorId = error ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxs4(FieldContainer, { children: [
    /* @__PURE__ */ jsx6(Label, { htmlFor: id, children: /* @__PURE__ */ jsx6(LabelContent, { label, required }) }),
    children({ describedBy: errorId, invalid: !!error }),
    error && /* @__PURE__ */ jsx6(ErrorText, { id: errorId, role: "alert", children: error })
  ] });
};
var Fieldset = ({ id, label, required, error, children }) => {
  const errorId = error ? `${id}-error` : void 0;
  return /* @__PURE__ */ jsxs4(GroupFieldContainer, { children: [
    /* @__PURE__ */ jsx6(Legend, { children: /* @__PURE__ */ jsx6(LabelContent, { label, required }) }),
    children({ describedBy: errorId, invalid: !!error }),
    error && /* @__PURE__ */ jsx6(ErrorText, { id: errorId, role: "alert", children: error })
  ] });
};
var ErrorSummary = ({ items }) => /* @__PURE__ */ jsxs4(ErrorSummaryContainer, { role: "alert", "aria-live": "assertive", children: [
  /* @__PURE__ */ jsx6(ErrorSummaryTitle, { children: "Please review the highlighted fields." }),
  /* @__PURE__ */ jsx6(ErrorSummaryList, { children: items.map(({ id, label, message }) => /* @__PURE__ */ jsxs4("li", { children: [
    label,
    ": ",
    message
  ] }, id)) })
] });

// src/components/SurveyForm.tsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var FormContainer = styled6.form({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  fontFamily: uiFontFamily
});
var FooterActions = styled6.div({
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "8px",
  "& > *:first-of-type": {
    marginRight: "auto"
  }
});
var CenteredActions = styled6.div({
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginTop: "24px"
});
var SubmissionError = styled6.p(({ theme }) => ({
  margin: 0,
  fontSize: "11px",
  color: theme.color.negative,
  textAlign: "center"
}));
var ThankYouContainer = styled6.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
  textAlign: "center",
  color: theme.textColor
}));
var ThankYouTitle = styled6.h3(({ theme }) => ({
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 8px 0",
  color: theme.textColor
}));
var ThankYouText = styled6.p(({ theme }) => ({
  fontSize: "13px",
  margin: 0,
  ...mutedTextStyles(theme)
}));
var SurveyForm = ({
  config,
  isCompleted,
  onSubmit,
  onClose,
  onSkipPermanent
}) => {
  const storage = useSurveyStorage(config.surveyId);
  const [values, setValues] = useState3(() => storage.getDraft());
  const [errors, setErrors] = useState3({});
  const [isSubmitting, setIsSubmitting] = useState3(false);
  const [isSubmitted, setIsSubmitted] = useState3(() => !!isCompleted);
  useEffect2(() => {
    if (!isSubmitted) {
      storage.saveDraft(values);
    }
  }, [isSubmitted, storage, values]);
  const handleFieldChange = (fieldId, nextValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: nextValue }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };
  const handleCheckboxChange = (fieldId, option, checked) => {
    const current = values[fieldId] || [];
    const next = checked ? [...current, option] : current.filter((item) => item !== option);
    handleFieldChange(fieldId, next);
  };
  const focusQuestion = (questionId) => {
    const question = config.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }
    const targetId = question.type === "rating" ? `${question.id}-1` : question.type === "radio" || question.type === "checkbox" ? `${question.id}-0` : question.id;
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.focus();
    });
  };
  const validate = () => {
    const nextErrors = {};
    config.questions.forEach((question) => {
      if (!question.required) {
        return;
      }
      const value = values[question.id];
      if (question.type === "checkbox") {
        if (!value || value.length === 0) {
          nextErrors[question.id] = "Please select at least one option.";
        }
        return;
      }
      if (question.type === "rating") {
        if (!value || value === 0) {
          nextErrors[question.id] = "Please select a rating.";
        }
        return;
      }
      if (!value || typeof value === "string" && value.trim() === "") {
        nextErrors[question.id] = "This field is required.";
      }
    });
    setErrors(nextErrors);
    const firstInvalidQuestionId = config.questions.find((question) => nextErrors[question.id])?.id;
    if (firstInvalidQuestionId) {
      focusQuestion(firstInvalidQuestionId);
    }
    return Object.keys(nextErrors).length === 0;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      storage.clearDraft();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit survey:", error);
      setErrors({ submit: "Failed to submit feedback. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderQuestion = (question) => {
    const error = errors[question.id];
    const commonProps = {
      id: question.id,
      label: question.label,
      required: question.required,
      error
    };
    if (question.type === "rating") {
      return /* @__PURE__ */ jsx7(Fieldset, { ...commonProps, children: ({ describedBy, invalid }) => /* @__PURE__ */ jsx7(
        StarRatingInput,
        {
          name: question.id,
          value: values[question.id] || 0,
          onChange: (rating) => handleFieldChange(question.id, rating),
          ariaDescribedBy: describedBy,
          ariaInvalid: invalid
        }
      ) }, question.id);
    }
    if (question.type === "radio" && question.options) {
      return /* @__PURE__ */ jsx7(Fieldset, { ...commonProps, children: ({ describedBy, invalid }) => /* @__PURE__ */ jsx7(
        RadioGroupInput,
        {
          name: question.id,
          options: question.options,
          value: values[question.id] || "",
          onChange: (option) => handleFieldChange(question.id, option),
          ariaDescribedBy: describedBy,
          ariaInvalid: invalid
        }
      ) }, question.id);
    }
    if (question.type === "checkbox" && question.options) {
      return /* @__PURE__ */ jsx7(Fieldset, { ...commonProps, children: ({ describedBy, invalid }) => /* @__PURE__ */ jsx7(
        CheckboxGroupInput,
        {
          name: question.id,
          options: question.options,
          values: values[question.id] || [],
          onChange: (option, checked) => handleCheckboxChange(question.id, option, checked),
          ariaDescribedBy: describedBy,
          ariaInvalid: invalid
        }
      ) }, question.id);
    }
    if (question.type === "textarea") {
      return /* @__PURE__ */ jsx7(Field, { ...commonProps, children: ({ describedBy, invalid }) => /* @__PURE__ */ jsx7(
        TextAreaField,
        {
          id: question.id,
          placeholder: question.placeholder,
          value: values[question.id] || "",
          onChange: (text) => handleFieldChange(question.id, text),
          ariaDescribedBy: describedBy,
          ariaInvalid: invalid,
          required: question.required
        }
      ) }, question.id);
    }
    return /* @__PURE__ */ jsx7(Field, { ...commonProps, children: ({ describedBy, invalid }) => /* @__PURE__ */ jsx7(
      TextInputField,
      {
        id: question.id,
        placeholder: question.placeholder,
        value: values[question.id] || "",
        onChange: (text) => handleFieldChange(question.id, text),
        ariaDescribedBy: describedBy,
        ariaInvalid: invalid,
        required: question.required
      }
    ) }, question.id);
  };
  if (isSubmitted) {
    return /* @__PURE__ */ jsxs5(ThankYouContainer, { role: "status", "aria-live": "polite", children: [
      /* @__PURE__ */ jsx7(ThankYouTitle, { children: "Thank you!" }),
      /* @__PURE__ */ jsx7(ThankYouText, { children: "Your feedback has been successfully submitted." }),
      /* @__PURE__ */ jsx7(CenteredActions, { children: /* @__PURE__ */ jsx7(Button, { onClick: onClose, children: "Close" }) })
    ] });
  }
  const errorSummaryItems = config.questions.filter((question) => errors[question.id]).map((question) => ({
    id: question.id,
    label: question.label,
    message: errors[question.id]
  }));
  return /* @__PURE__ */ jsxs5(FormContainer, { onSubmit: handleSubmit, noValidate: true, children: [
    errorSummaryItems.length > 0 && /* @__PURE__ */ jsx7(ErrorSummary, { items: errorSummaryItems }),
    config.questions.map(renderQuestion),
    errors.submit && /* @__PURE__ */ jsx7(SubmissionError, { role: "alert", children: errors.submit }),
    /* @__PURE__ */ jsxs5(FooterActions, { children: [
      /* @__PURE__ */ jsx7(Button, { variant: "dangerSubtle", onClick: onSkipPermanent, children: "Don't show again" }),
      /* @__PURE__ */ jsx7(Button, { variant: "secondary", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsx7(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Submitting..." : "Submit Feedback" })
    ] })
  ] });
};

// src/components/ui/DialogSurface.tsx
import React3 from "react";
import { styled as styled7 } from "storybook/theming";
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var DialogRoot = styled7.dialog({
  padding: 0,
  border: "none",
  background: "transparent",
  width: "min(520px, calc(100vw - 32px))",
  maxWidth: "520px",
  maxHeight: "85vh",
  overflow: "visible",
  zIndex: 999999,
  fontFamily: uiFontFamily,
  whiteSpace: "normal",
  "&::backdrop": {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(3px)"
  }
});
var Card = styled7.div(({ theme }) => ({
  backgroundColor: theme.background.content,
  borderRadius: "8px",
  border: `1px solid ${theme.appBorderColor}`,
  boxShadow: modalCardShadow(theme),
  width: "100%",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  animation: "sbSurveyFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
  "@keyframes sbSurveyFadeIn": {
    from: {
      opacity: 0,
      transform: "translateY(12px) scale(0.97)"
    },
    to: {
      opacity: 1,
      transform: "translateY(0) scale(1)"
    }
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none"
  }
}));
var Header = styled7.div(({ theme }) => ({
  padding: "20px 24px 16px",
  borderBottom: `1px solid ${theme.appBorderColor}`,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  minWidth: 0,
  overflow: "hidden"
}));
var HeaderTopRow = styled7.div({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  minWidth: 0
});
var Title = styled7.h2(({ theme }) => ({
  fontSize: "18px",
  fontWeight: "800",
  margin: 0,
  color: theme.textColor,
  minWidth: 0,
  overflowWrap: "anywhere"
}));
var Description = styled7.p(({ theme }) => ({
  fontSize: "13px",
  margin: 0,
  lineHeight: "18px",
  minWidth: 0,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  ...mutedTextStyles(theme)
}));
var CloseButton = styled7.button(({ theme }) => ({
  flexShrink: 0,
  minWidth: "32px",
  minHeight: "32px",
  padding: "4px",
  border: "none",
  borderRadius: "4px",
  background: "none",
  color: theme.textMutedColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background-color 0.2s, color 0.2s",
  "&:hover": {
    backgroundColor: theme.appBorderColor,
    color: theme.textColor
  },
  "&:focus-visible": focusRing(theme)
}));
var Body = styled7.div({
  padding: "20px 24px 24px",
  overflowY: "auto",
  flex: 1
});
var CloseIcon = () => /* @__PURE__ */ jsxs6("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ jsx8("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ jsx8("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
var DialogSurface = ({
  isOpen,
  title,
  description,
  onClose,
  children
}) => {
  const dialogRef = React3.useRef(null);
  const titleId = React3.useId();
  const descriptionId = React3.useId();
  React3.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) {
      return;
    }
    const handleCancel = (event) => {
      event.preventDefault();
      onClose();
    };
    const handleBackdropClick = (event) => {
      if (event.target === dialog) {
        onClose();
      }
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleBackdropClick);
    if (!dialog.open) {
      dialog.showModal();
    }
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleBackdropClick);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen, onClose]);
  if (!isOpen) {
    return null;
  }
  return /* @__PURE__ */ jsx8(
    DialogRoot,
    {
      ref: dialogRef,
      "aria-labelledby": titleId,
      "aria-describedby": description ? descriptionId : void 0,
      children: /* @__PURE__ */ jsxs6(Card, { children: [
        /* @__PURE__ */ jsxs6(Header, { children: [
          /* @__PURE__ */ jsxs6(HeaderTopRow, { children: [
            /* @__PURE__ */ jsx8(Title, { id: titleId, children: title }),
            /* @__PURE__ */ jsx8(CloseButton, { onClick: onClose, "aria-label": "Close survey", autoFocus: true, children: /* @__PURE__ */ jsx8(CloseIcon, {}) })
          ] }),
          description && /* @__PURE__ */ jsx8(Description, { id: descriptionId, children: description })
        ] }),
        /* @__PURE__ */ jsx8(Body, { children })
      ] })
    }
  );
};

// src/components/SurveyModal.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
var SurveyModal = ({
  isOpen,
  config,
  isCompleted,
  onSubmit,
  onClose,
  onSkipPermanent
}) => /* @__PURE__ */ jsx9(
  DialogSurface,
  {
    isOpen,
    title: config.title,
    description: config.description,
    onClose,
    children: /* @__PURE__ */ jsx9(
      SurveyForm,
      {
        config,
        isCompleted,
        onSubmit,
        onClose,
        onSkipPermanent
      },
      config.surveyId
    )
  }
);

// src/hooks/useSurveyLifecycle.ts
import { useEffect as useEffect3, useState as useState4, useRef } from "react";
var useSurveyLifecycle = ({
  config,
  isCompleted,
  isSkippedPermanently,
  dismissedAt,
  impressionCount,
  incrementImpressions,
  api
}) => {
  const [isOpen, setIsOpen] = useState4(false);
  const [navCount, setNavCount] = useState4(0);
  const timerRef = useRef(null);
  const triggerOptions = config.trigger || {};
  const isExpired = triggerOptions.expiresAt ? /* @__PURE__ */ new Date() > new Date(triggerOptions.expiresAt) : false;
  const isGloballyDisabled = config.enabled === false;
  const isMaxImpressionsReached = !!triggerOptions.maxImpressions && impressionCount >= triggerOptions.maxImpressions;
  let isSnoozed = false;
  if (dismissedAt && triggerOptions.coolDownDays) {
    const coolDownMs = triggerOptions.coolDownDays * 24 * 60 * 60 * 1e3;
    const timeSinceDismissal = Date.now() - dismissedAt;
    if (timeSinceDismissal < coolDownMs) {
      isSnoozed = true;
    }
  }
  const shouldBlockAutoPopup = isCompleted || isSkippedPermanently || isExpired || isGloballyDisabled || isMaxImpressionsReached || isSnoozed;
  useEffect3(() => {
    if (shouldBlockAutoPopup || isOpen || !config.questions || config.questions.length === 0) {
      return;
    }
    const delay = triggerOptions.delayMs !== void 0 ? triggerOptions.delayMs : 5e3;
    if (delay > 0) {
      timerRef.current = setTimeout(() => {
        incrementImpressions();
        setIsOpen(true);
      }, delay);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    shouldBlockAutoPopup,
    config.questions,
    triggerOptions.delayMs,
    isOpen,
    incrementImpressions
  ]);
  useEffect3(() => {
    const handleStoryChanged = () => {
      setNavCount((prev) => {
        const nextCount = prev + 1;
        const requiredNavs = triggerOptions.storyCount !== void 0 ? triggerOptions.storyCount : 3;
        if (!shouldBlockAutoPopup && !isOpen && requiredNavs > 0 && nextCount >= requiredNavs) {
          incrementImpressions();
          setIsOpen(true);
        }
        return nextCount;
      });
    };
    api.on("storyChanged", handleStoryChanged);
    return () => {
      api.off("storyChanged", handleStoryChanged);
    };
  }, [api, shouldBlockAutoPopup, triggerOptions.storyCount, isOpen, incrementImpressions]);
  useEffect3(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return {
    isOpen,
    setIsOpen,
    shouldBlockAutoPopup,
    navCount
  };
};

// src/utils/api.ts
var submitFeedbackWebhook = async (config, responses) => {
  const payload = {
    surveyId: config.surveyId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    responses
  };
  if (!config.webhookUrl) {
    return payload;
  }
  const headers = {
    "Content-Type": "application/json",
    ...config.webhookHeaders || {}
  };
  try {
    const res = await fetch(config.webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}: ${res.statusText}`);
    }
  } catch (err) {
    console.error("[Feedback Survey Addon] Webhook submission failed:", err);
    throw err;
  }
  return payload;
};

// src/manager.tsx
import { Fragment as Fragment2, jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
var ADDON_ID = "storybook-feedback-survey";
var TOOL_ID = `${ADDON_ID}/tool`;
var IconWrapper = styled8.div({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
});
var NotificationDot = styled8.div(({ theme }) => ({
  position: "absolute",
  top: "2px",
  right: "2px",
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: theme.color.negative || "#FF4400"
}));
var SurveyManager = ({ api }) => {
  const buildTimeOptions = typeof STORYBOOK_FEEDBACK_SURVEY_OPTIONS !== "undefined" ? STORYBOOK_FEEDBACK_SURVEY_OPTIONS : {};
  const parameterOptions = useParameter("feedbackSurvey", null);
  const config = {
    surveyId: "default-survey-v1",
    title: "Feedback Survey",
    description: "Help us improve by sharing your thoughts!",
    questions: [],
    ...buildTimeOptions,
    ...parameterOptions
  };
  const storage = useSurveyStorage(config.surveyId);
  const { isOpen, setIsOpen, shouldBlockAutoPopup } = useSurveyLifecycle({
    config,
    isCompleted: storage.isCompleted,
    isSkippedPermanently: storage.isSkippedPermanently,
    dismissedAt: storage.dismissedAt,
    impressionCount: storage.impressionCount,
    incrementImpressions: storage.incrementImpressions,
    api
  });
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    if (!storage.isCompleted) {
      storage.setDismissed(Date.now());
    }
  };
  const handleSkipPermanent = () => {
    setIsOpen(false);
    storage.setSkippedPermanently();
  };
  const handleSubmit = async (responses) => {
    const payload = await submitFeedbackWebhook(config, responses);
    const channel = api.getChannel();
    channel.emit("feedback-survey/submitted", payload);
    console.log("[Feedback Survey Addon] Feedback submitted successfully:", payload);
    storage.setCompleted();
  };
  if (!config.questions || config.questions.length === 0) {
    return null;
  }
  const showNotification = !storage.isCompleted && !storage.isSkippedPermanently;
  return /* @__PURE__ */ jsxs7(Fragment2, { children: [
    /* @__PURE__ */ jsx10(
      IconButton,
      {
        title: "Share your feedback",
        "aria-label": "Share your feedback",
        onClick: handleOpen,
        children: /* @__PURE__ */ jsxs7(IconWrapper, { children: [
          /* @__PURE__ */ jsx10(SupportIcon, {}),
          showNotification && /* @__PURE__ */ jsx10(NotificationDot, {})
        ] })
      },
      "feedback-survey-toolbar-button"
    ),
    /* @__PURE__ */ jsx10(
      SurveyModal,
      {
        isOpen,
        config,
        isCompleted: storage.isCompleted,
        onSubmit: handleSubmit,
        onClose: handleClose,
        onSkipPermanent: handleSkipPermanent
      },
      config.surveyId
    )
  ] });
};
addons.register(ADDON_ID, (api) => {
  addons.add(TOOL_ID, {
    title: "Feedback Survey",
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === "story",
    render: () => /* @__PURE__ */ jsx10(SurveyManager, { api })
  });
});
