import React, { Component } from "react";
import Web3 from "web3";
import { Switch, Route } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Auction from "./Auction";
import NotFound from "./NotFound";
import BlindAuction from "../abis/BlindAuction.json";

const styles = (theme) => ({
  root: {
    display: "flex",
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
});

class Main extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
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

  async loadBlockchainData() {
    const web3 = window.web3;
    web3.eth.getAccounts().then((accounts) => {
      this.setState({ account: accounts[0] });
    });
    // load contract ABI
    web3.eth.net.getId().then((networkId) => {
      const contractData = BlindAuction.networks[networkId];
      if (contractData) {
        const auction = new web3.eth.Contract(
          BlindAuction.abi,
          contractData.address
        );
        this.setState({ auction });
      } else {
        window.alert("Blind Auction contract not deployed to current network.");
      }
    });

    this.setState({ loading: false });
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };
  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      auction: {},
      bids: {},
      loading: true,
      open: false,
    };
  }

  render() {
    const { account, open } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Navbar
          account={account}
          open={open}
          openDrawer={this.handleDrawerOpen}
        />
        <Sidebar open={open} closeDrawer={this.handleDrawerClose} />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <Switch>
              <Route path="/" exact component={Auction} />
              <Route component={NotFound} />
            </Switch>
            <Footer />
          </Container>
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);
