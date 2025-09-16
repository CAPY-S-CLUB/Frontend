export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Premium Floating particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* Premium star particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="star-particle w-1 h-1 top-[20%] left-[15%]" style={{animationDelay: '0s'}}></div>
        <div className="star-particle w-1.5 h-1.5 top-[35%] left-[80%]" style={{animationDelay: '1s'}}></div>
        <div className="star-particle w-1 h-1 top-[60%] left-[25%]" style={{animationDelay: '2s'}}></div>
        <div className="star-particle w-2 h-2 top-[15%] left-[70%]" style={{animationDelay: '3s'}}></div>
        <div className="star-particle w-1 h-1 top-[80%] left-[60%]" style={{animationDelay: '4s'}}></div>
        <div className="star-particle w-1.5 h-1.5 top-[25%] left-[45%]" style={{animationDelay: '5s'}}></div>
        <div className="star-particle w-1 h-1 top-[70%] left-[85%]" style={{animationDelay: '6s'}}></div>
        <div className="star-particle w-2 h-2 top-[45%] left-[10%]" style={{animationDelay: '7s'}}></div>
      </div>
      
      {/* Premium glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-amber-400/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-yellow-500/10 to-amber-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      
      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-8">
        {/* Premium Hero title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 uppercase relative premium-title font-extrabold">
          Your Club,
          <br />
          <span className="text-slate-300 font-black">
            Your Rules
          </span>
        </h1>
        
        {/* Premium Subtitle */}
        <p className="mt-6 text-xl sm:text-2xl premium-subtitle max-w-4xl leading-relaxed mb-12">
          
        </p>
        
        {/* Premium Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl">
          <div className="premium-card group relative p-8 rounded-2xl transition-all duration-300 hover:scale-105">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-premium-gold to-premium-gold-light rounded-xl mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-premium-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold premium-text mb-4">Verified Members</h3>
              <p className="premium-subtitle leading-relaxed">Exclusive community of authenticated yacht owners</p>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verified Members</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Exclusive community of authenticated yacht owners</p>
          </div>
          
          <div className="premium-card group relative p-8 rounded-2xl transition-all duration-300 hover:scale-105">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-premium-gold to-premium-gold-light rounded-xl mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-premium-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold premium-text mb-4">Secure Platform</h3>
              <p className="premium-subtitle leading-relaxed">Blockchain-powered security and privacy</p>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure Platform</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Blockchain-powered security and privacy</p>
          </div>
          
          <div className="premium-card group relative p-8 rounded-2xl transition-all duration-300 hover:scale-105">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-premium-gold to-premium-gold-light rounded-xl mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-premium-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold premium-text mb-4">Premium Experience</h3>
              <p className="premium-subtitle leading-relaxed">Curated content and exclusive events</p>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Premium Experience</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Curated content and exclusive events</p>
          </div>
        </div>
        
        {/* Premium Call to action */}
        <div className="mb-16">
          <button className="premium-button group relative px-12 py-4 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105">
            <span className="relative z-10"></span>
          </button>
        </div>
        
        {/* Premium Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 premium-subtitle text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-premium-gold rounded-full animate-pulse" />
            <span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-premium-gold rounded-full animate-pulse" style={{animationDelay: '1s'}} />
            <span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-premium-gold rounded-full animate-pulse" style={{animationDelay: '2s'}} />
            <span></span>
          </div>
        </div>
      </div>
    </main>
  )
}
