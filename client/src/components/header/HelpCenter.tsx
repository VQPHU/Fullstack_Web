import Link from 'next/link'
import React from 'react'

const HelpCenter = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-6">

                <div className="bg-white rounded-2xl px-5 py-3 mb-6 flex items-center gap-2 text-sm text-gray-500 shadow-sm">
                    <Link href="/" className="hover:text-teal-500 transition-colors">
                        🏠
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-gray-800">Help Center</span>
                </div>
            </div>
        </div>
    )
}

export default HelpCenter