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
    <div className="container section space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
          Welcome to EventHub
        </h1>
        <p className="text-xl text-secondary mb-8">
          Discover, register, and enjoy amazing events all in one place
        </p>
        {!user ? (
          <div className="flex gap-16 justify-center flex-wrap">
            <Link to="/register" className="ds-btn ds-btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="ds-btn">
              Login
            </Link>
          </div>
        ) : (
          <div className="flex gap-16 justify-center flex-wrap">
            <Link to="/events" className="ds-btn">
              Browse Events
            </Link>
            <Link to="/registrations" className="ds-btn ds-btn-primary">
              My Registrations
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-4xl font-bold text-primary mb-12 text-center">
          Why Choose EventHub?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="ds-card">
              <div className="mb-4" style={{color: 'var(--color-primary)'}}>{feature.icon}</div>
              <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
              <p className="text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="ds-card text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Ready to find your next event?</h2>
        <p className="text-secondary mb-6">Join thousands of event enthusiasts and discover something amazing today</p>
        <Link to="/events" className="ds-btn ds-btn-primary">Explore Events</Link>
      </section>
    </div>
  );
}

export default HomePage;