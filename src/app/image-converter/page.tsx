"use client";

import { useState } from 'react';
import { Upload, Image as LucideImage, CheckCircle2, ChevronDown } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { convertImage } from '@/lib/utils';

export default function ImageConverter() {
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<{file: File, convertedFile?: File, progress: number, done: boolean, targetFormat: string}[]>([]);
  const [targetFormat, setTargetFormat] = useState('png');

  const formats = ['PNG', 'JPG', 'WEBP', 'GIF'];

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    processingFiles.filter(p => p.done && p.convertedFile).forEach((p, index) => {
      setTimeout(() => {
        handleDownload(p.convertedFile!);
      }, index * 200);
    });
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const filesArray = Array.from(newFiles);
    const newEntries = filesArray.map(f => ({ 
      file: f, 
      progress: 0, 
      done: false, 
      targetFormat: targetFormat 
    }));
    setProcessingFiles((prev) => [...prev, ...newEntries]);

    newEntries.forEach((entry) => {
      let currentProgress = 0;
      const interval = setInterval(async () => {
        currentProgress += Math.floor(Math.random() * 20) + 10;
        if (currentProgress >= 90) {
          clearInterval(interval);
          try {
            const converted = await convertImage(entry.file, entry.targetFormat);
            
            setProcessingFiles(prev => prev.map(p => 
              p.file === entry.file ? { ...p, convertedFile: converted, progress: 100, done: true } : p
            ));

            // Log to InsForge
            insforge.database.from('processed_files').insert({
              file_name: entry.file.name,
              original_size: entry.file.size,
              compressed_size: converted.size,
              file_type: 'image_conversion',
              status: 'completed'
            }).then(({ error }) => {
              if (error) console.error('Error logging file:', error);
            });
          } catch (error) {
            console.error('Conversion failed:', error);
            setProcessingFiles(prev => prev.map(p => 
              p.file === entry.file ? { ...p, progress: 100, done: true } : p
            ));
          }
        } else {
          setProcessingFiles(prev => prev.map(p => 
            p.file === entry.file ? { ...p, progress: currentProgress } : p
          ));
        }
      }, 200 + Math.random() * 300);
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
        <div className="lg:col-span-8 space-y-8">
          <section className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Convertir des Images <span className="text-brand">en Tous Formats</span>
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Changez le format de vos images instantanément. PNG, JPG, WebP et GIF pris en charge avec une qualité optimale.
            </p>
          </section>

          <section className="bg-darkcard border border-slate-800 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-slate-400 mb-2">Format de sortie souhaité</label>
                <div className="grid grid-cols-4 gap-2">
                  {formats.map((f) => (
                    <button
                      key={f}
                      onClick={() => setTargetFormat(f.toLowerCase())}
                      className={`py-2 rounded-xl text-sm font-bold transition-all ${
                        targetFormat === f.toLowerCase() 
                          ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center bg-darkbg transition-all cursor-pointer group ${
                isDragging ? 'border-brand bg-brand/5' : 'border-slate-800 hover:border-brand/50'
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
                <p className="text-slate-500 mt-2">pour les convertir en <span className="text-brand font-bold uppercase">{targetFormat}</span></p>
              </label>
            </div>

            {processingFiles.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <LucideImage className="w-5 h-5 text-brand" />
                  Files en cours de conversion ({processingFiles.length})
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
                            <p className="text-xs text-slate-500">Vers <span className="uppercase font-bold text-brand">{item.targetFormat}</span></p>
                          </div>
                        </div>
                        {item.done ? (
                          <button 
                            onClick={() => handleDownload(item.convertedFile!)}
                            className="text-brand hover:text-brand-hover text-xs font-bold underline flex items-center gap-1"
                          >
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
                    </div>
                  ))}
                </div>
                {processingFiles.every(p => p.done) && (
                  <button 
                    onClick={handleDownloadAll}
                    className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand/20 active:scale-95"
                  >
                    Tout télécharger
                  </button>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-darkcard border border-slate-800 rounded-2xl p-6">
            <h4 className="text-white font-bold mb-4">Fonctionnalités</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand mt-0.5" />
                <span className="text-sm text-slate-400">Conversion haute fidélité</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand mt-0.5" />
                <span className="text-sm text-slate-400">Prise en charge du canal Alpha (Transparence)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand mt-0.5" />
                <span className="text-sm text-slate-400">Traitement 100% local dans le navigateur</span>
              </li>
            </ul>
          </div>

          <div className="bg-darkcard border border-slate-800 rounded-2xl p-4 min-h-[300px] flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Publicité</span>
            <div className="w-full h-full bg-slate-900/50 border border-dashed border-slate-700 rounded-xl flex items-center justify-center">
              <p className="text-slate-500 text-sm">AdSense Display</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
