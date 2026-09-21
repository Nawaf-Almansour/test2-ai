import React from 'react';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import Programs from '../components/landing/Programs';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import Facilities from '../components/landing/Facilities';
import Statistics from '../components/landing/Statistics';
import AdmissionProcess from '../components/landing/AdmissionProcess';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import CallToAction from '../components/landing/CallToAction';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <About />
      <Programs />
      <WhyChooseUs />
      <Statistics />
      <Facilities />
      <AdmissionProcess />
      <Testimonials />
      <FAQ />
      <CallToAction />
    </div>
  );
};

export default HomePage;