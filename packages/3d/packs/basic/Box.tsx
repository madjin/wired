import { Triplet, useBox } from "@react-three/cannon";

import { PHYSICS_GROUPS, SceneObject } from "../..";

interface Props {
  object: SceneObject;
  editor?: boolean;
}

export function Box({ object, editor = false }: Props) {
  const { params } = object;

  const args: Triplet = editor ? [1, 1, 1] : params.scale;

  const disablePhysics = params.physEnabled === false || editor;

  const [ref] = useBox(() => ({
    args,
    position: editor ? undefined : params.position,
    rotation: editor ? undefined : params.rotation,
    mass: params.mass,
    type: params.physType,
    collisionFilterMask: disablePhysics ? PHYSICS_GROUPS.NONE : undefined,
  }));

  return (
    <mesh ref={ref}>
      <boxBufferGeometry args={args} />
      <meshPhongMaterial
        color={params.color}
        opacity={params.opacity}
        transparent={Boolean(params.opacity < 1)}
      />
    </mesh>
  );
}
