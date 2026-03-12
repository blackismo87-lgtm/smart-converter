import Link from 'next/link';
import { Video, Image as LucideImage, BarChart2, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-darkbg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Smart<span className="text-brand">Compress</span></span>
          </Link>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <Link href="/image-compressor" className="hover:text-brand transition-colors">Compresser Image</Link>
            <Link href="/video-compressor" className="hover:text-brand transition-colors">Compresser Vidéo</Link>
            <Link href="/image-converter" className="hover:text-brand transition-colors">Convertir Image</Link>
            <Link href="/video-converter" className="hover:text-brand transition-colors">Convertir Vidéo</Link>
            <Link href="/admin" className="hover:text-brand transition-colors flex items-center gap-1">
              <BarChart2 className="w-4 h-4" />
              Admin
            </Link>
            <button className="bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-full transition-all">Se connecter</button>
          </div>
          <div className="md:hidden">
            <button className="text-slate-300">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
