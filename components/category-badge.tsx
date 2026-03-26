export function CategoryBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
        type === "Sponsor"
          ? "bg-blue-100 text-blue-800"
          : type === "Inhouse"
            ? "bg-purple-100 text-purple-800"
            : "bg-gray-100 text-gray-800"
      }`}
    >
      {type}
    </span>
  );
}
