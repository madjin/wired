import { useEffect, useState } from "react";

import { useClient } from "./useClient";

/**
 * Hook to load a space scene.
 */
export function useScene(uri: string | null) {
  const { engine } = useClient();

  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      if (!engine || !uri) return;

      try {
        const res = await fetch(uri);
        const buffer = await res.arrayBuffer();
        const array = new Uint8Array(buffer);

        setIsDownloaded(true);

        engine.scene.baseURI = uri.split("/").slice(0, -1).join("/");
        await engine.scene.addBinary(array);

        engine.physics.send({ subject: "respawn", data: null });

        // Add delay to allow scene to load
        const mbs = Math.max(Math.round(array.byteLength / 1000 / 1000), 5);
        await new Promise((resolve) => setTimeout(resolve, mbs * 400));

        engine.start();
        engine.behavior.start();
        engine.audio.start();

        // Respawn player again to ensure they are in the correct position
        // (sometimes would fall through the floor while scene loads due to lag)
        engine.physics.send({ subject: "respawn", data: null });

        setIsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    }

    load();

    return () => {
      engine?.reset();
      setIsDownloaded(false);
      setIsLoaded(false);
    };
  }, [engine, uri]);

  return {
    isDownloaded,
    isLoaded,
  };
}
