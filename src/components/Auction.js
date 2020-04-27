import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Step from "@material-ui/core/Step";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import Confirmation from "./peripherals/Confirmation";
import Bidding from "./Bidding";
import History from "./History";
import ItemInfo from "./ItemInfo";
import Loading from "./peripherals/Loading";
import Revealing from "./Revealing";
import { convertTime } from "../utils/index";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 300,
    overflowX: "hidden",
  },
  stepper: {
    padding: theme.spacing(2, 0, 2),
  },
  buttons: {
    display: "flex",
    marginTop: "auto",
    justifyContent: "flex-end",
  },
  button: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  time: {
    marginTop: "5px",
    marginRight: "auto",
    justifyContent: "left",
  },
}));

const stages = ["Bidding Stage", "Revealing Stage", "Auction Ending"];

export default function Auction(props) {
  const classes = useStyles();
  const {
    name,
    desc,
    minBid,
    bids,
    bidMsg,
    bid,
    getBid,
    withdraw,
    message,
    reveal,
    funcLoading,
    biddingEndTime,
    revealEndTime,
    stage,
    updateStage,
    endAuction,
    getWinner,
  } = props;
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleWithdraw = () => {
    setOpen(false);
    withdraw();
  };

  return (
    <Grid container spacing={3}>
      {/* Item Info */}
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper}>
          <ItemInfo name={name} desc={desc} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={8} lg={8}>
        <Paper className={fixedHeightPaper}>
          <Stepper activeStep={stage} className={classes.stepper}>
            {stages.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {/* Loading */}
            {stage === -1 && <Loading />}
            {/* Bidding */}
            {stage === 0 && (
              <Bidding
                minBid={minBid}
                bid={bid}
                message={message}
                funcLoading={funcLoading}
              />
            )}
            {/* Revealing */}
            {stage === 1 && (
              <Revealing
                minBid={minBid}
                reveal={reveal}
                message={message}
                funcLoading={funcLoading}
              />
            )}
            {/* End Auction */}
            {stage === 2 && (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Revealing Stage Ended
                </Typography>
                <Typography variant="subtitle1">
                  You may now end the auction using the button below. The item
                  will be delivered to the highest bidder.
                </Typography>
              </React.Fragment>
            )}
            {stage === 3 && (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Auction has Ended
                </Typography>
                <Typography variant="subtitle1">
                  Thank you for your participation if you have bidded. Click{" "}
                  <Link color="inherit" href="/new">
                    here
                  </Link>{" "}
                  to launch a new auction.
                </Typography>
              </React.Fragment>
            )}
            <div className={classes.buttons}>
              <Typography
                color="textSecondary"
                align="left"
                display="inline"
                className={classes.time}
              >
                {stage === 0 &&
                  "Bidding End Time: " + convertTime(biddingEndTime, true)}
                {stage === 1 &&
                  "Reveal End Time: " + convertTime(revealEndTime, true)}
              </Typography>
              {stage === 0 && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleClickOpen}
                  className={classes.button}
                >
                  Withdraw
                </Button>
              )}
              <Confirmation
                open={open}
                handleClose={handleClose}
                handleWithdraw={handleWithdraw}
              />
              {stage >= 2 ? (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={stage === 3}
                  onClick={endAuction}
                  className={classes.button}
                >
                  End Auction
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={updateStage}
                  className={classes.button}
                >
                  Update Auction Stage
                </Button>
              )}
            </div>
          </React.Fragment>
        </Paper>
      </Grid>
      {/* Get Bids */}
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <History
            bids={bids}
            getBid={stage === 0 ? getBid : getWinner}
            bidMsg={bidMsg}
            stage={stage}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
