import React, { useState } from 'react';
import { X, Code, Copy, Upload } from 'lucide-react';

interface EmbedModalProps {
  onClose: () => void;
}

const EmbedModal: React.FC<EmbedModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate an embed code that includes a script to handle auto-resizing
  // This ensures the calendar is never scrollable and always fits the content
  const iframeCode = `
<div id="titans-calendar-container" style="width: 100%; min-width: 320px;">
  <script>
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'titans-calendar-resize') {
        var iframe = document.getElementById('titans-calendar-embed');
        if (iframe) iframe.style.height = e.data.height + 'px';
      }
    });
  </script>
  <iframe 
    id="titans-calendar-embed"
    src="${window.location.href}" 
    style="width: 100%; border: none; background-color: transparent; display: block; overflow: hidden;"
    scrolling="no"
    title="Titans Calendar"
  ></iframe>
</div>
`.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in" onClick={handleOverlayClick}>
        <div className="bg-theme-base border border-theme-gold/30 rounded-2xl shadow-2xl shadow-theme-gold/10 w-full max-w-2xl overflow-hidden zoom-in">
            <div className="flex items-center justify-between p-6 border-b border-theme-light/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-gold text-theme-base rounded-lg">
                        <Code className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-theme-gold">Embed Calendar</h3>
                </div>
                <button onClick={onClose} className="text-theme-muted hover:text-theme-gold transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6 bg-theme-dark max-h-[60vh] overflow-y-auto custom-scrollbar">
                
                {/* Step 1: Hosting Warning */}
                <div className="p-4 bg-theme-light/20 rounded-lg border border-theme-light/50 flex gap-4 items-start">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                        <Upload className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-theme-text font-bold text-sm uppercase tracking-wider mb-1">Step 1: Host Your Calendar</h4>
                        <p className="text-theme-muted text-xs leading-relaxed">
                            You cannot paste this code directly into your website builder (like GoDaddy) until you host this app online.
                            <br/><br/>
                            <span className="text-white font-bold">Deploy to Netlify:</span>
                            <ol className="list-decimal list-inside mt-1 ml-1 space-y-1">
                                <li>Run <code className="bg-black/30 px-1 rounded text-theme-gold">npm run build</code></li>
                                <li>Upload the <code className="bg-black/30 px-1 rounded">dist</code> folder to <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">Netlify Drop</a>.</li>
                                <li>Replace the URL in the code below with your new Netlify link.</li>
                            </ol>
                        </p>
                    </div>
                </div>

                {/* Step 2: Code Snippet */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-theme-gold font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                            Step 2: Copy Embed Code
                        </h4>
                        {copied && <span className="text-green-500 text-xs font-bold uppercase fade-in">Copied!</span>}
                    </div>
                    
                    <div className="relative group">
                         <div className="absolute top-2 right-2">
                            <button onClick={copyToClipboard} className="p-2 bg-theme-light hover:bg-theme-gold hover:text-theme-base text-theme-muted rounded-md transition-all">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <pre className="bg-black/50 border border-theme-light/30 rounded-xl p-4 text-xs font-mono text-theme-muted overflow-x-auto whitespace-pre-wrap break-all selection:bg-theme-gold selection:text-theme-base">{iframeCode}</pre>
                    </div>
                    <p className="text-theme-muted text-[10px] italic text-center">This code includes a script to automatically resize the calendar so it never needs scrollbars.</p>
                </div>
            </div>

            <div className="p-4 border-t border-theme-light/50 bg-theme-base flex justify-end">
                <button onClick={onClose} className="bg-theme-light hover:bg-theme-light/80 text-theme-text px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">Done</button>
            </div>
        </div>
    </div>
  );
};

export default EmbedModal;