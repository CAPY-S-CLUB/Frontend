import GetStartedButton from '@/components/GetStartedButton'
export default function Home() {
  return (
    <main className="relative min-h-screen text-white w-full">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 z-10 bg-black/60" />
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center p-4 sm:p-8">
        <h1 className="text-6xl font-bold tracking-tight">Exclusivity, Verified.</h1>
        <p className="mt-4 text-xl text-gray-300 mb-8">
          The digital home for the worlds most discerning yacht owners. Connect your wallet to access the private community.
        </p>
        <div className="relative z-30">
          {/* Get Started button */}
          <GetStartedButton />
        </div>
      </div>
    </main>
  )
}
