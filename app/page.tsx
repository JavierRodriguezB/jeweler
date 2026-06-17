import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import Personalization from "./components/Personalization";
import About from "./components/About";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <Catalog />
      <Personalization />
      <About />
    </div>
  );
}
