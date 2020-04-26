import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Alert from "./peripherals/Alert";

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

export default function Create() {
  const classes = useStyles();
  const [activeAuction, setActiveAuction] = useState(false);

  useEffect(() => {
    fetch("/create")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeAuction) {
          console.log(data.activeAuction);
        } else {
          setActiveAuction(false);
          console.log("no");
        }
      });
  }, []);

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

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
      setOpen(true);
    }
  };

  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" gutterBottom>
        Launch New Auction
      </Typography>
      <Alert open={open} handleClose={handleClose} />
      {activeAuction ? (
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
          <Grid item xs={12}>
            <div className={classes.buttons}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
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
