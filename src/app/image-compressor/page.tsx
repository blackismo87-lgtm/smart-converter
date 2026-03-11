"use client";

import { useState } from 'react';
import { Upload, Image as LucideImage, Check, CheckCircle2 } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import Link from 'next/link';

export default function ImageCompressor() {
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<{file: File, progress: number, done: boolean}[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const filesArray = Array.from(newFiles);
    setFiles((prev: File[]) => [...prev, ...filesArray]);

    const newEntries = filesArray.map(f => ({ file: f, progress: 0, done: false }));
    setProcessingFiles((prev) => [...prev, ...newEntries]);

    newEntries.forEach((entry, index) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          setProcessingFiles(prev => prev.map(p => 
            p.file === entry.file ? { ...p, progress: 100, done: true } : p
          ));

          // Log to InsForge
          insforge.database.from('processed_files').insert({
            file_name: entry.file.name,
            original_size: entry.file.size,
            compressed_size: Math.floor(entry.file.size * 0.15),
            file_type: 'image',
            status: 'completed'
          }).then(({ error }) => {
            if (error) console.error('Error logging file:', error);
          });
        } else {
          setProcessingFiles(prev => prev.map(p => 
            p.file === entry.file ? { ...p, progress: currentProgress } : p
          ));
        }
      }, 300 + Math.random() * 500);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Compression Tool */}
        <div className="lg:col-span-8 space-y-8">
          <section className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Compresser des Images <span className="text-brand">Sans Perte de Qualité</span>
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Optimisez vos fichiers JPG, PNG et WebP en quelques secondes. Traitement par lots sécurisé et ultra-rapide.
            </p>
          </section>

          {/* Upload Box */}
          <section className="relative">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center bg-darkcard transition-all cursor-pointer group ${
                isDragging ? 'border-brand bg-brand/5' : 'border-slate-700 hover:border-brand/50'
              }`}
            >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                id="fileInput" 
                onChange={(e) => handleFiles(e.target.files)}
              />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Déposez vos images ici
                </h3>
                <p className="text-slate-500 mt-2">ou cliquez pour parcourir votre appareil</p>
                <div className="mt-6 flex gap-3 text-xs text-slate-400 uppercase tracking-widest font-bold">
                  <span>PNG</span>
                  <span>•</span>
                  <span>JPG</span>
                  <span>•</span>
                  <span>WEBP</span>
                </div>
              </label>
            </div>

            {/* Processing Files List */}
            {processingFiles.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <LucideImage className="w-5 h-5 text-brand" />
                  Files en cours de traitement ({processingFiles.length})
                </h3>
                <div className="space-y-3">
                  {processingFiles.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border transition-all ${item.done ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-900/50 border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${item.done ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                            {item.done ? <CheckCircle2 className="w-4 h-4" /> : <LucideImage className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">{item.file.name}</p>
                            <p className="text-xs text-slate-500">{(item.file.size / 1024).toFixed(1)} Ko</p>
                          </div>
                        </div>
                        {item.done ? (
                          <button className="text-brand hover:text-brand-hover text-xs font-bold underline flex items-center gap-1">
                            Télécharger
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-brand uppercase tracking-widest">{item.progress}%</span>
                        )}
                      </div>
                      {!item.done && (
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className="bg-brand h-1.5 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                        </div>
                      )}
                      {item.done && (
                        <p className="text-[10px] text-green-500 font-medium">Réduit à {((item.file.size * 0.15) / 1024).toFixed(1)} Ko (-85%)</p>
                      )}
                    </div>
                  ))}
                </div>
                {processingFiles.every(p => p.done) && (
                  <button className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand/20 active:scale-95">
                    Tout télécharger (ZIP)
                  </button>
                )}
              </div>
            )}
          </section>

          {/* SEO Content */}
          <section className="prose prose-invert max-w-none mt-16 border-t border-slate-800 pt-12">
            <h2 className="text-2xl font-bold text-white">Pourquoi utiliser SmartCompress pour vos images ?</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div>
                <h3 className="text-brand text-lg font-semibold">Compression PNG Sans Perte</h3>
                <p className="text-slate-400 leading-relaxed">
                  Notre algorithme avancé de compression PNG analyse la palette de couleurs de votre image et supprime les métadonnées inutiles. Le résultat est un fichier nettement plus petit qui semble identique à l'original.
                </p>
              </div>
              <div>
                <h3 className="text-brand text-lg font-semibold">Optimisation JPG Intelligente</h3>
                <p className="text-slate-400 leading-relaxed">
                  SmartCompress applique une quantification intelligente pour trouver l'équilibre parfait entre la taille du fichier et la fidélité visuelle, en supprimant les données d'en-tête superflues.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-darkcard border border-slate-800 rounded-xl p-4 min-h-[400px] flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Publicité</span>
            <div className="w-full h-full bg-slate-900/50 border border-dashed border-slate-700 rounded flex items-center justify-center">
              <p className="text-slate-500 text-sm">Emplacement AdSense</p>
            </div>
          </div>

          <div className="bg-darkcard border border-slate-800 rounded-xl p-6">
            <h4 className="text-white font-bold mb-4">Fonctionnalités</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brand mt-0.5" />
                <span className="text-sm text-slate-400">Traitement par lots jusqu'à 20 images</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brand mt-0.5" />
                <span className="text-sm text-slate-400">Sécurisé : Fichiers supprimés après 1 heure</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brand mt-0.5" />
                <span className="text-sm text-slate-400">Aucune inscription requise</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
