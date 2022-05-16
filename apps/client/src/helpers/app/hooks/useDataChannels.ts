import { useEffect, useRef, useState } from "react";

import { createMessage } from "../message";
import { useAppStore } from "../store";
import { Identity, Location, PlayerChannels } from "../types";

export default function useDataChannels(id: string, channels: PlayerChannels) {
  const locationRef = useRef<Location>({ position: [0, 0, 0], rotation: 0 });
  const [identity, setIdentity] = useState<Identity>();

  // const { profile } = useProfile(identity?.did);

  useEffect(() => {
    if (
      !channels ||
      !channels.message ||
      !channels.location ||
      !channels.identity
    )
      return;

    function onMessage(e: MessageEvent<string>) {
      const name = `Guest-${id.substring(0, 6)}`;
      const message = createMessage(JSON.parse(e.data), name);
      useAppStore.getState().addMessage(message);
    }

    function onLocation(e: MessageEvent<string>) {
      locationRef.current = JSON.parse(e.data);
    }

    function onIdentity(e: MessageEvent<string>) {
      setIdentity(JSON.parse(e.data));
    }

    channels.message.addEventListener("message", onMessage);
    channels.location.addEventListener("message", onLocation);
    channels.identity.addEventListener("message", onIdentity);
    return () => {
      channels.message.removeEventListener("message", onMessage);
      channels.location.removeEventListener("message", onLocation);
      channels.identity.removeEventListener("message", onIdentity);
    };
  }, [channels, id]);

  // useEffect(() => {
  //   //add to players list
  //   const players = useStore.getState().players;
  //   const newPlayers = { ...players };
  //   newPlayers[id] = identity;
  //   useStore.setState({ players: newPlayers });

  //   return () => {
  //     //remove from players list
  //     const players = useStore.getState().players;
  //     const newPlayers = { ...players };
  //     delete newPlayers[id];
  //     useStore.setState({ players: newPlayers });
  //   };
  // }, [id, identity]);

  return { locationRef, identity };
}