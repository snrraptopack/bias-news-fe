import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <div className="max-w-md mx-auto text-center py-24">
    <h1 className="text-7xl font-bold bg-gradient-to-b from-slate-900 to-slate-600 bg-clip-text text-transparent mb-6">404</h1>
    <p className="text-slate-600 mb-6">We couldn't find that page. It may have been renamed or removed.</p>
    <Link to="/" className="inline-flex items-center rounded-md bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 shadow-soft hover:bg-indigo-700">Back Home</Link>
  </div>
);
