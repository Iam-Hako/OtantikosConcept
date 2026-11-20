export default function Loading() {
  return (
    <div className="w-full min-h-[calc(100dvh-4.5rem)] bg-white">
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-stone-100 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square w-full bg-stone-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
