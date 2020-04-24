import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Title from "./Title";

const useStyles = makeStyles((theme) => ({
  infoContext: {
    flex: 1,
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: theme.spacing(5),
  },
}));

export default function ItemInfo(props) {
  const { name, desc } = props;
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Item for Sale</Title>
      {name !== "" && desc !== "" ? (
        <div>
          <Typography component="p" variant="h4" noWrap>
            {name}
          </Typography>
          <Typography color="textSecondary" className={classes.infoContext}>
            {desc}
          </Typography>
        </div>
      ) : (
        <div className={classes.center}>
          <CircularProgress color="primary" />
        </div>
      )}
    </React.Fragment>
  );
}
