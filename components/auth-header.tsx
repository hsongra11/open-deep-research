import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

export function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 w-full p-4 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10">
      <Link href="/">
        <Button variant="ghost" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to HyperResearch</span>
        </Button>
      </Link>
    </header>
  );
} 