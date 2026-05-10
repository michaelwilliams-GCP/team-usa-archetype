export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07101f] px-6 text-white">
      <div className="w-full max-w-md rounded-lg border border-white/12 bg-[#0a1424] p-6 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold text-[#f6c756]">Team USA Archetype Lab</p>
        <h1 className="mt-2 text-4xl font-black">Loading the board</h1>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-scan bg-[#f6c756]" />
        </div>
      </div>
    </main>
  );
}
