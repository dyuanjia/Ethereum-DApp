import React, { Component } from "react";
import Web3 from "web3";
import { Switch, Route } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
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
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

class Main extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadContract();
    await this.loadAccount();
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

  async loadContract() {
    const web3 = window.web3;
    // load contract ABI
    let auction;
    web3.eth.net
      .getId()
      .then((networkId) => {
        const contractData = BlindAuction.networks[networkId];
        if (contractData) {
          auction = new web3.eth.Contract(
            BlindAuction.abi,
            contractData.address
          );
          this.setState({ auction });
        } else {
          window.alert(
            "Blind Auction contract not deployed to current network."
          );
        }
        this.setState({ loading: false });
      })
      .then(() => {
        //load item info
        auction.methods
          .name()
          .call()
          .then((itemName) => {
            this.setState({ itemName });
          });
        auction.methods
          .description()
          .call()
          .then((itemDesc) => {
            this.setState({ itemDesc });
          });
        auction.methods
          .minimumBid()
          .call()
          .then((itemMinBid) => {
            this.setState({ itemMinBid });
          });
      });
  }

  async loadAccount() {
    const web3 = window.web3;
    web3.eth.getAccounts().then((accounts) => {
      this.setState({ account: accounts[0] });
    });
  }

  bid = (bidHash) => {
    this.setState({ funcLoading: true });
    this.loadAccount().then(() => {
      const { auction, account, stage } = this.state;
      try {
        auction.methods
          .bid(bidHash)
          .send({ from: account })
          .on("transactionHash", (hash) => {
            this.setState({ message: "Bid Successful", funcLoading: false });
          })
          .on("error", (err) => {
            this.getStage().then((newStage) => {
              if (stage !== newStage) {
                alert("Auction has moved on to a different stage");
              }
              this.setState({
                stage: newStage,
                funcLoading: false,
              });
            });
          });
      } catch (err) {
        this.setState({ message: "Invalid SHA256 Hash", funcLoading: false });
      }
    });
  };

  getBid = () => {
    this.loadAccount().then(() => {
      const { auction, account } = this.state;
      auction.methods
        .getBid()
        .call({ from: account })
        .then((myBid) => {
          console.log(myBid);
          if (myBid == 0) {
            this.setState({ myBid: "You have not bidded" });
          } else {
            this.setState({ myBid });
          }
        });
    });
  };

  withdraw = () => {
    this.loadAccount().then(() => {
      const { auction, account } = this.state;
      auction.methods
        .withdraw()
        .send({ from: account })
        .then((txHash) => {
          this.setState({ myBid: "You withdrew from this auction" });
        })
        .catch((err) => {
          this.setState({ myBid: "You have not bidded" });
        });
    });
  };

  getStage = () => {
    const { auction } = this.state;
    return new Promise(function (resolve, reject) {
      auction.methods
        .getStage()
        .call()
        .then((stage) => {
          resolve(stage);
        });
    });
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };
  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      open: false,
      account: "",
      myBid: "",
      auction: {},
      bids: [],
      itemName: "",
      itemDesc: "",
      itemMinBid: -1,
      funcLoading: false,
      message: "",
      stage: 0,
    };
  }

  render() {
    const {
      loading,
      open,
      account,
      myBid,
      itemName,
      itemDesc,
      itemMinBid,
      funcLoading,
      message,
    } = this.state;
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
            {loading ? (
              <div className={classes.center}>
                <CircularProgress color="primary" />
              </div>
            ) : (
              <Switch>
                <Route
                  path="/"
                  exact
                  render={(props) => (
                    <Auction
                      {...props}
                      name={itemName}
                      desc={itemDesc}
                      minBid={itemMinBid}
                      myBid={myBid}
                      funcLoading={funcLoading}
                      bid={this.bid}
                      getBid={this.getBid}
                      withdraw={this.withdraw}
                      message={message}
                    />
                  )}
                />
                <Route component={NotFound} />
              </Switch>
            )}
            <Footer />
          </Container>
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);
