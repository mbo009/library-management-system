import { useState, ChangeEvent } from "react";
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
  InputAdornment,
} from "@mui/material";
import PasswordValidation from "./PasswordValidation";
import transition from "./utils/transition";
import SHA256 from "crypto-js/sha256";

interface PasswordInfo {
  passwordTooShort: boolean;
  passwordWithoutUpper: boolean;
  passwordWithoutDigit: boolean;
  passwordWithoutSpecial: boolean;
}

// type UserData = {
//   email: string;
//   phoneNumber: string;
//   firstName: string;
//   lastName: string;
//   password: string;
// };

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

  const handleLogin = async (): Promise<Response> => {
    const emailElement = document.getElementById("email") as HTMLInputElement;
    const passwordElement = document.getElementById(
      "password"
    ) as HTMLInputElement;

    const e_mail = emailElement?.value || "";
    const password = SHA256(passwordElement?.value || "").toString();

    const response = await fetch("http://localhost:8000/api/sign_in/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email: e_mail, password_hash: password }),
    });

    return response;
  };

  const handleRegister = async (): Promise<Response> => {
    const e_mail =
      (document.getElementById("email") as HTMLInputElement)?.value || "";
    const password = SHA256(
      (document.getElementById("password") as HTMLInputElement)?.value || ""
    ).toString();
    const firstName =
      (document.getElementById("first-name") as HTMLInputElement)?.value || "";
    const lastName =
      (document.getElementById("last-name") as HTMLInputElement)?.value || "";
    const phoneNumber =
      "+48" +
        (document.getElementById("phone-number") as HTMLInputElement)?.value ||
      "";

    const librarianToken = checked
      ? (document.getElementById("librarian-token") as HTMLInputElement)
          ?.value || ""
      : null;

    const body = JSON.stringify({
      e_mail,
      phone_number: phoneNumber,
      first_name: firstName,
      last_name: lastName,
      password_hash: password,
      librarian_key: checked ? librarianToken : "",
    });

    const response = await fetch("http://localhost:8000/api/sign_up/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    return response;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let response: Response;

    try {
      if (tab === 0) {
        response = await handleLogin();
      } else {
        response = await handleRegister();
      }

      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (tab === 0) {
        localStorage.setItem("user", JSON.stringify(data));
        console.log("User: ", data);
        navigate("/home");
      } else if (tab === 1) {
        alert(
          "Account registered successfully. You can now log in using your credentials."
        );
        setTab(0);
      }
    } catch (error) {
      console.error(
        tab === 0 ? "Login failed:" : "Registration failed:",
        error
      );
      alert(
        tab === 0
          ? "Login failed, check your credentials and try again!"
          : "Registration failed, please try again!"
      );
    }
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
              <Tab label="SIGN IN" />
              <Tab label="CREATE ACCOUNT" />
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
                label="e-mail"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
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
                SIGN IN
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
                id="phone-number"
                label="Phone number"
                name="phoneNumber"
                autoComplete="phone-number"
                color="secondary"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg"
                          alt="Polish flag"
                          style={{ width: 20, height: 15, marginRight: 8 }}
                        />
                        +48
                      </Box>
                    </InputAdornment>
                  ),
                  inputProps: {
                    maxLength: 9,
                  },
                }}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="first-name"
                label="First name"
                name="firstName"
                autoComplete="First name"
                color="secondary"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="last-name"
                label="Last name"
                name="lastName"
                autoComplete="Last name"
                color="secondary"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
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
                  label="Confirm password"
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
                      {"Passwords dont match!"}
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
                    label="Are you a librarian?"
                  />
                  <TextField
                    disabled={!checked}
                    variant={!checked ? "filled" : "outlined"}
                    margin="normal"
                    fullWidth
                    name="librarianToken"
                    label="Librarian token"
                    type="text"
                    id="librarian-token"
                    color="secondary"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    CREATE ACCOUNT
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
