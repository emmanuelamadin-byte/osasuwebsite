import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Mail, Phone, ArrowRight, CheckCircle, Edit, Trash2, Plus, Lock, LogOut, Video, Upload, Star, Quote, MessageCircle, Save, Image as ImageIcon } from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Resizes and compresses the image before uploading to prevent Firestore limits
const handleFileUpload = (e, callback) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(dataUrl);
      };
      img.onerror = () => console.error("Failed to load image. Please select a valid image file.");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const INITIAL_CONTENT = {
  brandName: "Kelvin Armani Enterprise and Interiors",
  heroHeadline: "Luxury & Ultra-Modern Designs",
  heroSub: "Elevating residential and commercial spaces across Benin City, Edo State, and nationwide with tailored property solutions and impeccable finishes.",
  heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000",
  aboutText: "Based in Benin City, Edo State, Kelvin Armani Enterprise and Interiors specializes in luxury and ultra-modern designs for both homes and offices. Every project presents unique challenges, which is why we conduct a careful assessment to provide tailored solutions for the best possible outcome. Our involvement depends entirely on your preference—ranging from full project execution to handling specific aspects of the work. We pride ourselves on transparent timelines, exceptional quality of materials, and delivering a wide range of premium property-related services.",
  aboutImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000",
  contactPhone: "+2348154225597",
  contactEmail: "hello@kelvinarmani.com.ng",
  contactInstagram: "https://www.instagram.com/kelvinarmani_official"
};

const INITIAL_SERVICES = [
  { id: 101, title: "Interior Design & Space Planning", desc: "Every great space starts with a solid blueprint. We provide comprehensive space planning and interior design concepts tailored to your lifestyle or corporate brand.", detailedDesc: "From 3D visualizations to optimized layouts, we ensure your residential or commercial space is highly functional and aesthetically pleasing before a single drop of paint is applied.\n\nKey Deliverables:\n• 3D Renderings & Visuals\n• Space Planning\n• Residential & Office Design\n• Concept Development", price: "Based on Scale & Complexity", image: "" },
  { id: 102, title: "Professional Painting & Wall Finishing", desc: "Transform your walls into statement pieces. Beyond standard interior and exterior painting, we specialize in high-end wall treatments that elevate your space.", detailedDesc: "Our expert team handles everything from flawless wall screeding and POP installations to decorative finishes, commercial wall branding, and custom murals that leave a lasting impression.\n\nKey Deliverables:\n• Wall Screeding & POP Ceiling Works\n• Interior & Exterior Painting\n• Custom Wallpapers & Murals\n• Decorative Finishes (Stucco, Limewash)", price: "Per-Project Basis", image: "" },
  { id: 103, title: "Bespoke Furnishing & Final Styling", desc: "A beautifully painted and finished room is just the canvas. We complete your vision with curated styling, expert procurement, and bespoke furniture tailored to your exact space.", detailedDesc: "By carefully selecting the right upholstery, lighting, window treatments, and accessories, we bring warmth, character, and absolute luxury to your completed project.\n\nKey Deliverables:\n• Custom Furniture & Upholstery\n• Lighting & Fixture Sourcing\n• Window Treatments & Blinds\n• Final Room Staging & Accessorizing", price: "Custom Quote", image: "" }
];

