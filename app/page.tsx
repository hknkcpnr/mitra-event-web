"use client";
import React, { useState, useEffect } from 'react';

import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import PhilosophySection from './components/PhilosophySection';
import ServicesGrid from './components/ServicesGrid';
import ProjectsSlider from './components/ProjectsSlider';
import TestimonialsSlider from './components/TestimonialsSlider';
import GallerySection from './components/GallerySection';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const data = await response.json();
          setSiteData(data);
        } else {
          console.error("Failed to fetch content data");
        }
      } catch (error) {
        console.error("Error fetching content data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !siteData) {
    return <div className="min-h-screen flex text-[#2D2926] items-center justify-center font-sans tracking-widest text-sm bg-[#FDFCFB]">YÜKLENİYOR...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926] font-sans selection:bg-[#E6DDE6]">
      <NavBar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrolled={scrolled}
        whatsappUrl={siteData.contact.whatsappUrl}
        brand={siteData.brand}
      />
      <HeroSection data={siteData.hero} />
      <PhilosophySection data={siteData.philosophy} />
      <ServicesGrid data={siteData.services} meta={siteData.servicesMeta} />
      <TestimonialsSlider data={siteData.testimonials} meta={siteData.testimonialsMeta} />
      <ProjectsSlider data={siteData.projects} meta={siteData.projectsMeta} />
      <GallerySection images={siteData.gallery} />
      <InquiryForm data={siteData.contact} />
      <Footer data={siteData.footer} brand={siteData.brand} />
    </div>
  );
};

export default App;
