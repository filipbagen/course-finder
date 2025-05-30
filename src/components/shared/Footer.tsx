import React from 'react';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col justify-center items-center py-8 mt-auto">
      <Separator className="mb-4" />
      <p className="text-slate-400 text-sm">
        Designad och utvecklad av{' '}
        <a href="https://filipbagen.com" target="_blank" rel="noopener noreferrer">
          <u>
            <b>mig</b>
          </u>
        </a>
      </p>
    </footer>
  );
};

export default Footer;