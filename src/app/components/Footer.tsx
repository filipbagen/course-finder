import React from 'react';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col justify-center items-center my-8">
      <Separator />
      <p className="text-slate-400 text-sm">
        Designed and developed by{' '}
        <a href="https://filipbagen.com" target="_blank">
          <u>
            <b>Filip</b>
          </u>
        </a>
      </p>
    </footer>
  );
};

export default Footer;
