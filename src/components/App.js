import React, { Component } from "react";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { BrowserRouter } from "react-router-dom";
import grey from "@material-ui/core/colors/grey";
import Web3 from "web3";
// import 404 from "../404.png";
import Dashboard from "./Dashboard";
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

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadAccount();
    console.log(this.state.account);
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadAccount() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      bids: {},
      loading: true,
    };
  }

  render() {
    const { account } = this.state;

    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Dashboard account={account} />
        </ThemeProvider>
      </BrowserRouter>
    );
  }
}

export default App;
