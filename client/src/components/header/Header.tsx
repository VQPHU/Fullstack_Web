import React from 'react'
import TopHeader from './TopHeader'
import Container from '../common/container'
import Logo from '../common/Logo'
import Searchinput from './Searchinput'
import OrdersIcon from './OrdersIcon'
import WishlistIcon from './WishlistIcon'
import UserButton from './UserButton'
import CartIcon from './CartIcon'
import Sidebar from './Sidebar'


const Header = () => {
  return (
    <header className='border-b sticky top-0 z-50 bg-babyshopWhite'>
      <TopHeader />
      <Container className='flex items-center justify-between gap-10 py-4'>
        <div className="flex flex-1 items-center justify-between md:justify-start md:gap-12">
          <Sidebar />
          <Logo />
          <div className="md:hidden flex items-center gap-3">
            <OrdersIcon />
            <WishlistIcon />
            <CartIcon />
          </div>
          <Searchinput />
        </div>
        <div className="hidden md:inline-flex items-center gap-5">
          <OrdersIcon />
          < WishlistIcon />
          <CartIcon />
          <UserButton />
        </div>
      </Container>
    </header>
  )
}

export default Header