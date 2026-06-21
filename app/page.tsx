import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import Personalization from "./components/Personalization";
import About from "./components/About";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <Catalog />
      <Personalization />
      <About />
      <Contact />
    </div>
  );
}
