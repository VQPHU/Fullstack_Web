import React from 'react'
import TopHeader from './TopHeader'
import Container from '../common/container'
import Logo from '../common/Logo'

const Header = () => {
  return (
    <header className='border-b sticky top-0 z-50 bg-babyShopWhite'>
      <TopHeader />
      <Container>
        <div>
          {/* Sidebar */}
          <Logo />
        </div>
      </Container>
    </header>
  )
}

export default Header