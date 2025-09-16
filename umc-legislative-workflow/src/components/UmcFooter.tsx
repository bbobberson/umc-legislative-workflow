'use client'

export default function UmcFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* UMC Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {/* Cross and Flame Icon */}
              <div className="flex items-center justify-center w-8 h-8 bg-umc-red rounded-full">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                >
                  <path d="M12 2L10 8h4L12 2z" />
                  <path d="M11 8v8h2V8h-2z" />
                  <path d="M8 14h8v2H8v-2z" />
                  <path d="M9 18c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2H9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-umc-black font-trade">The United Methodist Church</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic">
              "Open Hearts. Open Minds. Open Doors."
            </p>
            <p className="text-xs text-gray-500">
              The people of The United Methodist Church®
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Legislative Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-umc-red transition-colors">Book of Discipline</a>
              </li>
              <li>
                <a href="#" className="hover:text-umc-red transition-colors">General Conference</a>
              </li>
              <li>
                <a href="#" className="hover:text-umc-red transition-colors">Petition Guidelines</a>
              </li>
              <li>
                <a href="#" className="hover:text-umc-red transition-colors">Legislative Process</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-umc-red transition-colors">Help & FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-umc-red transition-colors">Technical Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-umc-red transition-colors">Contact Secretary</a>
              </li>
              <li>
                <a href="https://umc.org" className="hover:text-umc-red transition-colors">UMC.org</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div>
            © 2024 The United Methodist Church. All rights reserved.
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span>Legislative Workflow System v2.0</span>
            <span className="text-gray-300">•</span>
            <span className="text-umc-red font-medium">Powered by UMC Innovation</span>
          </div>
        </div>
      </div>
    </footer>
  )
}