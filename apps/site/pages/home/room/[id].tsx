import { useContext, useEffect, useState } from "react";
import { Button, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ClientContext, parseRoomTopic, usePublicRoom } from "matrix";

import { getAppUrl } from "../../../src/helpers";
import HomeLayout from "../../../src/layouts/HomeLayout";

export default function Id() {
  const router = useRouter();
  const id = router.query.id;

  const { client } = useContext(ClientContext);

  const [joinUrl, setJoinUrl] = useState("");

  const room = usePublicRoom(client, id as string);

  const worldId = parseRoomTopic(room?.topic ?? "");
  const world = usePublicRoom(client, worldId, true);

  useEffect(() => {
    const url = getAppUrl();
    setJoinUrl(`${url}?room=${room?.room_id}`);
  }, [room?.room_id]);

  return (
    <Grid className="page" container direction="column" rowSpacing={4}>
      <Grid item>
        <Typography variant="h4" style={{ wordBreak: "break-word" }}>
          🚪 {room?.name}
        </Typography>
      </Grid>

      <Grid item container columnSpacing={1}>
        <Grid item>
          <Typography variant="h6">World:</Typography>
        </Grid>
        <Grid item>
          <Link href={`/home/world/${world?.room_id}`} passHref>
            <Typography
              className="link"
              variant="h6"
              style={{ wordBreak: "break-word" }}
            >
              {world?.name}
            </Typography>
          </Link>
        </Grid>
      </Grid>

      <Grid item>
        <Button
          variant="contained"
          color="secondary"
          href={joinUrl}
          target="_blank"
        >
          Join Room
        </Button>
      </Grid>
    </Grid>
  );
}

Id.Layout = HomeLayout;
