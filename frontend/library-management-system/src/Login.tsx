import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Box,
  Container,
  Tabs,
  Tab,
  CssBaseline,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import PasswordValidation from "./PasswordValidation";
import transition from "./utils/transition";

interface PasswordInfo {
  passwordTooShort: boolean;
  passwordWithoutUpper: boolean;
  passwordWithoutDigit: boolean;
  passwordWithoutSpecial: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<number>(0);
  const [checked, setChecked] = useState<boolean>(false);
  const [passwordInfo, setPasswordInfo] = useState<PasswordInfo>({
    passwordTooShort: true,
    passwordWithoutUpper: true,
    passwordWithoutDigit: true,
    passwordWithoutSpecial: true,
  });
  const [showPasswordValidation, setShowPasswordValidation] =
    useState<boolean>(false);
  const [formShift, setFormShift] = useState<number>(0);
  const [confirmFormShift, setConfirmFormShift] = useState<number>(0);
  const [confirmPasswordMatch, setConfirmPasswordMatch] =
    useState<boolean>(true);

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>): void => {
    setChecked(event.target.checked);
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setTab(newValue);
  };

  const parsePassword = (event: ChangeEvent<HTMLInputElement>): void => {
    const password = event.target.value;
    setPasswordInfo({
      passwordTooShort: password.length < 8,
      passwordWithoutUpper: password === password.toLowerCase(),
      passwordWithoutDigit: !/\d/.test(password),
      passwordWithoutSpecial: !/[~`!@#$%^&*()-+=:;"'<>,]/.test(password),
    });
    handleConfirmPasswordChange();
  };

  const handlePasswordFocus = (): void => {
    setShowPasswordValidation(true);
    setFormShift(180);
  };

  const handlePasswordBlur = (): void => {
    setShowPasswordValidation(false);
    setFormShift(0);
  };

  const handleConfirmPasswordChange = (): void => {
    const confirmPassword = (
      document.getElementById("confirm-password") as HTMLInputElement
    )?.value;
    const password = (document.getElementById("password") as HTMLInputElement)
      ?.value;
    const isPasswordSame = confirmPassword === password;
    if (confirmPassword) {
      setConfirmPasswordMatch(isPasswordSame);
      setConfirmFormShift(isPasswordSame ? 0 : 45);
    } else {
      setConfirmPasswordMatch(true);
      setConfirmFormShift(0);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const responseBody = {
      userID: "12345",
      isAdmin: true,
      activeGames: [
        { id: "1", name: "Polowanie na karasie" },
        { id: "2", name: "Hula hop z Trzaskowskim" },
      ],
      pastGames: [
        { id: "3", name: "Odwzorowanie bitwy o Psie Pole " },
        { id: "4", name: "Inauguracja prezydenta miasta Cycowa" },
      ],
    };
    localStorage.setItem("user", JSON.stringify(responseBody));
    navigate("/home");
  };

  return (
    <CssBaseline>
      <Container maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box sx={{ width: "100%", marginBottom: 3 }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="secondary"
            >
              <Tab label="ZALOGUJ SIĘ" />
              <Tab label="UTWÓRZ KONTO" />
            </Tabs>
          </Box>

          {tab === 0 ? (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ width: "100%", minHeight: "350px" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                color="secondary"
                label="e-mail/Nazwa użytkownika"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Hasło"
                type="password"
                id="password"
                color="secondary"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                ZALOGUJ SIĘ
              </Button>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ width: "100%", minHeight: "350px" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="e-mail"
                name="email"
                autoComplete="email"
                color="secondary"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nazwa użytkownika"
                name="username"
                autoComplete="username"
                color="secondary"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Hasło"
                type="password"
                id="password"
                autoComplete="new-password"
                color="secondary"
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                onChange={parsePassword}
              />
              <Box
                position="absolute"
                sx={{
                  opacity: showPasswordValidation ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  visibility: showPasswordValidation ? "visible" : "hidden",
                }}
              >
                <PasswordValidation passwordInfo={passwordInfo} />
              </Box>
              <Box
                sx={{
                  transition: "transform 0.3s ease",
                  transform: `translateY(${formShift}px)`,
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Powtórz hasło"
                  type="password"
                  id="confirm-password"
                  autoComplete="new-password"
                  color="secondary"
                  onChange={handleConfirmPasswordChange}
                />
                <Box
                  position="absolute"
                  sx={{
                    color: "red",
                    fontSize: "0.875rem",
                    marginTop: 1,
                    opacity: confirmPasswordMatch ? 0 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small">
                      <span
                        role="img"
                        aria-label="error"
                        style={{ color: "red" }}
                      >
                        ✖
                      </span>
                    </IconButton>
                    <Typography variant="body2">
                      {"Hasła nie są takie same!"}
                    </Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    transition: "transform 0.3s ease",
                    transform: `translateY(${confirmFormShift}px)`,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={handleCheckbox}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    }
                    label="Czy jesteś administratorem?"
                  />
                  <TextField
                    disabled={!checked}
                    variant={!checked ? "filled" : "outlined"}
                    margin="normal"
                    fullWidth
                    name="adminToken"
                    label="Admin token"
                    type="text"
                    id="admin-token"
                    color="secondary"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    UTWÓRZ KONTO
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </CssBaseline>
  );
};

export default transition(Login);
