type CardBackProps = {
  className?: string;
};

export function CardBack({ className }: CardBackProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/cards/BACK.svg"
      alt="Hidden card"
      width={70}
      height={98}
      className={`rounded-md border border-zinc-600 shadow-sm dark:border-zinc-500 ${className ?? ""}`}
      draggable={false}
    />
  );
}
