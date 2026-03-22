import { db, factsTable } from "@workspace/db";

const seedFacts = [
  {
    claim: "COVID-19 vaccines cause infertility in women",
    verdict: "false",
    explanation: "Multiple large-scale studies involving hundreds of thousands of participants found no link between COVID-19 vaccines and infertility. WHO, CDC, and major fertility organizations have debunked this claim.",
    source: "https://www.who.int/news-room/questions-and-answers/item/coronavirus-disease-(covid-19)-vaccines-safety",
    category: "health",
    language: "en",
    keywords: ["covid", "vaccine", "infertility", "fertility", "women", "pregnancy"],
  },
  {
    claim: "India's GDP grew at 8.4% in Q3 FY2024",
    verdict: "true",
    explanation: "India's GDP growth rate of 8.4% in Q3 FY2024 (October-December 2023) was confirmed by the National Statistical Office (NSO) in February 2024, driven by strong manufacturing and services sectors.",
    source: "https://mospi.gov.in/",
    category: "economy",
    language: "en",
    keywords: ["india", "gdp", "growth", "economy", "fiscal", "quarter", "2024"],
  },
  {
    claim: "5G network towers spread COVID-19 disease",
    verdict: "false",
    explanation: "5G towers emit radio waves, which cannot carry or spread viruses. COVID-19 spreads through respiratory droplets. This is a debunked conspiracy theory.",
    source: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
    category: "health",
    language: "en",
    keywords: ["5g", "covid", "coronavirus", "tower", "network", "radiation", "spread"],
  },
  {
    claim: "India successfully landed Chandrayaan-3 on the Moon in 2023",
    verdict: "true",
    explanation: "India successfully landed Chandrayaan-3 on the lunar south pole on August 23, 2023. This made India the fourth country to land on the Moon and the first to land near the lunar south pole.",
    source: "https://www.isro.gov.in/Chandrayaan3.html",
    category: "science",
    language: "en",
    keywords: ["chandrayaan", "moon", "india", "isro", "lunar", "landing", "south pole", "2023"],
  },
  {
    claim: "Drinking cow urine cures cancer",
    verdict: "false",
    explanation: "There is no scientific evidence that drinking cow urine cures cancer. This claim has been repeatedly debunked by medical professionals and oncologists.",
    source: "https://www.cancer.org/",
    category: "health",
    language: "en",
    keywords: ["cow", "urine", "cancer", "cure", "gomutra", "treatment", "medicine"],
  },
  {
    claim: "India became the world's most populous country in 2023",
    verdict: "true",
    explanation: "According to UN data released in April 2023, India surpassed China to become the world's most populous nation with approximately 1.428 billion people.",
    source: "https://www.un.org/en/desa/india-overtake-china-most-populous-country",
    category: "politics",
    language: "en",
    keywords: ["india", "population", "china", "populous", "billion", "2023", "un"],
  },
  {
    claim: "Hot water kills the COVID-19 virus in the body",
    verdict: "false",
    explanation: "Hot water does not kill SARS-CoV-2 in the body. No temperature of water safe to drink can kill a virus already inside the body's cells.",
    source: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
    category: "health",
    language: "en",
    keywords: ["hot water", "covid", "kill", "virus", "drink", "temperature", "cure"],
  },
  {
    claim: "Uttarakhand passed the Uniform Civil Code in 2024",
    verdict: "true",
    explanation: "Uttarakhand became the first state in India to pass the Uniform Civil Code (UCC) bill in February 2024, after the state assembly approved the legislation.",
    source: "https://timesofindia.indiatimes.com/",
    category: "politics",
    language: "en",
    keywords: ["uniform civil code", "ucc", "uttarakhand", "2024", "law", "assembly"],
  },
  {
    claim: "Eating garlic prevents COVID-19 infection",
    verdict: "false",
    explanation: "There is no evidence that eating garlic prevents COVID-19. WHO explicitly stated that garlic cannot protect against the coronavirus.",
    source: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
    category: "health",
    language: "en",
    keywords: ["garlic", "covid", "prevent", "infection", "antimicrobial", "myth"],
  },
  {
    claim: "India's Aditya-L1 solar mission reached L1 orbit in January 2024",
    verdict: "true",
    explanation: "ISRO's Aditya-L1 solar mission successfully entered its final halo orbit around the Sun-Earth Lagrangian point 1 (L1) on January 6, 2024.",
    source: "https://www.isro.gov.in/Aditya_L1.html",
    category: "science",
    language: "en",
    keywords: ["aditya", "l1", "isro", "solar", "orbit", "mission", "2024", "sun"],
  },
  {
    claim: "BJP won an outright majority in India's 2024 general elections",
    verdict: "false",
    explanation: "In the 2024 Indian general elections, BJP won 240 seats, falling short of the 272 majority mark. The NDA coalition won a majority and Narendra Modi formed government with coalition support.",
    source: "https://eci.gov.in/",
    category: "politics",
    language: "en",
    keywords: ["bjp", "election", "2024", "majority", "india", "lok sabha", "nda", "modi"],
  },
  {
    claim: "WhatsApp messages automatically spread to all contacts if chain is not forwarded",
    verdict: "false",
    explanation: "WhatsApp has no mechanism to automatically spread messages to contacts. Such chain messages are hoaxes designed to spread misinformation.",
    source: "https://faq.whatsapp.com/",
    category: "technology",
    language: "en",
    keywords: ["whatsapp", "chain", "message", "forward", "contacts", "spread", "hoax"],
  },
  {
    claim: "Onion placed in the room absorbs flu virus and prevents infection",
    verdict: "false",
    explanation: "There is no scientific evidence that onions absorb viruses. This is folk mythology with no basis in microbiology. Viruses do not 'float' and get absorbed by vegetables.",
    source: "https://www.healthline.com/",
    category: "health",
    language: "en",
    keywords: ["onion", "flu", "virus", "absorb", "prevent", "infection", "myth"],
  },
  {
    claim: "India launched UPI in 2016",
    verdict: "true",
    explanation: "The Unified Payments Interface (UPI) was launched by the National Payments Corporation of India (NPCI) on April 11, 2016 by RBI Governor Raghuram Rajan.",
    source: "https://www.npci.org.in/",
    category: "technology",
    language: "en",
    keywords: ["upi", "india", "payment", "2016", "npci", "digital", "launch"],
  },
  {
    claim: "The new Parliament building in India was inaugurated in 2023",
    verdict: "true",
    explanation: "The new Parliament building of India was inaugurated by Prime Minister Narendra Modi on May 28, 2023, in New Delhi.",
    source: "https://sansad.in/",
    category: "politics",
    language: "en",
    keywords: ["parliament", "india", "new", "building", "2023", "inaugurated", "modi"],
  },
];

async function seed() {
  console.log("Seeding facts database...");
  for (const fact of seedFacts) {
    await db.insert(factsTable).values({
      claim: fact.claim,
      verdict: fact.verdict,
      explanation: fact.explanation,
      source: fact.source ?? null,
      category: fact.category,
      language: fact.language,
      keywords: fact.keywords,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedFacts.length} verified facts.`);
  process.exit(0);
}

seed().catch(console.error);
