import GetStartedButton from '@/components/GetStartedButton'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Luxury gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      
      {/* Geometric patterns for luxury feel */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rotate-45" />
        <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rotate-12" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 border border-white/20 rotate-45" />
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-white/20 rotate-12" />
      </div>
      
      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-8">
        {/* Hero title with luxury typography */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6">
          <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            Your Club,
          </span>
          <br />
          <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent">
            Your Rules.
          </span>
        </h1>
        
        {/* Subtitle with premium styling */}
        <p className="mt-6 text-xl sm:text-2xl text-gray-300 max-w-4xl leading-relaxed mb-12">
          Build your exclusive club for the world's most discerning members.
          <br className="hidden sm:block" />
          <span className="text-gold-400 font-medium">Connect your wallet</span> to access the private community.
        </p>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 max-w-4xl">
          <div className="text-center p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Verified Members</h3>
            <p className="text-gray-400 text-sm">Exclusive community of authenticated yacht owners</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Platform</h3>
            <p className="text-gray-400 text-sm">Blockchain-powered security and privacy</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-gold-500 to-yellow-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Premium Experience</h3>
            <p className="text-gray-400 text-sm">Curated content and exclusive events</p>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="relative z-30">
          <GetStartedButton />
        </div>
        
        {/* Trust indicators */}
        <div className="mt-12 flex items-center space-x-8 text-gray-400 text-sm">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Blockchain Secured
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            24/7 Support
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
            Premium Community
          </div>
        </div>
      </div>
    </main>
  )
}
