import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File as FileIcon, X, CheckCircle2, Music, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface FileUploadProps {
  onChange?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeBytes?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  accept = '*/*',
  maxFiles = 5,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB
  label = 'Arraste e solte seus arquivos aqui ou clique para selecionar',
  sublabel = 'Suporta arquivos MP3, WAV, JPG, PNG, WEBP até 50MB',
  className = '',
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      if (file.size > maxSizeBytes) {
        setErrorMessage(`O arquivo ${file.name} ultrapassa o tamanho máximo permitido de ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`);
        continue;
      }
      validFiles.push(file);
    }

    const updated = [...files, ...validFiles].slice(0, maxFiles);
    setFiles(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
      return <Music className="w-5 h-5 text-amber-400" />;
    }
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    }
    return <FileIcon className="w-5 h-5 text-blue-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragOver
            ? 'border-[#EEDC9A] bg-[#EEDC9A]/10 shadow-[0_0_30px_rgba(238,220,154,0.15)]'
            : 'border-white/10 hover:border-white/20 bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Glow ambient circle */}
        <div className="absolute w-32 h-32 rounded-full bg-[#EEDC9A]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center z-10 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner text-[#EEDC9A]">
            <Upload className="w-6 h-6 animate-bounce" />
          </div>

          <div className="space-y-1">
            <p className="text-sm sm:text-base font-semibold text-neutral-200">
              {label}
            </p>
            <p className="text-xs text-neutral-400">
              {sublabel}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-neutral-300">
            <span>Clique ou arraste até {maxFiles} arquivos</span>
          </div>
        </div>
      </motion.div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 mt-2"
          >
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Arquivos Selecionados ({files.length}/{maxFiles})
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file, idx) => (
                <motion.div
                  key={`${file.name}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remover arquivo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
