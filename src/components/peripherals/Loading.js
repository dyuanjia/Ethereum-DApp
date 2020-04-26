import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  center: {
    display: "flex",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function Create(props) {
  const classes = useStyles();

  return (
    <div className={classes.center}>
      <CircularProgress color="primary" />
    </div>
  );
}
