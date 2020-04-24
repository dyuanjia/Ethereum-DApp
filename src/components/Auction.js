import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Step from "@material-ui/core/Step";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import Confirmation from "./Confirmation";
import Bidding from "./Bidding";
import ItemInfo from "./ItemInfo";
import History from "./History";
import Revealing from "./Revealing";

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
  center: {
    display: "flex",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
            {stage === -1 && (
              <div className={classes.center}>
                <CircularProgress color="primary" />
              </div>
            )}
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
            <div className={classes.buttons}>
              <Typography
                color="textSecondary"
                align="left"
                display="inline"
                className={classes.time}
              >
                {stage === 0 && "Bidding End Time: " + biddingEndTime}
                {stage === 1 && "Reveal End Time: " + revealEndTime}
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
              <Button
                variant="contained"
                color="primary"
                onClick={updateStage}
                className={classes.button}
              >
                {stage === stages.length - 1
                  ? "End Auction"
                  : "Update Auction Stage"}
              </Button>
            </div>
            {/* {stage === stages.length ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Thank you for your order.
                </Typography>
                <Typography variant="subtitle1">
                  Your order number is #2001539. We have emailed your order
                  confirmation, and will send you an update when your order has
                  shipped.
                </Typography>
              </React.Fragment>
            ) : (
            )} */}
          </React.Fragment>
        </Paper>
      </Grid>
      {/* Recent Orders */}
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <History bids={bids} getBid={getBid} bidMsg={bidMsg} />
        </Paper>
      </Grid>
    </Grid>
  );
}
