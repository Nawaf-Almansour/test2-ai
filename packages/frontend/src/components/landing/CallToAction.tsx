import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section id="contact" className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Take the first step towards providing your child with quality education 
            and a bright future. Apply now or schedule a visit to our campus.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Phone className="h-6 w-6 mr-3" />
              <h3 className="text-lg font-semibold">Call Us</h3>
            </div>
            <p className="text-blue-100 mb-2">
              +966 50 123 4567
            </p>
            <p className="text-sm text-blue-200">
              Sunday - Thursday: 8:00 AM - 4:00 PM
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 mr-3" />
              <h3 className="text-lg font-semibold">Email Us</h3>
            </div>
            <p className="text-blue-100 mb-2">
              admissions@school.edu.sa
            </p>
            <p className="text-sm text-blue-200">
              info@school.edu.sa
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 mr-3" />
              <h3 className="text-lg font-semibold">Visit Us</h3>
            </div>
            <p className="text-blue-100 mb-2">
              123 Education Street
            </p>
            <p className="text-sm text-blue-200">
              Riyadh, Saudi Arabia 12345
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/apply"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Apply Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a
            href="tel:+966501234567"
            className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-lg hover:bg-white/10 transition-colors border border-white"
          >
            Schedule a Visit
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;