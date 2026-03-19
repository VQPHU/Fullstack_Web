import React from 'react'
import TopHeader from './TopHeader'
import Container from '../common/container'
import Logo from '../common/Logo'
import Searchinput from './Searchinput'
import OrdersIcon from './OrdersIcon'
import WishlistIcon from './WishlistIcon'
import UserButton from './UserButton'
import CartIcon from './CartIcon'

const Header = () => {
  return (
    <header className='border-b sticky top-0 z-50 bg-babyShopWhite'>
      <TopHeader />
      <Container className='flex items-center justify-between gap-10 py-4'>
        <div className="flex flex-1 items-center justify-between md:justify-start md:gap-12">
          {/* Sidebar */}
          <Logo />
          <div className="md:hidden flex items-center gap-3">
            OrdersIcon WishlistIcon CartIcon
          </div>
          <Searchinput />
        </div>
        <div className='className="hidden md:inline-flex items-center gap-5'>
          <OrdersIcon />
          < WishlistIcon />
          <UserButton />
          <CartIcon />
        </div>
      </Container>
    </header>
  )
}

export default Header