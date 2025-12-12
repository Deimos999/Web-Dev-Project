import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Ticket, Zap } from 'lucide-react';

function HomePage({ user }) {
  const features = [
    {
      icon: <Calendar className="w-12 h-12" />,
      title: 'Browse Events',
      description: 'Discover amazing events happening near you',
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Easy Registration',
      description: 'Register for events with just a few clicks',
    },
    {
      icon: <Ticket className="w-12 h-12" />,
      title: 'Digital Tickets',
      description: 'Get instant digital tickets for your events',
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Real-Time Updates',
      description: 'Stay updated with event information',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Welcome to EventHub
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Discover, register, and enjoy amazing events all in one place
        </p>
        {!user ? (
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/register"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Login
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/events"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              Browse Events
            </Link>
            <Link
              to="/registrations"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              My Registrations
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          Why Choose EventHub?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition"
            >
              <div className="text-blue-400 mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to find your next event?
        </h2>
        <p className="text-blue-100 mb-6">
          Join thousands of event enthusiasts and discover something amazing today
        </p>
        <Link
          to="/events"
          className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          Explore Events
        </Link>
      </section>
    </div>
  );
}

export default HomePage;