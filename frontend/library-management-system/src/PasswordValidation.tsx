import PropTypes from "prop-types";
import { IconButton, Typography, Stack } from "@mui/material";

const PasswordValidation = ({ passwordInfo }) => {
  const passwordValidationRules = [
    {
      condition: passwordInfo.passwordTooShort,
      message: "Długość hasła powinna wynosić przynajmniej 8 znaków",
    },
    {
      condition: passwordInfo.passwordWithoutUpper,
      message: "Hasło powinno zawierać przynajmniej 1 dużą literę",
    },
    {
      condition: passwordInfo.passwordWithoutDigit,
      message: "Hasło powinno zawierać przynajmniej 1 cyfrę",
    },
    {
      condition: passwordInfo.passwordWithoutSpecial,
      message: "Hasło powinno zawierać przynajmniej 1 znak specjalny",
    },
  ];

  const ValidationItem = ({ condition, message }) => (
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

  ValidationItem.propTypes = {
    condition: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
  };

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

PasswordValidation.propTypes = {
  passwordInfo: PropTypes.shape({
    passwordTooShort: PropTypes.bool.isRequired,
    passwordWithoutUpper: PropTypes.bool.isRequired,
    passwordWithoutDigit: PropTypes.bool.isRequired,
    passwordWithoutSpecial: PropTypes.bool.isRequired,
  }).isRequired,
};

export default PasswordValidation;