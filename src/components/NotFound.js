import React from "react";
import Grid from "@material-ui/core/Grid";
import notFound from "../404.jpg";

export default function NotFound() {
  return (
    <Grid container justify="center" alignItems="center">
      <img src={notFound} alt="Not da wei" />
    </Grid>
  );
}
