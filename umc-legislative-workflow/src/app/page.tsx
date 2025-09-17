'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-16">
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 font-trade">
            UMC Legislative Workflow
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Modernizing church administration with cloud-native efficiency
            <span className="block mt-2 text-lg text-primary font-medium">
              Real-time collaboration for the digital church
            </span>
          </p>
        </div>

        <div className={`grid md:grid-cols-3 gap-10 max-w-7xl mx-auto transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Petition Submission */}
          <Link href="/submit" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-white group-hover:ring-2 group-hover:ring-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <svg className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
                Submit Petition
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Submit legislative petitions with intelligent BoD paragraph lookup
              </p>
            </div>
          </Link>

          {/* Secretary Dashboard */}
          <Link href="/secretary" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-white group-hover:ring-2 group-hover:ring-green-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-6 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                <svg className="w-7 h-7 text-green-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-900 transition-colors">
                Secretary Dashboard
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Manage all petition submissions and committee assignments
              </p>
            </div>
          </Link>

          {/* Committee Recording */}
          <Link href="/recorder" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-white group-hover:ring-2 group-hover:ring-purple-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-6 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                <svg className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-900 transition-colors">
                Committee Recording
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track committee votes with real-time digital recording
              </p>
            </div>
          </Link>
        </div>

        <div className={`mt-20 text-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-700 font-medium">Live Demo Environment</p>
          </div>
          <p className="text-gray-500 text-sm">
            Next-generation legislative management • Built for General Conference 2028
          </p>
        </div>
      </div>
    </div>
  )
}