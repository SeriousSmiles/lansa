import React from "react";

interface Quote {
  text: string;
  author: string;
}

interface LansaLoaderProps {
  quotes?: Quote[];
}

const defaultQuotes: Quote[] = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your career is a journey, not a destination.", author: "Lansa" },
  { text: "Every expert was once a beginner.", author: "Helen Hayes" },
];

// Pick a random quote on each mount
const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

export function LansaLoader({ quotes = defaultQuotes }: LansaLoaderProps) {
  const quoteIndex = getRandomIndex(quotes.length);

  return (
    <div className="h-screen bg-[rgba(253,248,242,1)] flex flex-col items-center justify-center gap-10">
      {/* Animated Logo */}
      <div className="relative w-24 h-32">
        {/* Background logo (faded) */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 195 278" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M192.24 79.4297C193.315 79.378 194.225 80.1786 194.299 81.2402C198.281 138.256 162.444 200.998 115.64 252.745C114.934 253.525 113.633 252.82 113.889 251.805C117.96 235.652 118.604 221.288 115.821 208.71C93.5583 244.629 41.4624 272.184 3.17969 277.964C0.382 278.386 -1.09487 275.081 0.960938 273.157C53.6288 223.883 72.3362 202.174 90.2139 174.143C63.9967 188.005 42.3342 197.788 22.0967 201.218C19.9215 201.586 18.2139 199.482 18.9463 197.424C51.7491 105.252 130.72 82.3892 192.24 79.4297ZM115.171 0C134.911 0 150.914 16.8916 150.914 37.7285C150.914 58.5656 134.911 75.458 115.171 75.458C95.4306 75.4579 79.4277 58.5655 79.4277 37.7285C79.4279 16.8917 95.4307 0.00010895 115.171 0Z" 
            fill="#1A1F71"
          />
        </svg>
        
        {/* Animated foreground logo */}
        <svg 
          className="absolute inset-0 w-full h-full animate-logo-fill"
          viewBox="0 0 195 278" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main swoosh path */}
          <path 
            className="animate-path-fill"
            d="M192.24 79.4297C193.315 79.378 194.225 80.1786 194.299 81.2402C198.281 138.256 162.444 200.998 115.64 252.745C114.934 253.525 113.633 252.82 113.889 251.805C117.96 235.652 118.604 221.288 115.821 208.71C93.5583 244.629 41.4624 272.184 3.17969 277.964C0.382 278.386 -1.09487 275.081 0.960938 273.157C53.6288 223.883 72.3362 202.174 90.2139 174.143C63.9967 188.005 42.3342 197.788 22.0967 201.218C19.9215 201.586 18.2139 199.482 18.9463 197.424C51.7491 105.252 130.72 82.3892 192.24 79.4297Z" 
            fill="#1A1F71"
            style={{ 
              animation: 'path-fill 2s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          {/* Dot path */}
          <path 
            className="animate-dot-fill"
            d="M115.171 0C134.911 0 150.914 16.8916 150.914 37.7285C150.914 58.5656 134.911 75.458 115.171 75.458C95.4306 75.4579 79.4277 58.5655 79.4277 37.7285C79.4279 16.8917 95.4307 0.00010895 115.171 0Z" 
            fill="#1A1F71"
            style={{ 
              animation: 'dot-fill 2s ease-in-out infinite',
              animationDelay: '0.3s'
            }}
          />
        </svg>

        {/* Glow effect */}
        <div className="absolute inset-0 animate-glow">
          <svg 
            className="w-full h-full blur-md opacity-30"
            viewBox="0 0 195 278" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M192.24 79.4297C193.315 79.378 194.225 80.1786 194.299 81.2402C198.281 138.256 162.444 200.998 115.64 252.745C114.934 253.525 113.633 252.82 113.889 251.805C117.96 235.652 118.604 221.288 115.821 208.71C93.5583 244.629 41.4624 272.184 3.17969 277.964C0.382 278.386 -1.09487 275.081 0.960938 273.157C53.6288 223.883 72.3362 202.174 90.2139 174.143C63.9967 188.005 42.3342 197.788 22.0967 201.218C19.9215 201.586 18.2139 199.482 18.9463 197.424C51.7491 105.252 130.72 82.3892 192.24 79.4297ZM115.171 0C134.911 0 150.914 16.8916 150.914 37.7285C150.914 58.5656 134.911 75.458 115.171 75.458C95.4306 75.4579 79.4277 58.5655 79.4277 37.7285C79.4279 16.8917 95.4307 0.00010895 115.171 0Z" 
              fill="#1A1F71"
            />
          </svg>
        </div>
      </div>

      {/* Quote Container */}
      <div className="h-28 flex flex-col items-center justify-center text-center px-8 max-w-md animate-fade-in">
        <p className="text-lg font-light italic text-[#1A1F71] leading-relaxed">
          "{quotes[quoteIndex].text}"
        </p>
        <span className="text-sm font-medium text-[#1A1F71]/60 mt-3 tracking-wide">
          — {quotes[quoteIndex].author}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-48 h-1 bg-[#1A1F71]/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#1A1F71]/50 rounded-full animate-progress" />
      </div>

      <style>{`
        @keyframes path-fill {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.98);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes dot-fill {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes progress {
          0% {
            width: 5%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-logo-fill {
          animation: path-fill 2s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-progress {
          animation: progress 10s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
