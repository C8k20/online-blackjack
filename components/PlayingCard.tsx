type PlayingCardProps = {
  cardId: string;
  alt?: string;
  className?: string;
};

export function PlayingCard({ cardId, alt, className }: PlayingCardProps) {
  const src = `/cards/${cardId}.svg`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? cardId}
      width={70}
      height={98}
      className={`rounded-md border border-zinc-300 shadow-sm dark:border-zinc-600 ${className ?? ""}`}
      draggable={false}
    />
  );
}
