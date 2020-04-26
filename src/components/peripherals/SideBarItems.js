import React from "react";
import { Link } from "react-router-dom";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import GavelIcon from "@material-ui/icons/Gavel";
import LaunchIcon from "@material-ui/icons/Launch";
import Dialpad from "@material-ui/icons/Dialpad";
import AssignmentIcon from "@material-ui/icons/Assignment";

export const mainListItems = (
  <div>
    <Link to="/">
      <ListItem button>
        <ListItemIcon>
          <GavelIcon />
        </ListItemIcon>
        <ListItemText primary="Auction" />
      </ListItem>
    </Link>
    <Link to="/new">
      <ListItem button>
        <ListItemIcon>
          <LaunchIcon />
        </ListItemIcon>
        <ListItemText primary="New Auction" />
      </ListItem>
    </Link>
    {/* Potential TODO */}
    <Link to="/calculator">
      <ListItem button>
        <ListItemIcon>
          <Dialpad />
        </ListItemIcon>
        <ListItemText primary="Calculator" />
      </ListItem>
    </Link>
  </div>
);

{
  /* Potential TODO */
}
export const secondaryListItems = (
  <div>
    <ListSubheader inset>Past Auctions</ListSubheader>
    <Link to="/currentMonth">
      <ListItem button>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Current Month" />
      </ListItem>
    </Link>
    <Link to="/lastMonth">
      <ListItem button>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Last Month" />
      </ListItem>
    </Link>
    <Link to="/all">
      <ListItem button>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="All" />
      </ListItem>
    </Link>
  </div>
);
