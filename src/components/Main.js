import React, { Component } from "react";
import Web3 from "web3";
import { Switch, Route } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Alert from "./peripherals/Alert";
import Navbar from "./peripherals/Navbar";
import Sidebar from "./peripherals/Sidebar";
import Footer from "./peripherals/Footer";
import Auction from "./Auction";
import Create from "./Create";
import Home from "./Home";
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
    await this.loadAccount();
    await this.loadPaymentContract();
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
    web3.eth.getAccounts().then((accounts) => {
      this.setState({ account: accounts[0] });
    });
  }

  async loadPaymentContract() {
    const web3 = window.web3;
    let payment;
    fetch("/index")
      .then((res) => res.json())
      .then((data) => {
        payment = new web3.eth.Contract(Payment.abi, data.paymentAddress);
        payment.methods
          .FEE()
          .call()
          .then((fee) => {
            this.setState({ fee, payment, loading: false });
          });
        if (data.activeAuction) {
          this.loadAuctionContract(data.auctionAddress);
          this.setState({ activeAuction: true });
        } else {
          this.setState({ stage: -1 });
        }
      });
  }

  sendPayment = (name, desc, minBid) => {
    const { funcLoading } = this.state;
    if (funcLoading) {
      alert("There is an ongoing transaction. Please try again later");
    } else {
      this.setState({ funcLoading: true });
      this.loadAccount().then(() => {
        const { payment, fee, account } = this.state;
        payment.methods
          .pay()
          .send({ from: account, value: fee })
          .on("transactionHash", (hash) => {
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: name,
                desc: desc,
                owner: account,
                minBid: minBid,
              }),
            };
            fetch("/create", requestOptions)
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  this.setState({
                    success: true,
                    funcLoading: false,
                    alertOpen: true,
                  });
                } else {
                  this.setState({
                    success: false,
                    funcLoading: false,
                    alertOpen: true,
                  });
                }
              });
          })
          .on("error", (err) => {
            console.log(err);
          });
      });
    }
  };

  async loadAuctionContract(auctionAddress) {
    this.setState({ loading: true });
    const web3 = window.web3;
    const auction = new web3.eth.Contract(BlindAuction.abi, auctionAddress, {
      gas: "1500000",
    });
    this.setState({ auction, activeAuction: true, loading: false });

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
      .then((biddingEndTime) => {
        this.setState({ biddingEndTime });
        auction.methods
          .revealEndTime()
          .call()
          .then((revealEndTime) => {
            this.setState({ revealEndTime, funcLoading: false });
            this.updateStage();
          });
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
                  message:
                    "You may have already revealed, have not bidded or your bid amount is too low",
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
      const { auction, account, stage, bids } = this.state;
      auction.methods
        .withdraw()
        .send({ from: account })
        .then((txHash) => {
          bids.pop();
          this.setState({ message: "You withdrew from this auction", bids });
        })
        .catch((err) => {
          this.getStage().then((newStage) => {
            if (stage !== newStage) {
              alert("Auction has moved on to a different stage");
            } else {
              this.setState({ message: "You have not bidded" });
            }
          });
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
    const { auction, stage, itemName, itemMinBid } = this.state;
    const now = Date.now() / 1000;
    auction.methods
      .highestBid()
      .call()
      .then((highestBid) => {
        if (highestBid === itemMinBid) {
          if (stage === 3) {
            this.setState({ bidMsg: "There is no winner for this auction" });
          } else {
            this.setState({ bidMsg: "There is currently no highest bidder" });
          }
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
    const { auction, biddingEndTime, revealEndTime } = this.state;
    const now = Date.now() / 1000;
    return new Promise((resolve, reject) => {
      auction.methods
        .ended()
        .call()
        .then((ended) => {
          let stage;
          if (now < biddingEndTime) {
            stage = 0;
          } else if (now < revealEndTime) {
            stage = 1;
          } else if (ended) {
            stage = 3;
          } else {
            stage = 2;
          }
          resolve(stage);
        });
    });
  };

  updateStage = () => {
    this.getStage().then((stage) => {
      this.setState({ stage, loading: false, funcLoading: false });
    });
  };

  handleAlertClose = () => {
    this.setState({ alertOpen: false });
    window.location.reload();
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
      payment: {},
      fee: -1,
      success: false,
      loading: true,
      funcLoading: false,
      open: false,
      alertOpen: false,
      account: "",
      auction: {},
      activeAuction: false,
      bidMsg: "",
      bids: [],
      itemName: "",
      itemDesc: "",
      itemMinBid: -1,
      biddingEndTime: "",
      revealEndTime: "",
      message: "",
      stage: -1,
    };
  }

  render() {
    const {
      success,
      loading,
      open,
      alertOpen,
      activeAuction,
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
          <Alert
            open={alertOpen}
            handleClose={this.handleAlertClose}
            success={success}
          />
          <Container maxWidth="lg" className={classes.container}>
            {loading ? (
              <Loading />
            ) : (
              <Switch>
                <Route
                  path="/"
                  exact
                  render={(props) =>
                    activeAuction ? (
                      <Auction
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
                    ) : (
                      <Home />
                    )
                  }
                />
                <Route
                  path="/new"
                  exact
                  render={(props) => (
                    <Create
                      sendPayment={this.sendPayment}
                      activeAuction={activeAuction}
                      stage={stage}
                      funcLoading={funcLoading}
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
