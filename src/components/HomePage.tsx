import Header from "./Header";
import Hero from "./Hero";
import Skills from "./Skills";
import Timeline from "./Timeline";
import Publications from "./Publications";
import Projects from "./Projects";
import Contact from "./Contact";
import Resume from "./Resume";
import Footer from "./Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white forest:bg-[#edf5ef] forest:text-[#1c2e24] transition-colors duration-300">
      <Header />
      <Hero />
      <Timeline />
      <Publications />
      <Projects />
      <Skills />
      <Resume />
      <Contact />
      <Footer />
    </main>
  );
}