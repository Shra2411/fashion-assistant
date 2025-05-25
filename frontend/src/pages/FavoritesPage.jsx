import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { HeartIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// Utility function to create consistent document IDs
const createFavoriteId = (userId, productLink) => {
  return `${userId}_${btoa(encodeURIComponent(productLink).slice(0, 1000))
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=/g, '')}`;
};

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  // Fetch user's favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, "favorites"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const favs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data().productData,
          }));
          setFavorites(favs);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFavorites();
  }, [user]);

  // Remove from favorites
  const removeFavorite = async (productLink) => {
    try {
      const docId = createFavoriteId(user.uid, productLink);
      await deleteDoc(doc(db, "favorites", docId));
      setFavorites(favorites.filter((item) => item.link !== productLink));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your favorites</h2>
          <Link 
            to="/dashboard" 
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-zinc-900">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          Your <span className="text-emerald-500">Favorites</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <HeartIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
            No favorites yet
          </h3>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Start saving your favorite items by clicking the heart icon
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <div 
              key={product.link} 
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col"
            >
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-48 object-contain bg-white p-4"
                />
                <button 
                  onClick={() => removeFavorite(product.link)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                  title="Remove from favorites"
                >
                  <XMarkIcon className="h-5 w-5 text-rose-500" />
                </button>
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-medium text-zinc-800 dark:text-zinc-100 line-clamp-2 mb-2">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                    {product.price}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {product.site}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Link
                    to={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-md text-sm text-center transition"
                  >
                    Buy Now <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;