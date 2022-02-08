import { MutableRefObject, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { Avatar } from "avatars";

import { PUBLISH_INTERVAL } from "../../constants";

interface Props {
  position: MutableRefObject<Vector3>;
  rotation: MutableRefObject<number>;
}

export default function Body({ position, rotation }: Props) {
  const group = useRef<Group>();

  const deltaRot = useRef(0);
  const lastRot = useRef(0);
  const currentRot = useRef(0);
  const interpRot = useRef(0);

  const deltaPos = useRef(0);
  const lastPos = useRef(new Vector3());
  const currentPos = useRef(new Vector3());
  const interpPos = useRef(new Vector3());

  useFrame((_, delta) => {
    //position interp
    deltaPos.current += delta;

    if (!currentPos.current.equals(position.current)) {
      lastPos.current.copy(currentPos.current);
      currentPos.current.copy(position.current);
      deltaPos.current = 0;
    }

    const alphaPos = Math.min(deltaPos.current * (1000 / PUBLISH_INTERVAL), 1);
    interpPos.current.lerpVectors(
      lastPos.current,
      currentPos.current,
      alphaPos
    );

    if (!group.current) return;

    group.current.position.copy(interpPos.current);

    //rotation interp
    deltaRot.current += delta;

    if (currentRot.current !== rotation.current) {
      lastRot.current = currentRot.current;
      currentRot.current = rotation.current;
      deltaRot.current = 0;
    }

    const alphaRot = Math.min(deltaRot.current * (1000 / PUBLISH_INTERVAL), 1);
    interpRot.current =
      (currentRot.current - lastRot.current) * alphaRot + lastRot.current;

    group.current.rotation.y = interpRot.current;
  });

  return (
    <group ref={group}>
      <Avatar />
    </group>
  );
}
