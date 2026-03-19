import { logo } from "../../assets/image";
import { cn } from "../../lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href={"/"}>
      <Image src={logo} alt="logo" className={cn("w-32 lg:w-44", className)} />
    </Link>
  );
};

export default Logo;
