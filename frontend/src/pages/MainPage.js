import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import {
  MagnifyingGlassIcon, HeartIcon, MoonIcon,
  SunIcon, XMarkIcon
} from '@heroicons/react/24/solid';
import Login from './Login';
import Home from './Home';
import TryOnModal from '../components/TryOnModal';
import { signInWithGoogle, loginWithEmail, registerWithEmail, logout, onAuthStateChangedListener } from '../auth';
import Skeleton from 'react-loading-skeleton'; // Import the Skeleton component
import { auth, db } from "../firebase";
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

const createSafeId = (userId, url) => {
  const base64 = btoa(encodeURIComponent(url).slice(0, 1000))
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=/g, '');
  return `${userId}_${base64}`;
};

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);



const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  // const [favorites, setFavorites] = useState({});
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [showTryOn, setShowTryOn] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modelImage, setModelImage] = useState(null);

  const user = auth.currentUser;

  const suggestions = ['oversized tshirt', 'printed tshirt', 'Shoes', 'cargo pants for men'];
  const trendingSearches = ["Trending MensWear"];

  const handleSearch = async (searchQuery) => {
    const finalQuery = (searchQuery || query || '').toString();
    if (!finalQuery.trim()) return;

    setHasSearched(true);
    setLoading(true);

    const trimmedQuery = finalQuery.trim();
    if (!searchHistory.includes(trimmedQuery)) {
      const updatedHistory = [trimmedQuery, ...searchHistory].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    }

    try {
      const response = await fetch(`http://localhost:5000/search?query=${finalQuery}`);
      const data = await response.json();
      // console.log(data.results);
      setResults(data.results || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

const handleTrendingClick = () => {
    const randomTrendingSearch = trendingSearches[Math.floor(Math.random() * trendingSearches.length)];
    setQuery(randomTrendingSearch);
    // setShowInput(false); // Hide the input box
    handleSearch(); // Trigger search immediately after setting the query
  };

  const handleSuggestionClick = (tag) => {
    setQuery(tag);
    setHasSearched(true);
    setTimeout(() => handleSearch(tag), 0);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const removeHistoryItem = (item) => {
    const updatedHistory = searchHistory.filter((historyItem) => historyItem !== item);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

// State for favorites
const [favorites, setFavorites] = useState({});

// Fetch favorites when user changes
useEffect(() => {
  const fetchFavorites = async () => {
    if (user) {
      try {
        const favoritesRef = collection(db, "favorites");
        const q = query(favoritesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const newFavorites = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          newFavorites[data.productId] = true;
        });
        
        setFavorites(newFavorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }
  };
  
  fetchFavorites();
}, [user]);

// Toggle favorite function
const toggleFavorite = async (item) => {
  if (!user) {
    alert("Please log in to save favorites!");
    return;
  }

  try {
    const docId = createSafeId(user.uid, item.link);
    const favRef = doc(db, "favorites", docId);

    if (favorites[item.link]) {
      // Remove from favorites
      await deleteDoc(favRef);
      setFavorites(prev => ({ ...prev, [item.link]: false }));
    } else {
      // Add to favorites
      await setDoc(favRef, {
        userId: user.uid,
        productId: item.link,
        productData: {
          image: item.image,
          link: item.link,
          price: item.price,
          site: item.site,
          title: item.title,
        },
        timestamp: new Date(),
      });
      setFavorites(prev => ({ ...prev, [item.link]: true }));
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    alert("Failed to update favorites. Please try again.");
  }
};

  const handleTryOnClick = (item) => {
    setSelectedItem(item);
    setShowTryOn(true);
  };

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModelImage(URL.createObjectURL(file));
    }
  };

  const handleLoginSuccess = (email, password) => {
    handleLogin(email, password); // This will save the user details in localStorage
    setIsLoggedIn(true);
    setUserDetails({ email, password }); // Set user details after successful login
    navigate('/dashboard'); // Navigate to the dashboard after login
  };

    // Firebase authentication state change listener
    useEffect(() => {
      const unsubscribe = onAuthStateChangedListener((user) => {
        if (user) {
          setUserDetails(user);  // Set the user details
          setIsLoggedIn(true);  // Mark the user as logged in
        } else {
          setIsLoggedIn(false);  // If no user, mark as logged out
        }
      });
  
      return () => unsubscribe();  // Clean up listener on unmount
    }, []);
  
    // Handle email/password login
    const handleLogin = async (email, password) => {
      try {
        await loginWithEmail(email, password);
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } catch (error) {
        console.error("Login error:", error.message);
        alert('Login failed. Please check your credentials.');
      }
    };
  
    // Handle Google login
    const handleGoogleLogin = async () => {
      try {
        await signInWithGoogle();
        navigate('/dashboard'); // Redirect after Google login
      } catch (error) {
        console.error("Google login error:", error.message);
        alert('Google login failed. Please try again.');
      }
    };
  
    // Handle logout
    const handleLogout = () => {
      logout();  // Call Firebase logout
      setUserDetails(null);  // Clear user details
      setIsLoggedIn(false);  // Mark user as logged out
      navigate('/login');  // Redirect to login page
    };

  useEffect(() => {
    // Check if user is logged in and update accordingly
    if (isLoggedIn) {
      navigate('/dashboard'); // Make sure to redirect to dashboard if logged in
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-zinc-900 to-black text-zinc-100' : 'bg-white text-zinc-900'} pb-24 transition-colors duration-300`}>
      {/* Navbar */}
      <nav className={`px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-10 border-b ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-black border-zinc-200'}`}>
        <h1 className="text-2xl font-bold tracking-wide">Clothx</h1>
        <div className="flex items-center space-x-4 text-sm">
          <button onClick={() => navigate('/tryon')} className="hover:text-emerald-400 transition">TryOn</button>
          <a href="/dashboard" className="hover:text-emerald-400 transition">Browse</a>
          <button href="#" onClick={handleTrendingClick} className="hover:text-emerald-400 transition">Trending</button>
          {user && <Link to="/favorites">❤️ Favorites</Link>}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-zinc-700 transition" title="Toggle Theme">
            {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-300" /> : <MoonIcon className="w-5 h-5 text-zinc-800" />}
          </button>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="bg-emerald-500 px-4 py-2 rounded-full text-white hover:scale-105 transition-transform">Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} className="bg-emerald-500 px-4 py-2 rounded-full text-white hover:scale-105 transition-transform">Login</button>
          )}
        </div>
      </nav>

      {/* Conditional rendering for login or main content */}
      {isLoggedIn ? (
        <div className="">
          <h2 className="text-4xl text-center mt-6 font-extrabold tracking-tight mb-4">Welcome, {userDetails?.email} !</h2>
          {/* Main content goes here */}
          {!hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 px-4 mt-10 text-center">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Find Your Fit</h2>
            <p className="text-lg md:text-xl text-zinc-400 dark:text-zinc-300">Discover the latest styles from your favorite brands.</p>
          </div>
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {suggestions.map((tag) => (
              <button key={tag} onClick={() => handleSuggestionClick(tag)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-emerald-500 dark:text-emerald-400 px-4 py-1.5 rounded-full hover:scale-105 transition-all text-sm shadow-sm">{tag}</button>
            ))}
          </div>
          {searchHistory.length > 0 && (
            <div className="mt-6 text-left w-full max-w-xl">
              <h4 className="text-sm font-semibold mb-2 text-zinc-400 dark:text-zinc-300">Recent Searches:</h4>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button onClick={() => handleSuggestionClick(item)} className="bg-zinc-200 dark:bg-zinc-700 text-sm text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full hover:scale-105 transition">{item}</button>
                    <button onClick={() => removeHistoryItem(item)} className="text-zinc-400 dark:text-zinc-300 hover:text-emerald-500" title="Remove from history"><XMarkIcon className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
              <button onClick={clearSearchHistory} className="mt-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-500">Clear All History</button>
            </div>
          )}
          <div className="w-full max-w-xl relative mt-6">
            <input type="text" value={query} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a product..." className="w-full pl-4 pr-12 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
            <button onClick={handleSearch} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition"><MagnifyingGlassIcon className="w-5 h-5" /></button>
          </div>
        </div>
      )}


      {loading && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Skeleton Loaders for Product Cards */}
            {Array(10).fill().map((_, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800/80 rounded-xl shadow-md overflow-hidden flex flex-col">
                {/* Skeleton Loader for Image */}
                <div className="w-full" style={{ aspectRatio: '16/9' }}>
                  <Skeleton height="100%" width="100%" containerClassName="bg-zinc-800" />
                </div>

                {/* Skeleton Loader for Title */}
                <div className="p-4 flex flex-col flex-grow space-y-2">
                  <Skeleton height={20} width="80%" containerClassName="bg-zinc-800 rounded-full" />
                  
                  {/* Skeleton Loader for Price */}
                  <Skeleton height={15} width="60%" containerClassName="bg-zinc-800 rounded-full" />
                  
                  {/* Skeleton Loader for Description */}
                  <Skeleton height={12} width="70%" containerClassName="bg-zinc-800 rounded-full" />
                  
                  {/* Skeleton Loader for Action Buttons */}
                  <div className="flex gap-2 mt-2">
                    <Skeleton height={36} width="100px" containerClassName="bg-zinc-900" />
                    <Skeleton height={36} width="100px" containerClassName="bg-zinc-900" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {results.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Search Results for <span className="text-emerald-400">"{query.charAt(0).toUpperCase() + query.slice(1)}"</span></h2>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {results.map((item, index) => {
                const isFavorited = favorites[index];
                return (
                  <div key={index} className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-700 relative">
                    <button 
  onClick={() => toggleFavorite(item)} 
  className="absolute top-4 right-4 z-10 bg-zinc-900/70 hover:bg-zinc-800 p-1.5 rounded-full transition" 
  title={favorites[item.link] ? "Remove from favorites" : "Add to favorites"}
>
  <HeartIcon className={`w-5 h-5 ${favorites[item.link] ? 'text-rose-500' : 'text-zinc-400'} transition`} />
</button>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="group relative">
                      <img src={item.image} alt={item.title} className="h-56 w-full object-contain bg-white p-3 transition-transform group-hover:scale-105" />
                    </a>
                    <div className="p-4 flex flex-col flex-grow space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-400 font-semibold">{item.price}</span>
                        <span className="text-zinc-400">{item.site}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                         <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1 text-white bg-emerald-500 px-3 py-2 rounded-md text-xs text-center hover:bg-emerald-600 transition">View</a>
                         <button onClick={() => handleTryOnClick(item)} className="flex-1 text-emerald-400 border border-emerald-500 px-3 py-2 rounded-md text-xs text-center hover:bg-emerald-900 transition">Try On</button>
                      </div>
                    </div>
                 </div>
               );
       })}
    </div>
  </div>
)}

{hasSearched && (
  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-800">
    <div className="max-w-4xl mx-auto relative">
      <input type="text" value={query} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a product..." className="w-full pl-6 pr-12 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
      <button onClick={handleSearch} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition"><MagnifyingGlassIcon className="w-5 h-5" /></button>
    </div>
  </div>
)}

{/* TRY-ON MODAL */}
{showTryOn && selectedItem && (
  <TryOnModal
  showTryOn={showTryOn}
  setShowTryOn={setShowTryOn}
  selectedItem={selectedItem}
  />
)}
        </div>
      ) : (
        <Login onLogin={handleLoginSuccess} />
      )}
</div>
);
}


export default MainPage;
