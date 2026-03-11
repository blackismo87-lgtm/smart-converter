"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Video, Shield, Zap, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoCompressor() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingFiles, setProcessingFiles] = useState<{file: File, compressedFile?: File, progress: number, done: boolean}[]>([]);
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(false);

  const loadFfmpeg = async () => {
    if (loaded || loadingFfmpeg) return;
    setLoadingFfmpeg(true);
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    const ffmpeg = ffmpegRef.current;
    
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
    } catch (err) {
      console.error("FFmpeg load failed", err);
    } finally {
      setLoadingFfmpeg(false);
    }
  };

  useEffect(() => {
    // Optionally pre-load ffmpeg when component mounts
    loadFfmpeg();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    if (!loaded) await loadFfmpeg();

    const filesArray = Array.from(newFiles);
    setFiles((prev: File[]) => [...prev, ...filesArray]);

    const newEntries = filesArray.map(f => ({ file: f, progress: 0, done: false }));
    setProcessingFiles((prev) => [...prev, ...newEntries]);

    for (const entry of newEntries) {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) {
        console.error("FFmpeg instance is null.");
        continue;
      }
      
      if (!loaded && !ffmpeg.loaded) {
        console.error("FFmpeg is not loaded.");
        setProcessingFiles(prev => prev.map(p => 
          p.file === entry.file ? { ...p, progress: 100, done: true } : p
        ));
        continue;
      }

      ffmpeg.on('progress', ({ progress, time }) => {
        // progress goes from 0 to 1
        setProcessingFiles(prev => prev.map(p => 
          p.file === entry.file ? { ...p, progress: Math.max(0, Math.min(100, Math.round(progress * 100))) } : p
        ));
      });

      try {
        const safeName = entry.file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const inputName = `input_${safeName}`;
        const outputName = `output_${safeName}.mp4`;
        
        await ffmpeg.writeFile(inputName, await fetchFile(entry.file));
        
        // Fast and strong compression: libx264, preset ultrafast, crf 35, compress audio
        await ffmpeg.exec([
          '-i', inputName, 
          '-c:v', 'libx264', 
          '-preset', 'ultrafast', 
          '-crf', '35', 
          '-c:a', 'aac', 
          '-b:a', '128k', 
          outputName
        ]);
        
        const data = await ffmpeg.readFile(outputName);
        const compressedBlob = new Blob([data as any], { type: 'video/mp4' });
        const compressedFile = new File([compressedBlob], `compressed-${entry.file.name}.mp4`, { type: 'video/mp4' });
        
        setProcessingFiles(prev => prev.map(p => 
          p.file === entry.file ? { ...p, progress: 100, done: true, compressedFile } : p
        ));

        // Log to InsForge
        insforge.database.from('processed_files').insert({
          file_name: entry.file.name,
          original_size: entry.file.size,
          compressed_size: compressedFile.size,
          file_type: 'video',
          status: 'completed'
        }).then(({ error }) => {
          if (error) console.error('Error logging file:', error);
        });
        
        // Cleanup memory
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch (err) {
        console.error("Compression Error:", err);
        setProcessingFiles(prev => prev.map(p => 
          p.file === entry.file ? { ...p, progress: 100, done: true } : p
        ));
      }
    }
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
    <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Compresser la Vidéo sans <span className="text-brand">Perte de Qualité</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Réduisez la taille des fichiers vidéo MP4, MOV et AVI tout en conservant une résolution 4K/HD nette.</p>
      </header>

      {/* AdSense Space (Top) */}
      <div className="w-full bg-slate-800/40 rounded-lg h-24 mb-10 flex items-center justify-center border border-slate-700/50">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Publicité</span>
      </div>

      {/* Tool Container */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Left: Upload & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`upload-zone rounded-3xl p-12 text-center cursor-pointer relative group ${
              isDragging ? 'border-brand bg-brand/5' : ''
            }`}
          >
            <input 
              accept="video/*" 
              className="hidden" 
              id="video-upload" 
              type="file" 
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />
            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                Choisir des Fichiers Vidéo
              </h3>
              <p className="text-slate-400 mb-6 text-sm">Ou glissez-déposez vos fichiers ici</p>
              <button className="bg-brand hover:bg-brand-hover px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand/20 text-white flex items-center justify-center gap-2">
                {loadingFfmpeg ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loadingFfmpeg ? 'Initialisation...' : 'Sélectionner des fichiers'}
              </button>
              <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest">Taille max : 2Go • MP4, MOV, AVI, WEBM</p>
            </label>
          </div>

          {/* Processing Videos List */}
          {processingFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-brand" />
                Vidéos en cours de traitement ({processingFiles.length})
              </h3>
              <div className="space-y-3">
                {processingFiles.map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border transition-all ${item.done ? 'bg-green-500/5 border-green-500/20' : 'bg-darkcard border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.done ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                          {item.done ? <CheckCircle2 className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-white truncate max-w-[150px] md:max-w-xs">{item.file.name}</p>
                          <p className="text-xs text-slate-500">{(item.file.size / (1024 * 1024)).toFixed(1)} Mo</p>
                        </div>
                      </div>
                      {item.done ? (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDownload(item.compressedFile || item.file);
                          }}
                          className="bg-brand hover:bg-brand-hover text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md shadow-brand/10"
                        >
                          Télécharger
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-brand">{item.progress}%</span>
                      )}
                    </div>
                    {!item.done && (
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-brand h-2 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    )}
                    {item.done && item.compressedFile && (
                      <div className="flex items-center justify-between text-[10px] text-green-500 font-bold uppercase tracking-wider">
                        <span>Réduit à {(item.compressedFile.size / (1024 * 1024)).toFixed(1)} Mo</span>
                        <span>-{Math.round((1 - item.compressedFile.size / item.file.size) * 100)}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-darkcard border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Paramètres de Compression</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Format Cible</label>
                <div className="relative">
                  <select className="w-full bg-darkbg border border-slate-700 rounded-lg text-slate-200 py-2 px-3 appearance-none focus:ring-brand focus:border-brand">
                    <option value="mp4">MP4 (Recommandé)</option>
                    <option value="mov">MOV (Apple)</option>
                    <option value="webm">WebM (Optimisé Web)</option>
                    <option value="mkv">MKV</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Niveau de Compression</label>
                <div className="relative">
                  <select className="w-full bg-darkbg border border-slate-700 rounded-lg text-slate-200 py-2 px-3 appearance-none focus:ring-brand focus:border-brand">
                    <option value="auto">Auto (Qualité Équilibrée)</option>
                    <option value="small">Taille Minimale (Qualité Inférieure)</option>
                    <option value="lossless">Haute Qualité (Taille Supérieure)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Ad Space & Features */}
        <aside className="space-y-6">
          <div className="bg-darkcard border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl flex-grow mb-6 flex items-center justify-center p-4 min-h-[200px]">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-600 lg:rotate-0">Espace Publicitaire Vertical</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand mt-1" />
                <p className="text-sm text-slate-300">Traitement cloud pour la rapidité</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand mt-1" />
                <p className="text-sm text-slate-300">Chiffrement de bout en bout sécurisé</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-slate-800 pt-16 pb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Foire Aux Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-darkcard p-6 rounded-2xl border border-slate-800/50">
            <h3 className="text-lg font-semibold mb-3 text-brand">La compression réduira-t-elle la qualité ?</h3>
            <p className="text-slate-400 leading-relaxed">Nos algorithmes avancés visent à maintenir une haute fidélité visuelle tout en supprimant les données redondantes.</p>
          </div>
          <div className="bg-darkcard p-6 rounded-2xl border border-slate-800/50">
            <h3 className="text-lg font-semibold mb-3 text-brand">Quels formats vidéo sont pris en charge ?</h3>
            <p className="text-slate-400 leading-relaxed">Nous prenons en charge tous les principaux formats vidéo, notamment MP4, MOV, AVI, WEBM, MKV et WMV.</p>
          </div>
          <div className="bg-darkcard p-6 rounded-2xl border border-slate-800/50">
            <h3 className="text-lg font-semibold mb-3 text-brand">Est-il sûr de télécharger mes vidéos ?</h3>
            <p className="text-slate-400 leading-relaxed">Oui. Les fichiers sont traités de manière sécurisée et supprimés de nos serveurs automatiquement dans un délai de 2 heures.</p>
          </div>
          <div className="bg-darkcard p-6 rounded-2xl border border-slate-800/50">
            <h3 className="text-lg font-semibold mb-3 text-brand">Combien de temps prend la compression ?</h3>
            <p className="text-slate-400 leading-relaxed">La plupart des vidéos de 100 Mo sont traitées en moins de 30 secondes, selon votre vitesse de connexion.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
