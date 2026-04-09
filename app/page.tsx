import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "AI Food Therapist - Daily Health Tongue Check & Diet Advice",
  description: "Experience TCM tongue diagnosis with AI Food Therapist. Get personalized dietary recommendations and health tips anytime, anywhere.",
  keywords: ["AI Food Therapist", "Tongue Diagnosis", "TCM AI", "Dietary Advice", "Health Advisor"],
  verification: {
    google: "9A8TxpfHGSZobynfItzGq9NguO8TXOhfkyzQ80ABQVM",
  },
  openGraph: {
    title: "AI Food Therapist",
    description: "Daily Health Tongue Check & Personalized Diet Advice",
    images: ["/assets/images/hero-friendly-tongue-health.png"],
  },
};

export default function Page() {
  return <HomeClient />;
}