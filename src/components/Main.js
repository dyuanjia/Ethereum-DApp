import React, { Component } from "react";
import Web3 from "web3";
import { Switch, Route } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Navbar from "./peripherals/Navbar";
import Sidebar from "./peripherals/Sidebar";
import Footer from "./peripherals/Footer";
import Auction from "./Auction";
import Create from "./Create";
import Loading from "./peripherals/Loading";
import NotFound from "./NotFound";
import BlindAuction from "../abis/BlindAuction.json";
import Payment from "../abis/Payment.json";
import { convertTime } from "../utils/index";

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
        auction.methods
          .biddingEndTime()
          .call()
          .then((time) => {
            const biddingEndTime = convertTime(time, true);
            this.setState({ biddingEndTime });
          });
        auction.methods
          .revealEndTime()
          .call()
          .then((time) => {
            const revealEndTime = convertTime(time, true);
            this.setState({ revealEndTime });
          });

        this.updateStage();
      });
  }

  async loadAccount() {
    const web3 = window.web3;
    web3.eth.getAccounts().then((accounts) => {
      this.setState({ account: accounts[0] });
    });
  }

  addBid = (bidHash) => {
    const { itemName, bids } = this.state;
    const now = Date.now() / 1000;
    bids.push({
      date: convertTime(now),
      name: itemName,
      hash: bidHash,
      secret: "Not Available",
    });
    this.setState({ bids });
  };

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
            this.addBid(bidHash);
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

  reveal = (nonce, amt) => {
    this.setState({ funcLoading: true });
    this.loadAccount().then(() => {
      const { auction, account, stage } = this.state;
      try {
        auction.methods
          .reveal(nonce)
          .send({ from: account, value: amt })
          .on("transactionHash", (hash) => {
            this.setState({ message: "Reveal Successful", funcLoading: false });
          })
          .on("error", (err) => {
            this.getStage().then((newStage) => {
              if (stage !== newStage) {
                alert("Auction has moved on to a different stage");
                this.setState({
                  stage: newStage,
                  funcLoading: false,
                });
              } else {
                this.setState({
                  message: "Already revealed or bid amount too low",
                  funcLoading: false,
                });
              }
            });
          });
      } catch (err) {
        this.setState({
          message: "Invalid nonce or bid value",
          funcLoading: false,
        });
      }
    });
  };

  getBid = () => {
    this.loadAccount().then(() => {
      const { auction, account, bids } = this.state;
      auction.methods
        .getBid()
        .call({ from: account })
        .then((myBid) => {
          if (myBid == 0) {
            this.setState({ bidMsg: "You have not bidded" });
          } else {
            this.setState({ bidMsg: "" });
            if (bids.length === 0) {
              this.addBid(myBid);
            }
          }
        });
    });
  };

  withdraw = () => {
    this.loadAccount().then(() => {
      const { auction, account, bids } = this.state;
      auction.methods
        .withdraw()
        .send({ from: account })
        .then((txHash) => {
          bids.pop();
          this.setState({ message: "You withdrew from this auction", bids });
        })
        .catch((err) => {
          this.setState({ message: "You have not bidded" });
        });
    });
  };

  endAuction = () => {
    const { auction, account } = this.state;
    auction.methods
      .endAuction()
      .send({ from: account })
      .then(() => {
        this.setState({ stage: 3 });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ stage: 3 });
      });
  };

  getWinner = () => {
    const { auction, itemName, itemMinBid } = this.state;
    const now = Date.now() / 1000;
    auction.methods
      .highestBid()
      .call()
      .then((highestBid) => {
        if (highestBid === itemMinBid) {
          this.setState({ bidMsg: "There is currently no highest bidder" });
        } else {
          auction.methods
            .highestBidder()
            .call()
            .then((winner) => {
              const bids = [
                {
                  date: convertTime(now),
                  name: itemName,
                  hash: winner,
                  secret: highestBid,
                },
              ];
              this.setState({ bids, bidMsg: "" });
            });
        }
      });
  };

  getStage = () => {
    const { auction } = this.state;
    return new Promise((resolve, reject) => {
      auction.methods
        .getStage()
        .call()
        .then((stage) => {
          resolve(parseInt(stage, 10));
        });
    });
  };

  updateStage = () => {
    this.getStage().then((stage) => {
      console.log("Current Stage: " + stage);
      this.setState({ stage });
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
      bidMsg: "",
      auction: {},
      bids: [],
      itemName: "",
      itemDesc: "",
      itemMinBid: -1,
      biddingEndTime: "",
      revealEndTime: "",
      funcLoading: false,
      message: "",
      stage: -1,
    };
  }

  render() {
    const {
      loading,
      open,
      account,
      bids,
      bidMsg,
      itemName,
      itemDesc,
      itemMinBid,
      funcLoading,
      biddingEndTime,
      revealEndTime,
      message,
      stage,
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
              <Loading />
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
                      bids={bids}
                      bidMsg={bidMsg}
                      funcLoading={funcLoading}
                      biddingEndTime={biddingEndTime}
                      revealEndTime={revealEndTime}
                      bid={this.bid}
                      reveal={this.reveal}
                      getBid={this.getBid}
                      withdraw={this.withdraw}
                      message={message}
                      stage={stage}
                      updateStage={this.updateStage}
                      endAuction={this.endAuction}
                      getWinner={this.getWinner}
                    />
                  )}
                />
                <Route path="/new" exact render={(props) => <Create />} />
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
