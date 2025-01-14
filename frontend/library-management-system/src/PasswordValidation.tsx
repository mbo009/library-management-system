import { IconButton, Typography, Stack } from "@mui/material";

interface PasswordInfo {
  passwordTooShort: boolean;
  passwordWithoutUpper: boolean;
  passwordWithoutDigit: boolean;
  passwordWithoutSpecial: boolean;
}

interface PasswordValidationProps {
  passwordInfo: PasswordInfo;
}

interface ValidationItemProps {
  condition: boolean;
  message: string;
}

const PasswordValidation: React.FC<PasswordValidationProps> = ({
  passwordInfo,
}) => {
  const passwordValidationRules = [
    {
      condition: passwordInfo.passwordTooShort,
      message: "Password should be at least 8 characters long",
    },
    {
      condition: passwordInfo.passwordWithoutUpper,
      message: "Password should contain at least 1 uppercase letter",
    },
    {
      condition: passwordInfo.passwordWithoutDigit,
      message: "Password should contain at least 1 digit",
    },
    {
      condition: passwordInfo.passwordWithoutSpecial,
      message: "Password should contain at least 1 special character",
    },
  ];

  const ValidationItem: React.FC<ValidationItemProps> = ({
    condition,
    message,
  }) => (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton size="small">
        {condition ? (
          <span role="img" aria-label="error" style={{ color: "red" }}>
            ✖
          </span>
        ) : (
          <span role="img" aria-label="success" style={{ color: "green" }}>
            ✔
          </span>
        )}
      </IconButton>
      <Typography variant="body2">{message}</Typography>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      {passwordValidationRules.map((rule, index) => (
        <ValidationItem
          key={index}
          condition={rule.condition}
          message={rule.message}
        />
      ))}
    </Stack>
  );
};

export default PasswordValidation;
