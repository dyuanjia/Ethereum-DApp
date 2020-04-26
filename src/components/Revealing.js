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
    marginTop: theme.spacing(1),
  },
  button: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  buttonMargin: { marginTop: theme.spacing(2) },
  topMargin: { marginTop: theme.spacing(1) },
  leftMargin: { marginLeft: "100px" },
}));

export default function Form(props) {
  const classes = useStyles();
  const { reveal, message, funcLoading } = props;
  const lowButton = clsx(classes.button, classes.buttonMargin);

  const [errorNonce, setErrorNonce] = useState(false);
  const inputNonce = useRef("");
  const [errorAmt, setErrorAmt] = useState(false);
  const inputAmt = useRef("");
  const handleReveal = () => {
    setErrorNonce(false);
    setErrorAmt(false);
    if (inputNonce.current.value === "") {
      setErrorNonce(true);
    } else if (inputAmt.current.value === "") {
      setErrorAmt(true);
    } else {
      reveal(inputNonce.current.value, inputAmt.current.value);
    }
  };

  const clearText = (ref) => {
    ref.current.value = "";
  };

  return (
    <React.Fragment>
      <div className={classes.row}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleReveal}
          className={lowButton}
        >
          Reveal
        </Button>
        <TextField
          required
          id="nonce"
          name="nonce"
          label="Nonce"
          fullWidth
          autoComplete="nonce"
          error={errorNonce}
          inputRef={inputNonce}
        />
        <IconButton
          size="small"
          className={classes.buttonMargin}
          onClick={() => {
            clearText(inputNonce);
          }}
        >
          <ClearIcon color="primary" fontSize="small" />
        </IconButton>
      </div>
      <div className={classes.row}>
        <TextField
          required
          id="secret"
          name="secret"
          label="Bid Value"
          fullWidth
          autoComplete="secret"
          error={errorAmt}
          inputRef={inputAmt}
          className={classes.leftMargin}
        />
        <IconButton
          size="small"
          className={classes.buttonMargin}
          onClick={() => {
            clearText(inputAmt);
          }}
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
          className={classes.topMargin}
        >
          {message}
        </Typography>
      )}
    </React.Fragment>
  );
}
