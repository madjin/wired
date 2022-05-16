interface Props {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function ProfileMenuButton({ icon, children }: Props) {
  return (
    <div
      className="flex items-center cursor-pointer hover:bg-surfaceVariant rounded-lg
                 w-full py-1 px-2 space-x-2 transition font-bold"
    >
      {icon && <div className="text-lg">{icon}</div>}
      <div>{children}</div>
    </div>
  );
}