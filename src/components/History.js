import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Title from "./Title";

const useStyles = makeStyles((theme) => ({
  bottom: {
    marginTop: theme.spacing(3),
  },
  button: {
    marginRight: theme.spacing(2),
  },
}));

export default function History(props) {
  const { bids, bidMsg, getBid, stage } = props;
  const classes = useStyles();

  return (
    <React.Fragment>
      <Title>{stage === 0 ? "Your Bids" : "Highest Bid"}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Item</TableCell>
            <TableCell>
              {stage === 0 ? "Blinded Bid" : "Highest Bidder"}
            </TableCell>
            <TableCell align="right">Bid Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.name}>
              <TableCell>{bid.date}</TableCell>
              <TableCell>{bid.name}</TableCell>
              <TableCell>{bid.hash}</TableCell>
              <TableCell align="right">{bid.secret}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.bottom}>
        <Button
          variant="contained"
          color="primary"
          onClick={getBid}
          className={classes.button}
        >
          Refresh
        </Button>
        <Typography color="textSecondary" display="inline">
          {bidMsg}
        </Typography>
      </div>
    </React.Fragment>
  );
}
