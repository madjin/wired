import { IoMdEye } from "react-icons/io";
import { MdArrowBackIosNew } from "react-icons/md";
import { useRouter } from "next/router";
import { useSetAtom } from "jotai";

import { mergeLocalScene } from "../../../helpers/localScenes/db";
import { previewModeAtom } from "../../../helpers/editor/state";
import { useLocalScene } from "../../../helpers/localScenes/useLocalScene";
import { useStore } from "../../../helpers/editor/store";

import MiddleButtons from "./MiddleButtons";

interface Props {
  id: string;
}

export default function Navbar({ id }: Props) {
  const router = useRouter();
  const localScene = useLocalScene(id);

  const setPreviewMode = useSetAtom(previewModeAtom);

  async function handleBack() {
    const canvas = document.querySelector("canvas");
    const image = canvas.toDataURL("image/jpeg", 0.5);
    await mergeLocalScene(id, { image });
    router.push(`/editor/${id}`);
  }

  function handlePreview() {
    useStore.getState().setSelected(null);
    setPreviewMode(true);
  }

  return (
    <div className="w-screen h-12 bg-white flex items-center justify-between px-2 border-b-[1px] border-neutral-200">
      <div className="flex items-center space-x-2 w-1/3">
        <div
          onClick={handleBack}
          className="hover:cursor-pointer text-xl p-2 rounded-full"
        >
          <MdArrowBackIosNew />
        </div>

        <div className="text-lg">{localScene?.name ?? id}</div>
      </div>

      <div className="w-1/3 flex justify-center text-2xl">
        <MiddleButtons />
      </div>

      <div className="w-1/3 flex justify-end space-x-2">
        <div
          onClick={handlePreview}
          className="w-10 h-10 rounded-md flex items-center justify-center
                     hover:cursor-pointer"
        >
          <IoMdEye className="text-2xl" />
        </div>
      </div>
    </div>
  );
}
