'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface UmcHeaderProps {
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
}

export default function UmcHeader({ showBackButton = false, backButtonText = "Back", backButtonHref = "/" }: UmcHeaderProps) {
  const pathname = usePathname()
  
  // Auto-detect pages that need back buttons
  const isPetitionPage = pathname?.includes('/secretary/petition/')
  const isSecretaryPage = pathname === '/secretary'
  const isSubmitPage = pathname === '/submit'
  const isRecorderPage = pathname === '/recorder'
  const isRecorderVotePage = pathname?.includes('/recorder/vote/')
  const isRecorderApprovePage = pathname?.includes('/recorder/approve/')
  const shouldShowBackButton = showBackButton || isPetitionPage || isSecretaryPage || isSubmitPage || isRecorderPage || isRecorderVotePage || isRecorderApprovePage
  
  let finalBackButtonText = backButtonText
  let finalBackButtonHref = backButtonHref
  
  if (isPetitionPage) {
    finalBackButtonText = "Secretary Dashboard"
    finalBackButtonHref = "/secretary"
  } else if (isSecretaryPage) {
    finalBackButtonText = "Home"
    finalBackButtonHref = "/"
  } else if (isSubmitPage) {
    finalBackButtonText = "Home"
    finalBackButtonHref = "/"
  } else if (isRecorderPage) {
    finalBackButtonText = "Home"
    finalBackButtonHref = "/"
  } else if (isRecorderVotePage || isRecorderApprovePage) {
    finalBackButtonText = "Recorder"
    finalBackButtonHref = "/recorder"
  }
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Logo and back button */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              {/* UMC Logo */}
              <img 
                src="/BrandPromise_Eng_CLR.svg" 
                alt="The United Methodist Church"
                className="h-20 w-auto"
              />
            </Link>

            {/* Back Button */}
            {shouldShowBackButton && (
              <div className="ml-8">
                <Link
                  href={finalBackButtonHref}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {finalBackButtonText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}