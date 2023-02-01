import { ChangeEvent, useId, useState } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  displayName?: string | null;
  inputRef?: React.MutableRefObject<HTMLInputElement>;
}

export default function FileInput({ displayName, inputRef, onChange, ...rest }: Props) {
  const id = useId();

  const [file, setFile] = useState<File>();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (onChange) onChange(e);

    const file = e.target.files?.[0];
    if (file) setFile(file);
  }

  return (
    <div className="flex flex-col space-y-1">
      <label
        htmlFor={id}
        className="block cursor-pointer rounded-lg transition hover:bg-neutral-200 active:opacity-80"
      >
        <div className="flex items-center py-2.5 px-4">
          <div className="select-none border-r border-neutral-400 pr-4">Choose File</div>
          <div className={`select-none break-all pl-4 ${file ? "" : "text-neutral-500"}`}>
            {displayName ?? (file ? file.name : "No file chosen")}
          </div>
        </div>
      </label>

      <div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="hidden"
          onChange={handleChange}
          {...rest}
        />
      </div>
    </div>
  );
}
