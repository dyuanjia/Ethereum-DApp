import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Step from "@material-ui/core/Step";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import Confirmation from "./Confirmation";
import Form from "./Form";
import ItemInfo from "./ItemInfo";
import Orders from "./Orders";

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
    padding: theme.spacing(1, 0, 2),
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
}));

const stages = ["Bidding Stage", "Revealing Stage", "Auction Ending"];

function getStageContent(stage, minBid = -1) {
  switch (stage) {
    case 0:
      return <Form minBid={minBid} />;
    case 1:
      return <Form />;
    case 2:
      return <Form />;
    default:
      throw new Error("Unknown Stage");
  }
}

export default function Auction(props) {
  const classes = useStyles();
  const {
    name,
    desc,
    minBid,
    myBid,
    bid,
    getBid,
    withdraw,
    message,
    funcLoading,
  } = props;
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const [activeStage, setActiveStage] = useState(0);
  const handleNext = () => {
    setActiveStage(activeStage + 1);
  };

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
      <Grid item xs={12} md={4} lg={3}>
        <Paper className={fixedHeightPaper}>
          <ItemInfo name={name} desc={desc} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={8} lg={9}>
        <Paper className={fixedHeightPaper}>
          <Stepper activeStep={activeStage} className={classes.stepper}>
            {stages.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStage === stages.length ? (
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
              <React.Fragment>
                {activeStage === 0 && (
                  <Form
                    minBid={minBid}
                    bid={bid}
                    getBid={getBid}
                    myBid={myBid}
                    message={message}
                    funcLoading={funcLoading}
                  />
                )}
                {/*getStageContent(activeStage, minBid)*/}
                <div className={classes.buttons}>
                  {activeStage === 0 && (
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
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStage === stages.length - 1
                      ? "Place order"
                      : "Check Auction Stage"}
                  </Button>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        </Paper>
      </Grid>
      {/* Recent Orders */}
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Orders />
        </Paper>
      </Grid>
    </Grid>
  );
}
