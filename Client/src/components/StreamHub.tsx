import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

const Card = ({ icon, title, description, onClick }: CardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col items-center justify-center p-10 gap-6 rounded-xl border border-white/10 bg-surface-dark hover:border-primary hover:bg-surface-dark/80 hover:shadow-glow transition-all duration-300 cursor-pointer h-64 md:h-72 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
      aria-label={`${title}: ${description}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity rounded-xl"></div>
      <div className="relative z-10 flex items-center justify-center size-20 rounded-full bg-background-dark border border-white/5 group-hover:border-primary/30 group-focus:border-primary/30 group-hover:scale-110 group-focus:scale-110 transition-transform duration-300 shadow-xl">
        <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary group-focus:text-primary transition-colors">
          {icon}
        </span>
      </div>
      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary group-focus:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
};

const StreamHub = () => {
  const navigate = useNavigate();
  const [isDarkMode] = useState(true); // You can add toggle functionality later

  const handleCardClick = (cardType: string) => {
    // Handle navigation based on card type
    switch (cardType) {
      case 'Xtreme Code':
        navigate('/xtreme-code');
        break;
      case 'M3U Playlist':
        navigate('/m3u-playlist');
        break;
      case 'Live TV':
        // navigate('/live-tv');
        alert('Live TV özelliği yakında eklenecek!');
        break;
      case 'Login':
        navigate('/login');
        break;
      default:
        alert(`${cardType} özelliği yakında eklenecek!`);
    }
  };

  const handleSettingsClick = () => {
    // Handle settings click
    alert('Ayarlar sayfası yakında eklenecek!');
  };

  const handleProfileClick = () => {
    // Handle profile click
    alert('Profil sayfası yakında eklenecek!');
  };

  return (
    <div className={`flex flex-col min-h-screen w-full bg-background-dark font-display text-white antialiased overflow-x-hidden selection:bg-primary selection:text-background-dark ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-6 py-4 lg:px-12 w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">play_circle</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">StreamHub</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSettingsClick}
            className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            onClick={handleProfileClick}
            className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-white/10 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
            aria-label="Profile"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
              person
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-center py-10 px-4 md:px-8 lg:px-20 w-full">
        {/* Hero Section */}
        <div className="w-full max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Welcome to <span className="text-primary">StreamHub</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Choose your preferred connection method below to start streaming your favorite content instantly.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              icon="dns"
              title="Xtreme Code"
              description="Connect via API credentials"
              onClick={() => handleCardClick('Xtreme Code')}
            />
            <Card
              icon="playlist_play"
              title="M3U Playlist"
              description="Load your playlist file or URL"
              onClick={() => handleCardClick('M3U Playlist')}
            />
            <Card
              icon="live_tv"
              title="Live TV"
              description="Watch channels directly"
              onClick={() => handleCardClick('Live TV')}
            />
            <Card
              icon="lock"
              title="Login"
              description="Access your account dashboard"
              onClick={() => handleCardClick('Login')}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-auto w-full">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm">© 2024 StreamHub. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a
              className="text-slate-500 hover:text-primary text-sm transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                console.log('Support clicked');
              }}
            >
              Support
            </a>
            <a
              className="text-slate-500 hover:text-primary text-sm transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                console.log('Terms clicked');
              }}
            >
              Terms of Service
            </a>
            <a
              className="text-slate-500 hover:text-primary text-sm transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                console.log('Privacy clicked');
              }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StreamHub;