const INITIAL_PROJECTS = [
  {
    id: 103,
    title: "GRA Luxury Penthouse",
    location: "GRA, Benin City",
    desc: "A complete redesign of a luxury penthouse in the heart of Benin City, focusing on natural light and neutral tones.",
    problem: "The client felt the original space was too dark and cramped, lacking flow for entertaining high-profile guests.",
    solution: "We removed non-structural partitions, introduced a lighter color palette, and sourced low-profile modern furniture to maximize the perception of space.",
    mediaType: 'image',
    mediaUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
    gallery: [
      { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1600607687644-aac4c1566f03?auto=format&fit=crop&q=80&w=800' },
      { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: 102,
    title: "Lekki Coastal Villa",
    location: "Lekki Phase 1, Lagos",
    desc: "Bringing a sophisticated, airy tropical feel to a family home in Lekki.",
    problem: "The home felt outdated with heavy woods and dark fabrics that clashed with the warm Nigerian climate.",
    solution: "Implemented organic textures, light oak woods, and subtle breezy accents to seamlessly blend the indoor space with the tropical environment.",
    mediaType: 'image',
    mediaUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
    gallery: [
      { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800' }
    ]
  }
];

const INITIAL_ONGOING_PROJECTS = [
  { id: 102, title: "Maitama Luxury Duplex", desc: "Currently in the finishing phase. A contemporary 5-bedroom duplex with custom marble fittings and smart home integration.", image: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&q=80&w=800", progress: "85%" },
  { id: 101, title: "Victoria Island Corporate Office", desc: "Open-plan workspace for a tech startup. Framing, acoustic treatments, and electrical routing currently underway.", image: "https://images.unsplash.com/photo-1541888081128-4ee055b08492?auto=format&fit=crop&q=80&w=800", progress: "40%" }
];

const INITIAL_TESTIMONIALS = [
  { id: 102, name: "Chief Adebayo", location: "Asokoro, Abuja", text: "Kelvin Armani Enterprise and Interiors transformed our villa into a masterpiece. The attention to detail and understanding of premium ultra-modern aesthetics is simply unmatched.", image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=400" }
];

const INITIAL_TEAM = [
  { id: 101, name: "Kelvin Armani", role: "Principal Designer & Founder", bio: "With a visionary approach to ultra-modern design, Kelvin leads the creative direction of every project, ensuring global luxury standards are met while infusing unique personalized touches.", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" }
];

export default function App() {
  const [user, setUser] = useState(null);

  const [content, setContent] = useState(INITIAL_CONTENT);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [currentRoute, setCurrentRoute] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  useEffect(() => {
    if (!content) return;
    
    const baseUrl = window.location.href.split('#')[0];
    const pageUrl = currentRoute === 'home' ? baseUrl : `${baseUrl}#${currentRoute}`;
    let pageTitle = `${content.brandName} | Interior Design in Benin City, Edo State`;
    let pageDescription = content.heroSub;
    let pageImage = content.heroImage;

    if (currentRoute === 'project-detail' && selectedProject) {
      pageTitle = `${selectedProject.title} | ${content.brandName}`;
      pageDescription = selectedProject.desc;
      pageImage = selectedProject.mediaType === 'youtube' ? `https://img.youtube.com/vi/${getYouTubeId(selectedProject.mediaUrl)}/maxresdefault.jpg` : selectedProject.mediaUrl;
    }

    document.title = pageTitle;
    
    const setMetaTag = (attributeName, attributeValue, contentValue) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    setMetaTag('name', 'description', pageDescription);
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // Open Graph (Social Media Previews)
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', pageUrl);
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:image', pageImage);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', pageImage);

    let script = document.querySelector('script[id="local-seo-schema"]');
    if (!script) {
      script = document.createElement('script');
      script.id = "local-seo-schema";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HomeAndConstructionBusiness",
      "name": content.brandName,
      "image": content.heroImage,
      "description": content.aboutText,
      "address": { "@type": "PostalAddress", "addressLocality": "Benin City", "addressRegion": "Edo State", "addressCountry": "NG" },
      "areaServed": ["Benin City", "Edo State", "Nigeria"],
      "telephone": content.contactPhone,
      "url": baseUrl
    });
  }, [content, currentRoute, selectedProject]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubContent = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'websiteContent', 'main'), (docSnap) => {
        if (docSnap.exists()) { 
          setContent(docSnap.data()); 
        } else {
          // Fall back to local data safely without throwing unauthorized write errors
          setContent(INITIAL_CONTENT);
        }
      }, (err) => console.error("Content fetch error:", err));

    const unsubServices = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'services'), (snapshot) => {
      if (!snapshot.empty) setServices(snapshot.docs.map(d => ({...d.data(), id: Number(d.id)})).sort((a, b) => a.id - b.id));
      else setServices(INITIAL_SERVICES);
    }, (err) => console.error("Services fetch error:", err));
    
    const unsubProjects = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), (snapshot) => {
      if (!snapshot.empty) setProjects(snapshot.docs.map(d => ({...d.data(), id: Number(d.id)})).sort((a, b) => b.id - a.id));
      else setProjects(INITIAL_PROJECTS);
    }, (err) => console.error("Projects fetch error:", err));
    
    const unsubOngoing = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'ongoingProjects'), (snapshot) => {
      if (!snapshot.empty) setOngoingProjects(snapshot.docs.map(d => ({...d.data(), id: Number(d.id)})).sort((a, b) => b.id - a.id));
      else setOngoingProjects(INITIAL_ONGOING_PROJECTS);
    }, (err) => console.error("Ongoing projects fetch error:", err));
    
    const unsubTestimonials = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'testimonials'), (snapshot) => {
      if (!snapshot.empty) setTestimonials(snapshot.docs.map(d => ({...d.data(), id: Number(d.id)})).sort((a, b) => b.id - a.id));
      else setTestimonials(INITIAL_TESTIMONIALS);
    }, (err) => console.error("Testimonials fetch error:", err));
    
    const unsubTeam = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'teamMembers'), (snapshot) => {
      if (!snapshot.empty) setTeamMembers(snapshot.docs.map(d => ({...d.data(), id: Number(d.id)})).sort((a, b) => a.id - b.id));
      else setTeamMembers(INITIAL_TEAM);
    }, (err) => console.error("Team fetch error:", err));

    return () => { unsubContent(); unsubServices(); unsubProjects(); unsubOngoing(); unsubTestimonials(); unsubTeam(); };
  }, [user]);
  
  const navigate = (route, project = null) => {
    setCurrentRoute(route);
    setSelectedProject(project);
    window.scrollTo(0, 0);
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${content?.contactPhone || ''}?text=Hi! I am interested in your interior design services.`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2C2C] font-sans selection:bg-[#8C7A6B] selection:text-white flex flex-col relative">
      <Navbar navigate={navigate} currentRoute={currentRoute} brandName={content?.brandName || 'Loading...'} />
      
      <main className="flex-grow pt-16 md:pt-20">
        {currentRoute === 'home' && <HomeView navigate={navigate} content={content} projects={projects} ongoingProjects={ongoingProjects} testimonials={testimonials} />}
        {currentRoute === 'about' && <AboutView content={content} teamMembers={teamMembers} />}
        {currentRoute === 'services' && <ServicesView services={services} navigate={navigate} />}
        {currentRoute === 'portfolio' && <PortfolioView projects={projects} navigate={navigate} content={content} />}
        {currentRoute === 'project-detail' && <ProjectDetailView project={selectedProject} navigate={navigate} />}
        {currentRoute === 'contact' && <ContactView content={content} />}
        {currentRoute === 'admin' && (
          isAdminAuth ? 
            <AdminDashboard 
              projects={projects}
              ongoingProjects={ongoingProjects}
              testimonials={testimonials}
              teamMembers={teamMembers}
              content={content} setContent={setContent}
              services={services}
              setIsAdminAuth={setIsAdminAuth}
            /> 
            : 
            <AdminLogin setIsAdminAuth={setIsAdminAuth} />
        )}
      </main>

      <Footer content={content} navigate={navigate} />

      <button 
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#1ebd5a] hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={32} />
      </button>
    </div>
  );
}

function Navbar({ navigate, currentRoute, brandName }) {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { id: 'home', label: 'Home' }, { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' }, { id: 'portfolio', label: 'Portfolio' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNav = (e, id) => { e.preventDefault(); navigate(id); setIsOpen(false); };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <a href="#home" onClick={(e) => handleNav(e, 'home')} className="text-lg md:text-2xl font-serif tracking-tight font-semibold text-[#2C2C2C] text-left line-clamp-1 max-w-[250px] md:max-w-none">
              {brandName}
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <a key={link.id} href={`#${link.id}`} onClick={(e) => handleNav(e, link.id)} className={`text-sm tracking-wide uppercase transition-colors hover:text-[#8C7A6B] ${currentRoute === link.id ? 'text-[#8C7A6B] font-semibold' : 'text-gray-500'}`}>
                {link.label}
              </a>
            ))}
            <a href="#admin" onClick={(e) => handleNav(e, 'admin')} className="text-gray-300 hover:text-gray-500 ml-4 transition-colors p-2" title="Admin Dashboard">
              <Lock size={16} />
            </a>
          </div>
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-2xl absolute w-full animate-in slide-in-from-top-2 duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map(link => (
              <a key={link.id} href={`#${link.id}`} onClick={(e) => handleNav(e, link.id)} className="block w-full text-left px-4 py-4 text-base font-medium text-gray-800 hover:text-[#8C7A6B] hover:bg-gray-50 border-b border-gray-100 last:border-0 uppercase tracking-wider">
                {link.label}
              </a>
            ))}
             <a href="#admin" onClick={(e) => handleNav(e, 'admin')} className="block w-full text-left px-4 py-4 text-sm font-medium text-gray-400 hover:text-gray-600 uppercase tracking-wider mt-4">
                Admin Login
              </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer({ content, navigate }) {
  const handleNav = (e, id) => { e.preventDefault(); navigate(id); };
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-serif font-semibold">{content?.brandName || ''}</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto md:mx-0">Based in Benin City, Edo State. Elevating everyday spaces into extraordinary places.</p>
          </div>
          <div className="flex space-x-6">
            {content?.contactInstagram && (
              <a href={content.contactInstagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#8C7A6B] transition-colors p-2"><Instagram size={24} /></a>
            )}
            {content?.contactEmail && (
              <a href={`mailto:${content.contactEmail}`} className="text-gray-400 hover:text-[#8C7A6B] transition-colors p-2"><Mail size={24} /></a>
            )}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} {content?.brandName || ''}. All rights reserved.</p>
            <p className="text-xs text-gray-400 mt-2">Designed by <span className="font-semibold text-gray-500">The Clean Brand Agency</span>.</p>
          </div>
          <a href="#admin" onClick={(e) => handleNav(e, 'admin')} className="text-gray-300 hover:text-gray-500 text-xs p-2">Admin Access</a>
        </div>
      </div>
    </footer>
  );
}

