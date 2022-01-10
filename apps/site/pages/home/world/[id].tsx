import { useContext } from "react";
import { Grid, IconButton, Tooltip, Typography } from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { useRouter } from "next/router";
import { customAlphabet } from "nanoid";

import {
  ClientContext,
  createRoom,
  useRoomsFromWorld,
  useWorldFromId,
} from "matrix";

import HomeLayout from "../../../src/layouts/HomeLayout";
import RoomCard from "../../../src/components/RoomCard";

const nanoid = customAlphabet("1234567890", 8);

export default function Id() {
  const router = useRouter();
  const { id } = router.query;

  const { client, loggedIn } = useContext(ClientContext);

  const world = useWorldFromId(client, id as string);
  const rooms = useRoomsFromWorld(client, id as string);

  async function handleNewRoom() {
    if (!client || !id || !world) return;
    const name = `${world.name}#${nanoid()}`;
    const { room_id } = await createRoom(client, `${id}`, name);
    router.push(`/home/room/${room_id}`);
  }

  return (
    <Grid className="page" container direction="column" rowSpacing={4}>
      <Grid item>
        <Typography variant="h4" style={{ wordBreak: "break-word" }}>
          🌍 {world?.name ?? id}
        </Typography>
      </Grid>

      <Grid item container alignItems="center" columnSpacing={1}>
        <Grid item>
          <Typography variant="h5">Rooms</Typography>
        </Grid>
        <Grid item>
          {loggedIn && (
            <Tooltip title="New room" placement="right">
              <IconButton onClick={handleNewRoom}>
                <AddBoxOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>

      <Grid item container spacing={4}>
        {rooms.map((room) => {
          return <RoomCard key={room.room_id} room={room} />;
        })}
      </Grid>
    </Grid>
  );
}

Id.Layout = HomeLayout;