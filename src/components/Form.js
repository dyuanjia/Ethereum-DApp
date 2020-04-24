import React, { useState, useRef } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles((theme) => ({
  row: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  fixedWidth: {
    minWidth: "130px",
  },
  bidAmt: {
    width: "100%",
    marginTop: "3px",
  },
  button: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  buttonMargin: {
    marginTop: theme.spacing(2),
  },
  topMargin: {
    marginTop: theme.spacing(1),
  },
  msg: {
    marginTop: theme.spacing(1),
  },
}));

export default function Form(props) {
  const classes = useStyles();
  const { minBid, myBid, bid, getBid, message, funcLoading } = props;
  const lowButton = clsx(classes.button, classes.buttonMargin);
  const secondRow = clsx(classes.row, classes.topMargin);

  const [error, setError] = useState(false);
  const inputBid = useRef("");
  const handleBid = () => {
    setError(false);
    if (inputBid.current.value === "") {
      setError(true);
    } else {
      bid(inputBid.current.value);
    }
  };

  const clearText = () => {
    inputBid.current.value = "";
  };

  return (
    <React.Fragment>
      <div className={classes.row}>
        <Typography
          variant="h6"
          display="inline"
          className={classes.fixedWidth}
        >
          Minimum Bid:
        </Typography>
        {minBid === -1 ? (
          <LinearProgress
            variant="query"
            color="primary"
            className={classes.bidAmt}
          />
        ) : (
          <Typography variant="h6" display="inline">
            {minBid} wei
          </Typography>
        )}
      </div>
      <div className={classes.row}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBid}
          className={lowButton}
        >
          Bid
        </Button>
        <TextField
          required
          id="hash"
          name="hash"
          label="SHA256 Hash"
          fullWidth
          autoComplete="hash"
          error={error}
          inputRef={inputBid}
        />
        <IconButton
          size="small"
          className={classes.buttonMargin}
          onClick={clearText}
        >
          <ClearIcon color="primary" fontSize="small" />
        </IconButton>
      </div>
      {funcLoading && (
        <LinearProgress
          variant="query"
          color="primary"
          className={classes.topMargin}
        />
      )}
      {message && (
        <Typography
          color="textSecondary"
          align="center"
          display="inline"
          className={classes.msg}
        >
          {message}
        </Typography>
      )}

      <div className={secondRow}>
        <Button
          variant="contained"
          color="primary"
          onClick={getBid}
          className={classes.button}
        >
          Get my Bid
        </Button>
        <Typography color="textSecondary" display="inline">
          {myBid}
        </Typography>
      </div>
    </React.Fragment>
  );
}
