import { AiFeatures } from "@/components/landing/AiFeatures";
import { Faq } from "@/components/landing/Faq";
import { FinalCta, Footer } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Nav } from "@/components/landing/Nav";
import { Organize } from "@/components/landing/Organize";
import { VoiceNotes } from "@/components/landing/VoiceNotes";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <VoiceNotes />
        <AiFeatures />
        <Organize />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
