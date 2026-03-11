import { Video } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 grayscale opacity-70">
          <div className="w-6 h-6 bg-slate-400 rounded flex items-center justify-center">
            <Video className="w-4 h-4 text-slate-900" />
          </div>
          <span className="text-sm font-bold text-slate-400">SmartCompress © 2023</span>
        </div>
        <div className="flex gap-8 text-sm text-slate-500">
          <a href="#" className="hover:text-brand transition-colors">Conditions d'utilisation</a>
          <a href="#" className="hover:text-brand transition-colors">Politique de confidentialité</a>
          <a href="#" className="hover:text-brand transition-colors">Contactez le support</a>
        </div>
      </div>
    </footer>
  );
}
