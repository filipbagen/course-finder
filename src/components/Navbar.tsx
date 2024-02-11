// import Link from 'next/link';
import { Link } from 'react-router-dom';
import { buttonVariants } from './ui/button';
// import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server';
import { ArrowRight } from 'lucide-react';
import MaxWidthWrapper from './MaxWidthWrapper';

const Navbar = () => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 dark:border-black bg-white/75 dark:bg-gray-950/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-black">
          <Link to="/" className="flex z-40 font-semibold">
            Course Finder
          </Link>

          {/* todo: add mobile navbar */}

          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                to="/dashboard"
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                })}
              >
                Pricing
              </Link>
              <div
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                })}
              >
                Login
              </div>
              <div
                className={buttonVariants({
                  size: 'sm',
                })}
              >
                Get started <ArrowRight className="ml-1.5 h-5 w-5" />
              </div>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
