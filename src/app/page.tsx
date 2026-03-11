import Link from 'next/link';
import { Upload, Image as LucideImage, Video, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Compression <span className="text-brand">Image et Vidéo</span> Gratuite en Ligne
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Réduisez la taille de vos fichiers sans perte de qualité. Rapide, sécurisé et fonctionne directement dans votre navigateur. Pas d'inscription requise.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <button className="group relative inline-flex items-center justify-center px-12 py-6 font-bold text-white transition-all duration-200 bg-brand rounded-2xl shadow-xl shadow-brand/20 hover:scale-105 active:scale-95">
              <Upload className="w-6 h-6 mr-3 animate-bounce" />
              Télécharger les fichiers à compresser
            </button>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Prend en charge PNG, JPG, WebP, MP4, MOV</span>
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]"></div>
        </div>
      </section>

      {/* Tool Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
        {/* Image Tools */}
        <div className="p-8 rounded-3xl bg-darkcard border border-slate-800 hover:border-brand/50 transition-all duration-300">
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand mb-6">
            <LucideImage className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Compresseur d'Image</h3>
          <p className="text-slate-400 mb-6">Optimisez les images JPEG, PNG et WebP. Compressez par lots jusqu'à 50 images à la fois avec un contrôle intelligent de la qualité.</p>
          <ul className="space-y-3 mb-8 text-sm text-slate-300">
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Options avec et sans perte</li>
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Redimensionner par dimensions</li>
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Convertir en WebP</li>
          </ul>
          <Link href="/image-compressor" className="inline-flex items-center text-brand font-semibold hover:underline">
            Lancer l'outil Image →
          </Link>
        </div>

        {/* Video Tools */}
        <div className="p-8 rounded-3xl bg-darkcard border border-slate-800 hover:border-brand/50 transition-all duration-300">
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand mb-6">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Compresseur Vidéo</h3>
          <p className="text-slate-400 mb-6">Réduisez les fichiers MP4, MOV et AVI. Parfait pour les limites de partage par Email, Discord ou WhatsApp.</p>
          <ul className="space-y-3 mb-8 text-sm text-slate-300">
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Codecs MP4/H.264 & H.265</li>
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Sélection de la taille cible</li>
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Support 4K/1080p</li>
          </ul>
          <Link href="/video-compressor" className="inline-flex items-center text-brand font-semibold hover:underline">
            Lancer l'outil Vidéo →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Pourquoi les Professionnels Choisissent SmartCompress</h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">Confidentialité Avant Tout</h4>
              <p className="text-slate-400">Les fichiers sont traités localement dans votre navigateur. Nous ne stockons ni ne voyons jamais vos médias privés.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">Rapidité Éclatante</h4>
              <p className="text-slate-400">Propulsé par WebAssembly pour des performances quasi-natives directement dans votre navigateur.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">Zéro Perte de Qualité</h4>
              <p className="text-slate-400">Des algorithmes avancés garantissent que vos visuels restent nets tandis que la taille du fichier chute.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <article className="max-w-4xl mx-auto px-4 py-20 border-t border-slate-800">
        <h2 className="text-2xl font-bold mb-6">Comment Compresser des Fichiers Multimédia en Ligne</h2>
        <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed">
          <p className="mb-4">
            Vous cherchez un moyen de réduire la taille d'une image ou de compresser une vidéo sans perdre en qualité ? <strong>SmartCompress</strong> propose la boîte à outils gratuite en ligne ultime pour les créateurs, les développeurs et les utilisateurs quotidiens. Les fichiers volumineux peuvent ralentir les performances de votre site web, saturer le stockage cloud et rendre le partage sur les réseaux sociaux impossible.
          </p>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Compression d'Images (JPG, PNG, WebP)</h3>
          <p className="mb-4">
            Notre moteur de compression d'image utilise des techniques de quantification de pointe pour supprimer les métadonnées inutiles et optimiser les palettes de couleurs. Cela permet d'obtenir des réductions de taille de fichier allant jusqu'à 80 % sans différence visible à l'œil nu. Que vous ayez besoin d'optimiser des photos haute résolution pour un portfolio ou de petites miniatures pour un blog, notre outil gère tout.
          </p>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Compression Vidéo pour Toutes les Plateformes</h3>
          <p className="mb-4">
            Les fichiers vidéo sont notoirement encombrants. SmartCompress vous permet de réduire les fichiers MP4 et MOV spécifiquement pour des plateformes comme Discord (moins de 8Mo/25Mo), Gmail ou Slack. En ajustant le débit binaire (bitrate) et la résolution, nous garantissons que vos vidéos restent claires tout en devenant nettement plus faciles à télécharger et à diffuser en continu.
          </p>
        </div>
      </article>
    </main>
  );
}
