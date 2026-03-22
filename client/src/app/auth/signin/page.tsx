import SigninForm from '@/components/common/pages/auth/SigninForm'
import React from 'react'

const SignInPage = () => {
  return (
        <div className="p-5 md:p-10">
      <div className="max-w-4xl mx-auto bg-babyshopWhite p-5 md:p-10 flex flex-col items-center rounded-md border shadow">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-1">Sign In</h3>
          <p>
            Login to access{" "}
            <span className="text-babyshopSky font-medium">Babaymart</span>
          </p>
        </div>
        <SigninForm />
      </div>
    </div>
  )
}

export default SignInPage