function HomeView({ navigate, content, projects, ongoingProjects, testimonials }) {
  return (
    <article className="animate-in fade-in duration-700">
      <header className="relative h-[70vh] md:h-[80vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <img src={content?.heroImage || ''} alt={`${content?.brandName || ''} - Interior Design`} fetchPriority="high" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-white mt-10 md:mt-0">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium mb-4 md:mb-6 drop-shadow-lg leading-tight">{content?.heroHeadline || ''}</h1>
          <p className="text-base sm:text-lg md:text-xl font-light mb-8 md:mb-10 max-w-2xl mx-auto drop-shadow-md text-gray-100 px-2">{content?.heroSub || ''}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0">
            <button onClick={() => navigate('contact')} className="px-8 py-4 bg-[#8C7A6B] text-white text-sm uppercase tracking-widest hover:bg-[#736356] transition-colors w-full sm:w-auto font-semibold shadow-lg">
              Book a Consultation
            </button>
            <button onClick={() => navigate('portfolio')} className="px-8 py-4 border border-white text-white text-sm uppercase tracking-widest hover:bg-white/10 transition-colors w-full sm:w-auto font-medium">
              View Our Work
            </button>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
             <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-2">Design Philosophy</h2>
             <h3 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4 md:mb-6">Excellence in Every Detail</h3>
             <p className="text-gray-500 text-base md:text-lg">We combine premium materials, bespoke craftsmanship, and modern aesthetics to create spaces that feel both luxurious and intimately yours.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[600px]">
             <div className="md:col-span-2 overflow-hidden relative group h-[300px] md:h-auto rounded-md md:rounded-none">
                <img src="https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&q=80&w=1200" alt="Luxury Interior" loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
             </div>
             <div className="flex flex-col gap-4">
                <div className="h-[250px] md:h-1/2 overflow-hidden relative group rounded-md md:rounded-none">
                   <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600" alt="Modern Detail" loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <div className="h-[250px] md:h-1/2 overflow-hidden relative group bg-gray-100 rounded-md md:rounded-none">
                   <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600" alt="Premium Decor" loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {ongoingProjects.length > 0 && (
        <section className="py-16 md:py-20 bg-[#F9F8F6] border-y border-gray-200">
           <div className="max-w-7xl mx-auto px-4">
              <div className="mb-10 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-2">Behind the Scenes</h2>
                  <h3 className="text-3xl md:text-4xl font-serif">Ongoing Projects</h3>
                </div>
                <p className="text-gray-500 max-w-md md:text-right text-sm md:text-base">A sneak peek into the beautiful spaces we are currently bringing to life.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 {ongoingProjects.map(proj => (
                    <div key={proj.id} className="bg-white border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col sm:flex-row gap-4 md:gap-6 hover:shadow-md transition-shadow rounded-xl">
                       <img src={proj.image || 'https://via.placeholder.com/300'} alt={proj.title} loading="lazy" className="w-full sm:w-40 md:w-48 h-56 sm:h-auto object-cover rounded-lg" />
                       <div className="flex flex-col justify-center flex-grow pt-2 sm:pt-0">
                          <h4 className="text-xl font-serif mb-2 text-[#2C2C2C]">{proj.title}</h4>
                          <p className="text-gray-500 text-sm mb-6 line-clamp-3">{proj.desc}</p>
                          <div className="mt-auto">
                             <div className="flex justify-between text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">
                                <span>Project Progress</span>
                                <span className="text-[#8C7A6B]">{proj.progress}</span>
                             </div>
                             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#8C7A6B] h-full transition-all duration-1000" style={{ width: proj.progress }}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10 md:mb-12">
          <div>
            <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-2">Our Portfolio</h2>
            <h3 className="text-3xl md:text-4xl font-serif">Completed Masterpieces</h3>
          </div>
          <button onClick={() => navigate('portfolio')} className="hidden md:flex items-center text-[#8C7A6B] hover:text-[#736356] transition-colors font-medium">
            See all projects <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {projects.slice(0, 2).map((project) => (
            <div key={project.id} className="group cursor-pointer" onClick={() => navigate('project-detail', project)}>
              <div className="overflow-hidden bg-gray-100 aspect-[4/3] mb-4 md:mb-5 relative rounded-lg">
                {project.mediaType === 'youtube' && <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"><Video className="text-white drop-shadow-md" size={48} /></div>}
                <img 
                   src={project.mediaType === 'youtube' ? `https://img.youtube.com/vi/${getYouTubeId(project.mediaUrl)}/hqdefault.jpg` : project.mediaUrl} 
                   alt={project.title} 
                   loading="lazy" 
                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                   onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800'; e.currentTarget.onerror = null; }} 
                />
              </div>
              <h4 className="text-xl md:text-2xl font-serif group-hover:text-[#8C7A6B] transition-colors px-1">{project.title}</h4>
              <p className="text-gray-500 mt-2 line-clamp-2 px-1 text-sm md:text-base">{project.desc}</p>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('portfolio')} className="mt-8 md:hidden flex w-full justify-center items-center py-4 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm">
            See all projects <ArrowRight size={18} className="ml-2" />
        </button>
      </section>

      {testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-[#2C2C2C] text-white">
          <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-12 md:mb-16">
                <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-2">Client Stories</h2>
                <h3 className="text-3xl md:text-4xl font-serif">What Our Clients Say</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {testimonials.map(test => (
                   <div key={test.id} className="bg-[#3A3A3A] p-6 md:p-10 rounded-xl border border-gray-700 relative">
                      <Quote size={40} className="text-[#8C7A6B] opacity-20 absolute top-6 right-6 md:top-8 md:right-8" />
                      <div className="flex gap-1 mb-6 text-[#8C7A6B]">
                         <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                      </div>
                      <p className="text-gray-300 italic mb-8 md:mb-10 leading-relaxed text-base md:text-lg">"{test.text}"</p>
                      <div className="flex items-center gap-4 md:gap-5 border-t border-gray-600 pt-6">
                         <img src={test.image || 'https://via.placeholder.com/150'} alt={test.name} loading="lazy" className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-full border-2 border-[#8C7A6B] shadow-sm" />
                         <div>
                            <h5 className="font-serif font-medium text-base md:text-lg text-white">{test.name}</h5>
                            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mt-1">{test.location}</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </section>
      )}
    </article>
  );
}

function AboutView({ content, teamMembers }) {
  return (
    <article className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-12 md:py-24">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="order-2 md:order-1">
          <img src={content?.aboutImage || ''} alt="About Us" fetchPriority="high" className="w-full h-[350px] md:h-[600px] object-cover shadow-xl rounded-lg md:rounded-none" />
        </div>
        <div className="order-1 md:order-2">
          <h1 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-3 md:mb-4">Our Story</h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 md:mb-8 text-[#2C2C2C] leading-tight">Design with Purpose.</h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
            {content?.aboutText || ''}
          </p>
          <div className="grid grid-cols-2 gap-6 mt-8 md:mt-12 border-t border-gray-200 pt-8 md:pt-12">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif text-[#8C7A6B] mb-2">50+</h3>
              <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-medium">Projects Completed</p>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-serif text-[#8C7A6B] mb-2">8</h3>
              <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-medium">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {teamMembers && teamMembers.length > 0 && (
        <section className="mt-20 md:mt-32 pt-16 md:pt-20 border-t border-gray-200">
          <div className="text-center mb-12 md:mb-16">
             <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-2">The Visionaries</h2>
             <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#2C2C2C]">Meet Our Team</h3>
             <p className="text-gray-500 text-base md:text-lg mt-4 max-w-2xl mx-auto px-2">The dedicated professionals bringing your luxury spaces to life with passion, precision, and global standards.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {teamMembers.map(member => (
               <div key={member.id} className="group flex flex-col items-center text-center bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-5 md:mb-6 overflow-hidden rounded-full border-4 border-gray-50 group-hover:border-[#8C7A6B] transition-colors duration-300">
                     <img src={member.image || 'https://via.placeholder.com/200'} alt={member.name} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-serif text-[#2C2C2C] mb-1">{member.name}</h4>
                  <p className="text-[#8C7A6B] font-bold text-xs uppercase tracking-wider mb-4">{member.role}</p>
                  <p className="text-gray-500 leading-relaxed text-sm">{member.bio}</p>
               </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function ServicesView({ services, navigate }) {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <article className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-12 md:py-24">
      <header className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <h1 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-2 md:mb-4">Expertise</h1>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 md:mb-6">Our Services</h2>
        <p className="text-gray-500 text-base md:text-lg px-2">We offer tailored design packages to suit different needs, budgets, and project scopes.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {services.map((service) => (
          <div key={service.id} onClick={() => setSelectedService(service)} className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-xl md:hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full group rounded-2xl">
            <CheckCircle className="text-[#8C7A6B] mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300" size={32} />
            <h3 className="text-xl md:text-2xl font-serif mb-3 md:mb-4 group-hover:text-[#8C7A6B] transition-colors">{service.title}</h3>
            <p className="text-gray-600 mb-6 md:mb-8 flex-grow text-sm md:text-base">{service.desc}</p>
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-[#2C2C2C] text-sm md:text-base">{service.price}</span>
              <span className="text-xs md:text-sm text-[#8C7A6B] font-bold uppercase tracking-wider flex items-center">
                Details <ArrowRight size={16} className="ml-1 opacity-100 md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-300" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedService(null)}>
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedService(null)} className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors p-2 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-md">
              <X size={20} />
            </button>
            {selectedService.image && (
              <div className="w-full h-48 sm:h-64 relative flex-shrink-0">
                 <img src={selectedService.image} alt={selectedService.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            )}
            <div className="p-6 md:p-10 overflow-y-auto flex-grow">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 mt-2 md:mt-0">
                 <div className="p-2 md:p-3 bg-gray-50 rounded-full text-[#8C7A6B] flex-shrink-0">
                   <CheckCircle size={24} className="md:w-7 md:h-7" />
                 </div>
                 <h3 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] pr-8">{selectedService.title}</h3>
              </div>
              <div className="text-gray-600 mb-8 md:mb-10 leading-relaxed text-sm md:text-lg whitespace-pre-line">
                {selectedService.detailedDesc || selectedService.desc}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-5 md:p-6 rounded-xl border border-gray-100 gap-4 sm:gap-0 mt-auto">
                <div className="text-center sm:text-left w-full sm:w-auto">
                   <span className="block text-xs md:text-sm text-gray-500 uppercase tracking-widest mb-1 font-semibold">Starting at</span>
                   <span className="text-xl md:text-2xl font-bold text-[#2C2C2C]">{selectedService.price}</span>
                </div>
                <button onClick={() => { setSelectedService(null); navigate('contact'); }} className="w-full sm:w-auto px-8 py-4 bg-[#2C2C2C] text-white text-sm uppercase tracking-widest hover:bg-[#8C7A6B] transition-colors font-bold rounded-lg shadow-md hover:shadow-lg">
                  Inquire Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function PortfolioView({ projects, navigate, content }) {
  if (!projects || projects.length === 0) return <div className="p-10 md:p-20 text-center text-gray-500">No projects found. Check back later!</div>;

  const featuredProject = projects[0];
  const otherProjects = projects.slice(1);

  return (
    <article className="animate-in fade-in duration-500 bg-white">
       <header className="bg-[#1A1A1A] text-white pt-24 pb-16 md:pt-32 md:pb-24 px-4 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&q=80&w=2000')] opacity-10 mix-blend-overlay object-cover"></div>
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-4 md:mb-6 flex items-center justify-center gap-2 md:gap-4">
              <span className="w-8 md:w-12 h-px bg-[#8C7A6B]"></span> Our Signature Works <span className="w-8 md:w-12 h-px bg-[#8C7A6B]"></span>
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-6 md:mb-8 leading-tight drop-shadow-md">A Gallery of <br className="hidden md:block"/> Timeless Masterpieces</h2>
            <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed px-2">
              Explore our curated collection of luxury residential and commercial spaces designed for Nigeria's most discerning clientele.
            </p>
         </div>
       </header>

       <section className="max-w-7xl mx-auto px-4 py-16 md:py-32">
         {featuredProject && (
           <div className="mb-20 md:mb-32 group cursor-pointer" onClick={() => navigate('project-detail', featuredProject)}>
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-center">
                <div className="lg:col-span-8 relative h-[300px] sm:h-[400px] lg:h-[700px] overflow-hidden rounded-lg lg:rounded-sm shadow-xl lg:shadow-2xl z-10">
                   {featuredProject.mediaType === 'youtube' && <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"><Video className="text-white drop-shadow-md" size={48} /></div>}
                   <img 
                      src={featuredProject.mediaType === 'youtube' ? `https://img.youtube.com/vi/${getYouTubeId(featuredProject.mediaUrl)}/maxresdefault.jpg` : featuredProject.mediaUrl} 
                      alt={featuredProject.title} 
                      fetchPriority="high" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800'; e.currentTarget.onerror = null; }} 
                   />
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
                </div>
                <div className="lg:col-span-4 p-6 lg:p-0 lg:-ml-16 relative z-20 flex flex-col justify-center bg-white lg:bg-transparent mt-[-30px] lg:mt-0 mx-4 lg:mx-0 shadow-lg lg:shadow-none rounded-b-lg lg:rounded-none">
                   <div className="bg-white lg:p-12">
                     <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-[#8C7A6B] font-bold mb-3 md:mb-4">Latest Masterpiece</h3>
                     <h4 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 md:mb-6 text-[#2C2C2C] group-hover:text-[#8C7A6B] transition-colors leading-tight">{featuredProject.title}</h4>
                     {featuredProject.location && <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-100 md:border-gray-200 pb-4 md:pb-6">{featuredProject.location}</p>}
                     <p className="text-gray-600 mb-6 md:mb-10 leading-relaxed text-sm md:text-lg line-clamp-3 md:line-clamp-none">{featuredProject.desc}</p>
                     <div className="inline-flex items-center pb-1 md:pb-2 border-b-2 border-[#2C2C2C] text-[#2C2C2C] font-bold uppercase tracking-widest text-xs md:text-sm group-hover:border-[#8C7A6B] group-hover:text-[#8C7A6B] transition-colors">
                        Explore Project <ArrowRight size={16} className="ml-2 md:ml-3 transform group-hover:translate-x-2 transition-transform" />
                     </div>
                   </div>
                </div>
             </div>
           </div>
         )}

         <div className="space-y-20 md:space-y-32">
           {otherProjects.map((project, index) => (
             <div key={project.id} className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 md:gap-10 lg:gap-20 items-center group cursor-pointer`} onClick={() => navigate('project-detail', project)}>
               <div className="w-full lg:w-3/5 relative">
                 <div className="overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[600px] relative rounded-lg lg:rounded-sm shadow-lg md:shadow-xl">
                   <div className="absolute inset-0 bg-black/10 md:group-hover:bg-black/0 transition-colors duration-700 z-10"></div>
                   {project.mediaType === 'youtube' && <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"><Video className="text-white drop-shadow-md" size={40} /></div>}
                   <img src={project.mediaType === 'youtube' ? `https://img.youtube.com/vi/${getYouTubeId(project.mediaUrl)}/hqdefault.jpg` : project.mediaUrl} alt={project.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.5s] md:group-hover:scale-105" />
                 </div>
               </div>
               <div className="w-full lg:w-2/5 flex flex-col justify-center px-2 lg:px-0">
                 <span className="hidden md:inline-block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-l-2 border-[#8C7A6B] pl-4">Interior Architecture</span>
                 <h3 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] md:group-hover:text-[#8C7A6B] transition-colors mb-3 md:mb-6 leading-snug">{project.title}</h3>
                 {project.location && <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest mb-4 md:mb-6">{project.location}</p>}
                 <p className="text-gray-600 text-sm md:text-lg line-clamp-3 leading-relaxed mb-6 md:mb-10">{project.desc}</p>
                 <div className="inline-flex items-center text-xs md:text-sm font-bold uppercase tracking-widest text-[#2C2C2C] md:group-hover:text-[#8C7A6B] transition-colors w-max">
                    View Case Study <ArrowRight size={16} className="ml-2 transform md:group-hover:translate-x-2 transition-transform" />
                 </div>
               </div>
             </div>
           ))}
         </div>
       </section>

       <section className="bg-[#1A1A1A] py-20 md:py-32 px-4 text-center text-white mt-10 md:mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000')] opacity-5 object-cover mix-blend-luminosity"></div>
          <div className="max-w-3xl mx-auto relative z-10">
             <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif mb-6 md:mb-8 leading-tight px-2">Your Space Awaits Its Transformation</h2>
             <p className="text-base md:text-xl text-gray-400 mb-8 md:mb-12 font-light leading-relaxed max-w-2xl mx-auto px-4">
                Join the exclusive list of homeowners and businesses who trust {content?.brandName || ''} to deliver unparalleled luxury and style.
             </p>
             <button onClick={() => navigate('contact')} className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-[#8C7A6B] text-white text-xs md:text-sm uppercase tracking-widest hover:bg-[#736356] transition-colors font-bold shadow-xl md:hover:shadow-2xl rounded-md">
                Start Your Project
             </button>
          </div>
       </section>
    </article>
  );
}

function ProjectDetailView({ project, navigate }) {
  if (!project) return <div className="p-20 text-center">Project not found.</div>;

  useEffect(() => { window.scrollTo(0, 0); }, [project]);

  return (
    <article className="animate-in fade-in duration-700 bg-white pb-16 md:pb-24">
      <header className="relative h-[60vh] sm:h-[80vh] md:h-screen w-full bg-black">
        {project.mediaType === 'youtube' ? (
          <div className="absolute inset-0 opacity-70">
            <iframe src={`https://www.youtube.com/embed/${getYouTubeId(project.mediaUrl)}?autoplay=1&mute=1&controls=0&loop=1`} title={`${project.title} Video Preview`} className="w-full h-full pointer-events-none" frameBorder="0" allow="autoplay; encrypted-media"></iframe>
          </div>
        ) : (
          <img src={project.mediaUrl} alt={project.title} fetchPriority="high" className="w-full h-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90 flex flex-col justify-end px-4 sm:px-6 md:px-16 pb-10 md:pb-32">
           <div className="max-w-5xl">
             <button onClick={() => navigate('portfolio')} className="text-[10px] md:text-xs text-white/80 hover:text-white uppercase tracking-widest font-bold mb-4 md:mb-8 flex items-center transition-colors backdrop-blur-md bg-black/30 px-3 md:px-4 py-2 rounded-full w-max border border-white/20">
                &larr; Back to Portfolio
              </button>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">{project.title}</h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-2xl leading-relaxed hidden sm:block">{project.desc}</p>
           </div>
        </div>
      </header>
      
      <div className="bg-[#1A1A1A] text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-8 md:py-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 md:divide-x divide-gray-700">
              <div className="pl-0">
                 <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2 font-semibold">Location</p>
                 <p className="text-base md:text-lg font-serif">{project.location || 'Undisclosed'}</p>
              </div>
              <div className="md:pl-8">
                 <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2 font-semibold">Category</p>
                 <p className="text-base md:text-lg font-serif">Interior Architecture</p>
              </div>
              <div className="pl-0 md:pl-8">
                 <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2 font-semibold">Year</p>
                 <p className="text-base md:text-lg font-serif">2023 - 2024</p>
              </div>
              <div className="md:pl-8">
                 <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2 font-semibold">Status</p>
                 <p className="text-base md:text-lg font-serif text-[#8C7A6B]">Completed</p>
              </div>
           </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32">
          <section className="space-y-6 md:space-y-16">
            <div>
              <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-4 md:mb-6 flex items-center">
                <span className="w-6 md:w-8 h-px bg-[#8C7A6B] mr-3 md:mr-4"></span> The Challenge
              </h2>
              <p className="text-gray-700 leading-loose text-base md:text-xl font-light">{project.problem}</p>
            </div>
          </section>
          <section className="space-y-6 md:space-y-16">
            <div>
              <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-4 md:mb-6 flex items-center">
                <span className="w-6 md:w-8 h-px bg-[#8C7A6B] mr-3 md:mr-4"></span> The Execution
              </h2>
              <p className="text-gray-700 leading-loose text-base md:text-xl font-light">{project.solution}</p>
            </div>
          </section>
        </div>

        {project.gallery && project.gallery.length > 0 && (
          <section className="mt-20 md:mt-32 pt-16 md:pt-20 border-t border-gray-200">
            <h2 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-8 md:mb-12 flex items-center justify-center text-center">
              <span className="w-6 md:w-8 h-px bg-[#8C7A6B] mr-3 md:mr-4"></span> Project Gallery <span className="w-6 md:w-8 h-px bg-[#8C7A6B] ml-3 md:ml-4"></span>
            </h2>
            <div className="columns-1 sm:columns-2 gap-6 space-y-6">
              {project.gallery.map((img) => (
                <div key={img.id} className="break-inside-avoid mb-6 cursor-pointer">
                  <img src={img.url} alt={`${project.title} Gallery Details`} className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function ContactView({ content }) {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormState({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <article className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-12 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
         <h1 className="text-xs md:text-sm uppercase tracking-widest text-[#8C7A6B] font-bold mb-2 md:mb-4">Get in Touch</h1>
         <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 md:mb-6 text-[#2C2C2C]">Let's Build Something Beautiful</h2>
         <p className="text-gray-500 text-base md:text-lg px-2">Whether you have a clear vision or need creative direction, our team is ready to bring your dream space to life.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-2xl">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10">
              <CheckCircle size={64} className="text-[#8C7A6B]" />
              <h3 className="text-2xl font-serif text-[#2C2C2C]">Message Sent!</h3>
              <p className="text-gray-500">Thank you for reaching out. A member of our team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
                  <input type="text" required value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C7A6B] focus:border-transparent transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
                  <input type="email" required value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C7A6B] focus:border-transparent transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number</label>
                <input type="tel" value={formState.phone} onChange={(e) => setFormState({...formState, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C7A6B] focus:border-transparent transition-all" placeholder="+234 XXX XXXX" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Project Details</label>
                <textarea required rows="4" value={formState.message} onChange={(e) => setFormState({...formState, message: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C7A6B] focus:border-transparent transition-all resize-none" placeholder="Tell us about your space..." />
              </div>
              <button type="submit" className="w-full px-8 py-4 bg-[#2C2C2C] text-white text-sm uppercase tracking-widest hover:bg-[#8C7A6B] transition-colors font-bold shadow-lg rounded-lg">
                Send Inquiry
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-10">
          <div>
            <h3 className="text-2xl font-serif text-[#2C2C2C] mb-6 border-b border-gray-200 pb-4">Contact Information</h3>
            <div className="space-y-6">
              {content?.contactPhone && (
                <div className="flex items-start">
                  <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-full mr-4 text-[#8C7A6B]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Call Us</p>
                    <a href={`tel:${content.contactPhone}`} className="text-lg font-medium text-[#2C2C2C] hover:text-[#8C7A6B] transition-colors">{content.contactPhone}</a>
                  </div>
                </div>
              )}
              {content?.contactEmail && (
                <div className="flex items-start">
                  <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-full mr-4 text-[#8C7A6B]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email Us</p>
                    <a href={`mailto:${content.contactEmail}`} className="text-lg font-medium text-[#2C2C2C] hover:text-[#8C7A6B] transition-colors">{content.contactEmail}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#1A1A1A] p-8 rounded-2xl text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800')] opacity-20 object-cover mix-blend-overlay"></div>
             <div className="relative z-10">
               <h4 className="text-xl font-serif mb-2">Connect with Us</h4>
               <p className="text-gray-400 text-sm mb-6">Follow our journey and see our latest projects on Instagram.</p>
               {content?.contactInstagram && (
                 <a href={content.contactInstagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-white text-[#1A1A1A] rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">
                   <Instagram size={18} className="mr-2" /> Follow @kelvinarmani_official
                 </a>
               )}
             </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AdminLogin({ setIsAdminAuth }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') { // Simple UI gate for demonstration
      setIsAdminAuth(true);
    } else {
      setError('Invalid PIN code');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <Lock size={48} className="mx-auto text-[#8C7A6B] mb-6" />
        <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">Admin Access</h2>
        <p className="text-gray-500 text-sm mb-8">Enter the security PIN to access the dashboard.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            value={pin} 
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            className="w-full text-center text-2xl tracking-[0.5em] px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C7A6B]" 
            placeholder="••••"
            maxLength={4}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full px-8 py-4 bg-[#2C2C2C] text-white text-sm uppercase tracking-widest hover:bg-[#8C7A6B] transition-colors font-bold rounded-lg shadow-md">
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({ projects, ongoingProjects, testimonials, teamMembers, content, setContent, services, setIsAdminAuth }) {
  const [activeTab, setActiveTab] = useState('content');
  const [editContent, setEditContent] = useState(content);
  
  const handleSaveContent = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'websiteContent', 'main'), editContent);
      setContent(editContent);
      alert('Content saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save content.');
    }
  };

  const tabs = [
    { id: 'content', label: 'Website Content' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Completed Projects' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your website's content and portfolio.</p>
        </div>
        <button onClick={() => setIsAdminAuth(false)} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          <LogOut size={16} className="mr-2" /> Logout
        </button>
      </div>

      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 whitespace-nowrap text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tab.id ? 'bg-[#2C2C2C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-gray-100 min-h-[500px]">
        {activeTab === 'content' && (
          <div className="space-y-8">
            <h2 className="text-xl font-serif border-b pb-2">Global Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Brand Name</label>
                <input type="text" value={editContent.brandName} onChange={e => setEditContent({...editContent, brandName: e.target.value})} className="w-full p-3 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Phone</label>
                <input type="text" value={editContent.contactPhone} onChange={e => setEditContent({...editContent, contactPhone: e.target.value})} className="w-full p-3 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Email</label>
                <input type="text" value={editContent.contactEmail} onChange={e => setEditContent({...editContent, contactEmail: e.target.value})} className="w-full p-3 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Instagram URL</label>
                <input type="text" value={editContent.contactInstagram} onChange={e => setEditContent({...editContent, contactInstagram: e.target.value})} className="w-full p-3 border rounded-md" />
              </div>
            </div>

            <h2 className="text-xl font-serif border-b pb-2 mt-10">Homepage Hero</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hero Headline</label>
                <input type="text" value={editContent.heroHeadline} onChange={e => setEditContent({...editContent, heroHeadline: e.target.value})} className="w-full p-3 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hero Subtitle</label>
                <textarea rows="2" value={editContent.heroSub} onChange={e => setEditContent({...editContent, heroSub: e.target.value})} className="w-full p-3 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hero Image URL</label>
                <input type="text" value={editContent.heroImage} onChange={e => setEditContent({...editContent, heroImage: e.target.value})} className="w-full p-3 border rounded-md" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button onClick={handleSaveContent} className="px-6 py-3 bg-[#8C7A6B] text-white font-bold rounded-md flex items-center hover:bg-[#736356]">
                <Save size={18} className="mr-2" /> Save Content Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <AdminCollectionManager collectionName="services" items={services} defaultItem={{ title: 'New Service', desc: '', detailedDesc: '', price: '', image: '' }} />
        )}

        {activeTab === 'projects' && (
          <AdminCollectionManager collectionName="projects" items={projects} defaultItem={{ title: 'New Project', location: '', desc: '', problem: '', solution: '', mediaType: 'image', mediaUrl: '', gallery: [] }} />
        )}
      </div>
    </div>
  );
}

// Reusable component to manage collections in the admin dashboard
function AdminCollectionManager({ collectionName, items, defaultItem }) {
  const [editingItem, setEditingItem] = useState(null);

  const handleSave = async (item) => {
    const id = item.id || Date.now();
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id.toString()), { ...item, id });
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      alert("Error saving document");
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id.toString()));
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (editingItem) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-xl font-serif">{editingItem.id ? 'Edit Item' : 'Create New Item'}</h3>
          <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {Object.keys(defaultItem).map(key => {
            if (key === 'gallery' || key === 'mediaType') return null; // Simplified for this implementation
            const isTextarea = key === 'desc' || key === 'detailedDesc' || key === 'problem' || key === 'solution';
            return (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                {isTextarea ? (
                  <textarea rows="3" value={editingItem[key] || ''} onChange={(e) => setEditingItem({...editingItem, [key]: e.target.value})} className="w-full p-3 border rounded-md" />
                ) : (
                  <input type="text" value={editingItem[key] || ''} onChange={(e) => setEditingItem({...editingItem, [key]: e.target.value})} className="w-full p-3 border rounded-md" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="pt-6 flex justify-end gap-4">
          <button onClick={() => setEditingItem(null)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={() => handleSave(editingItem)} className="px-6 py-3 bg-[#8C7A6B] text-white font-bold rounded-md flex items-center hover:bg-[#736356]">
            <Save size={18} className="mr-2" /> Save Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-serif capitalize">Manage {collectionName}</h3>
        <button onClick={() => setEditingItem(defaultItem)} className="flex items-center px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1A1A1A]">
          <Plus size={16} className="mr-2" /> Add New
        </button>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50">
            <div>
              <h4 className="font-bold text-[#2C2C2C]">{item.title || item.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-1 max-w-lg">{item.desc || item.role || item.location}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingItem(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={18} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">No items found.</p>}
      </div>
    </div>
  );
}