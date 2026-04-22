export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin" />
        <div className="absolute inset-0 bg-blue-600/10 blur-xl animate-pulse rounded-full" />
      </div>
      <h2 className="text-xl font-black tracking-tighter uppercase text-slate-800">
        Skill Forge <span className="text-blue-600">Initializing...</span>
      </h2>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-4">
        Connecting to Secure Database
      </p>
    </div>
  );
}
