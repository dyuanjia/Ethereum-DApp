import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      padding: theme.spacing(3),
    },
  },
}));

export default function Create(props) {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" gutterBottom>
        Welcome
      </Typography>
      <Typography variant="subtitle1">
        There is no active auction going on. Click{" "}
        <Link color="inherit" href="/new">
          here
        </Link>{" "}
        to launch a new auction.
      </Typography>
    </Paper>
  );
}
