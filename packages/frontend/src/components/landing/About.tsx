import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About Our School
            </h2>
            <div className="space-y-6 text-gray-600">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
                <p className="leading-relaxed">
                  To provide a nurturing and stimulating learning environment that 
                  empowers students to achieve academic excellence, develop critical 
                  thinking skills, and become responsible global citizens.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Vision</h3>
                <p className="leading-relaxed">
                  To be a leading educational institution recognized for innovation, 
                  character development, and preparing students for success in an 
                  ever-changing world.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Educational Philosophy</h3>
                <p className="leading-relaxed">
                  We believe in holistic education that balances academic rigor with 
                  character development, creativity, and physical well-being. Our 
                  student-centered approach ensures each child receives personalized 
                  attention and support to reach their full potential.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="School campus and students"
              className="rounded-2xl shadow-xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;