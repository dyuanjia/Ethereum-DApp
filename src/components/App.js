import React from "react";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import grey from "@material-ui/core/colors/grey";
import Main from "./Main";
import "./App.css";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: grey,
    background: {
      default: "#121212",
    },
  },
  status: {
    danger: "orange",
  },
  overrides: {
    MuiDrawer: {
      paper: {
        "& .MuiListItemIcon-root": {
          color: "inherit",
        },
      },
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Main />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
