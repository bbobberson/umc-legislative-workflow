interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
  fullScreen?: boolean
}

export default function ErrorMessage({ 
  message = 'Something went wrong. Please try again.', 
  onRetry,
  fullScreen = true 
}: ErrorMessageProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-red-500">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="text-gray-700 text-center">
        <h3 className="font-medium text-lg mb-2">Oops!</h3>
        <p className="text-sm mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      {content}
    </div>
  )
}