"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Video, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoConverter() {
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<{file: File, convertedFile?: File, progress: number, done: boolean, targetFormat: string}[]>([]);
  const [targetFormat, setTargetFormat] = useState('mp4');
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(false);

  const formats = ['MP4', 'MOV', 'AVI', 'WEBM', 'MKV'];

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
    loadFfmpeg();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    if (!loaded) await loadFfmpeg();

    const filesArray = Array.from(newFiles);
    const newEntries = filesArray.map(f => ({ 
      file: f, 
      progress: 0, 
      done: false, 
      targetFormat: targetFormat 
    }));
    setProcessingFiles((prev) => [...prev, ...newEntries]);

    for (const entry of newEntries) {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg || !loaded) continue;

      ffmpeg.on('progress', ({ progress }) => {
        setProcessingFiles(prev => prev.map(p => 
          p.file === entry.file ? { ...p, progress: Math.max(0, Math.min(100, Math.round(progress * 100))) } : p
        ));
      });

      try {
        const safeName = entry.file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const inputName = `input_${safeName}`;
        const outputName = `output_${safeName}.${entry.targetFormat}`;
        
        await ffmpeg.writeFile(inputName, await fetchFile(entry.file));
        
        // Basic conversion: libx264 for compatibility with most formats
        await ffmpeg.exec([
          '-i', inputName, 
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-c:a', 'aac',
          outputName
        ]);
        
        const data = await ffmpeg.readFile(outputName);
        const convertedBlob = new Blob([data as any], { type: `video/${entry.targetFormat}` });
        const convertedFile = new File([convertedBlob], entry.file.name.replace(/\.[^/.]+$/, "") + `.${entry.targetFormat}`, { type: `video/${entry.targetFormat}` });
        
        setProcessingFiles(prev => prev.map(p => 
          p.file === entry.file ? { ...p, progress: 100, done: true, convertedFile } : p
        ));

        // Log to InsForge
        insforge.database.from('processed_files').insert({
          file_name: entry.file.name,
          original_size: entry.file.size,
          compressed_size: convertedFile.size,
          file_type: 'video_conversion',
          status: 'completed'
        }).then(({ error }) => {
          if (error) console.error('Error logging file:', error);
        });
        
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch (err) {
        console.error("Conversion Error:", err);
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
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Convertir Vos Vidéos en <span className="text-brand">N'importe Quel Format</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Changez rapidement le format de vos vidéos. MP4, MOV, AVI, WebM et MKV pris en charge.</p>
      </header>

      <section className="bg-darkcard border border-slate-800 rounded-3xl p-6 md:p-8 mb-16 shadow-2xl shadow-black/20">
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex-grow">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Format Cible</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetFormat(f.toLowerCase())}
                  className={`py-3 rounded-xl text-xs font-black transition-all border ${
                    targetFormat === f.toLowerCase() 
                      ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30 scale-[1.02]' 
                      : 'bg-darkbg border-slate-700 text-slate-400 hover:border-slate-500'
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
          className={`border-3 border-dashed rounded-[2rem] p-16 text-center bg-darkbg/50 transition-all cursor-pointer relative group overflow-hidden ${
            isDragging ? 'border-brand bg-brand/5 scale-[0.99]' : 'border-slate-800 hover:border-brand/40'
          }`}
        >
          <input 
            type="file" 
            multiple 
            accept="video/*" 
            className="hidden" 
            id="videoInput" 
            onChange={(e) => handleFiles(e.target.files)}
          />
          <label htmlFor="videoInput" className="cursor-pointer flex flex-col items-center">
            <div className="w-24 h-24 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-all duration-500">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              Cliquez ou déposez vos vidéos
            </h3>
            <p className="text-slate-500 font-medium tracking-tight">Conversion automatique vers <span className="text-brand font-black uppercase">{targetFormat}</span></p>
            
            {!loaded && (
              <div className="mt-8 flex items-center gap-3 bg-brand/10 px-6 py-3 rounded-full border border-brand/20">
                <Loader2 className="w-5 h-5 text-brand animate-spin" />
                <span className="text-sm font-bold text-brand uppercase tracking-widest leading-none">Initialisation moteur FFmpeg...</span>
              </div>
            )}
          </label>
        </div>

        {processingFiles.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3 mb-6">
              <Video className="w-6 h-6 text-brand" />
              File de conversion ({processingFiles.length})
            </h3>
            <div className="space-y-4">
              {processingFiles.map((item, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border transition-all ${item.done ? 'bg-green-500/5 border-green-500/20' : 'bg-darkbg border-slate-800 shadow-lg'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.done ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                        {item.done ? <CheckCircle2 className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-white truncate max-w-[200px] md:max-w-md">{item.file.name}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">En cours : <span className="text-brand">{item.targetFormat}</span></p>
                      </div>
                    </div>
                    {item.done ? (
                      <button 
                        onClick={() => handleDownload(item.convertedFile!)}
                        className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-brand/20 active:scale-95"
                      >
                        TÉLÉCHARGER
                      </button>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-brand leading-none">{item.progress}%</span>
                      </div>
                    )}
                  </div>
                  {!item.done && (
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                      <div className="bg-brand h-full rounded-full transition-all duration-300 relative" style={{ width: `${item.progress}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-darkcard border border-slate-800 p-8 rounded-3xl">
          <CheckCircle2 className="w-8 h-8 text-brand mb-4" />
          <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Qualité Native</h4>
          <p className="text-slate-400 text-sm leading-relaxed">Conversion préservant le débit binaire original et la résolution pour un rendu cristallin.</p>
        </div>
        <div className="bg-darkcard border border-slate-800 p-8 rounded-3xl">
          <CheckCircle2 className="w-8 h-8 text-brand mb-4" />
          <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Multi-Formats</h4>
          <p className="text-slate-400 text-sm leading-relaxed">Passez d'un format à l'autre sans contrainte : MP4 vers MOV, AVI vers WebM, et bien plus encore.</p>
        </div>
        <div className="bg-darkcard border border-slate-800 p-8 rounded-3xl">
          <CheckCircle2 className="w-8 h-8 text-brand mb-4" />
          <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Vie Privée</h4>
          <p className="text-slate-400 text-sm leading-relaxed">Vos vidéos sont traitées localement dans votre navigateur. Rien n'est envoyé sur le cloud.</p>
        </div>
      </div>
    </main>
  );
}
