export function IconButton({ children, ...rest }) {
  return (
    <div
      {...rest}
      className="h-12 w-12 hover:cursor-pointer flex items-center
                 justify-center hover:bg-neutral-200 text-2xl rounded-xl"
    >
      {children}
    </div>
  );
}