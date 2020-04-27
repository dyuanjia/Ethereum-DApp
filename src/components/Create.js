import React, { useState, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      padding: theme.spacing(3),
    },
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

export default function Create(props) {
  const classes = useStyles();
  const { sendPayment, activeAuction, stage, funcLoading } = props;

  const [errorName, setErrorName] = useState(false);
  const inputName = useRef("");
  const [errorDesc, setErrorDesc] = useState(false);
  const inputDesc = useRef("");
  const [errorBid, setErrorBid] = useState(false);
  const inputBid = useRef("");

  const handleSubmit = () => {
    setErrorName(false);
    setErrorDesc(false);
    setErrorBid(false);
    if (inputName.current.value === "") {
      setErrorName(true);
    } else if (inputDesc.current.value === "") {
      setErrorDesc(true);
    } else if (inputBid.current.value === "") {
      setErrorBid(true);
    } else {
      sendPayment(
        inputName.current.value,
        inputDesc.current.value,
        inputBid.current.value
      );
    }
  };

  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" gutterBottom>
        Launch New Auction
      </Typography>

      {activeAuction && stage !== 3 ? (
        <Typography variant="subtitle1">
          There is an active auction going on. Come back later.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              id="itemName"
              label="Item Name"
              error={errorName}
              inputRef={inputName}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              id="minBid"
              label="Minimum Bid"
              helperText="Bid amount in ether"
              error={errorBid}
              inputRef={inputBid}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="itemDesc"
              label="Item Description"
              error={errorDesc}
              inputRef={inputDesc}
              fullWidth
              multiline
            />
          </Grid>
          {funcLoading && (
            <Grid item xs={12}>
              <LinearProgress
                variant="query"
                color="primary"
                className={classes.topMargin}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <div className={classes.buttons}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={funcLoading}
                className={classes.button}
              >
                Create New Auction
              </Button>
            </div>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
