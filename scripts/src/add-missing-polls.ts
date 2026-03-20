import { db, pollsTable, pollOptionsTable } from "@workspace/db";

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const DOC_POLLS: Array<{ question: string; category: string; options: string[] }> = [
  // TECHNOLOGY & AI
  { category: "Technology & AI", question: "Your job will still exist in 5 years. Be honest.", options: ["Definitely safe", "Probably not", "Already being replaced", "I AM the replacement"] },
  { category: "Technology & AI", question: "AI is going to make the Middle East more competitive or less?", options: ["More competitive", "Less competitive", "Only for the rich countries", "Too early to tell"] },
  { category: "Technology & AI", question: "Would you hire a junior employee or an AI tool for the same budget?", options: ["Junior employee", "AI tool", "Both, cut something else", "Depends on the role"] },
  { category: "Technology & AI", question: "Is the UAE's tech ecosystem built for founders or for photo opportunities?", options: ["Founders, genuinely", "Photo ops mostly", "Both honestly", "It's improving"] },
  { category: "Technology & AI", question: "Arabic AI models: does the region even need them?", options: ["Absolutely essential", "Nice to have", "English works fine", "The market is too small"] },
  { category: "Technology & AI", question: "The $3.5T sovereign wealth funds: are they investing in the right tech?", options: ["Yes, playing long-term", "Too conservative", "Chasing Western trends", "Nobody knows yet"] },
  { category: "Technology & AI", question: "Should coding be mandatory in every MENA school?", options: ["Yes, non-negotiable", "No, not everyone needs it", "Logic and problem-solving, not syntax", "Fix the basics first"] },
  { category: "Technology & AI", question: "Is NEOM a vision or the world's most expensive PR campaign?", options: ["Genuine vision", "Expensive PR", "Started as vision, became PR", "Too early to judge"] },
  { category: "Technology & AI", question: "Will AI replace more jobs in the Middle East than anywhere else?", options: ["Yes, less safety nets", "No, different economy", "Only white-collar jobs", "AI will create more jobs here"] },
  { category: "Technology & AI", question: "Do MENA founders get worse VC terms than their Western counterparts?", options: ["Much worse", "About the same", "Depends on the fund", "We don't have enough data"] },
  { category: "Technology & AI", question: "90% of AI startups in MENA are just a ChatGPT wrapper with a logo. Change my mind.", options: ["Accurate and embarrassing", "Harsh but fair", "There are real ones too", "You're just hating"] },
  { category: "Technology & AI", question: "$3.5 trillion in sovereign wealth and we still can't build a global consumer app. Why?", options: ["Talent keeps leaving", "Government money kills innovation", "We build for exits not users", "Give it time"] },
  { category: "Technology & AI", question: "Your company's AI strategy is one guy with a ChatGPT Plus subscription. Admit it.", options: ["Personally attacked right now", "We actually have a real one", "Even that is generous", "AI strategy is a scam anyway"] },
  { category: "Technology & AI", question: "NEOM has spent $500B+ and the main export so far is renders. Country or Behance portfolio?", options: ["Most expensive mood board ever", "Long-term vision relax", "The renders are fire though", "It's a jobs program"] },
  { category: "Technology & AI", question: "Be honest: you mass-applied to jobs using AI and still didn't get a callback.", options: ["I feel seen", "Got the job actually", "Recruiters use AI too so we're even", "I hire people and yes I can tell"] },
  { category: "Technology & AI", question: "The average MENA developer makes $24K/year. Silicon Valley counterpart makes $180K. Same code. Fair?", options: ["Cost of living is different", "No it's exploitation", "That's why they leave", "Remote work is fixing it"] },
  { category: "Technology & AI", question: "Half the tech founders at MENA conferences have never shipped a product. Just a deck and a lanyard.", options: ["The lanyard economy is real", "Networking IS the product", "I've seen this exact person", "I might be this person"] },
  { category: "Technology & AI", question: "Is the region's Smart City obsession actually helping its citizens?", options: ["Yes, real improvements", "No, it's a branding exercise", "Helps some, ignores others", "Define 'helping'"] },
  { category: "Technology & AI", question: "Crypto: investment vehicle, inflation hedge, or speculation trap in MENA?", options: ["Legit investment", "Speculation trap", "Inflation hedge", "All three depending on the person"] },
  { category: "Technology & AI", question: "Which region will produce the first $100B Arab tech company?", options: ["UAE", "Saudi Arabia", "Egypt", "None in the next decade"] },
  { category: "Technology & AI", question: "Is the brain drain from MENA getting better or worse?", options: ["Getting worse", "Getting better", "It's just shifting countries", "Remote work changes this"] },
  { category: "Technology & AI", question: "If every blockchain startup in Dubai actually had users crypto adoption would be 100%. It's 4%.", options: ["The math isn't mathing", "It's still early", "Most are just token launchers", "4% is actually decent"] },
  { category: "Technology & AI", question: "MENA produced 0 of the top 100 AI research papers in 2025. Zero. But we hosted 47 AI conferences.", options: ["Conference economy goes crazy", "Research doesn't need a stage", "We're funding not building", "The food at those events though"] },
  { category: "Technology & AI", question: "Your startup says AI-powered but your actual moat is a WhatsApp group and one ops guy named Ahmed.", options: ["Ahmed is carrying the region", "WhatsApp IS infrastructure here", "Stop exposing my business model", "Ahmed quit last week actually"] },
  { category: "Technology & AI", question: "ChatGPT writes better strategy decks than 80% of consultants billing $500/hr in the Gulf.", options: ["Consultants are shaking", "ChatGPT can't read the room", "The slides are the same the fees aren't", "I'm a consultant and I use it too"] },

  // CULTURE & SOCIETY
  { category: "Culture & Society", question: "Is wasta destroying meritocracy or is it just regional networking?", options: ["Destroying it", "It's just networking", "Both at the same time", "Meritocracy never existed here"] },
  { category: "Culture & Society", question: "Should Arabic be mandatory in every Gulf school regardless of nationality?", options: ["Yes mandatory", "Optional but encouraged", "No, focus on quality education", "Only for citizens"] },
  { category: "Culture & Society", question: "Is the Middle East's hustle culture toxic or the source of its strength?", options: ["Toxic", "Source of strength", "Both", "What hustle culture?"] },
  { category: "Culture & Society", question: "Do expats in the Gulf get more opportunities than locals and is that fair?", options: ["More opportunities, not fair", "More opportunities, it's fair", "Locals get more actually", "Depends on the industry"] },
  { category: "Culture & Society", question: "Is the concept of face (saving dignity publicly) holding the region back?", options: ["Yes, kills honesty", "No, it's cultural wisdom", "It's complicated", "Only in business"] },
  { category: "Culture & Society", question: "Should Ramadan working hours be standardised across all Gulf countries?", options: ["Yes standardise", "No each country decides", "Ramadan hours are fine as is", "Make them optional"] },
  { category: "Culture & Society", question: "Which country in MENA has the best quality of life for the average person?", options: ["UAE", "Qatar", "Oman", "Jordan"] },
  { category: "Culture & Society", question: "Is social media making the Middle East more divided than united?", options: ["More divided", "More united", "Both equally", "It just amplifies what exists"] },
  { category: "Culture & Society", question: "Are arranged marriages in the region declining and is that a loss?", options: ["Declining and good", "Declining and a loss", "Not declining actually", "Evolving not declining"] },
  { category: "Culture & Society", question: "Should dual citizenship be allowed across all GCC countries?", options: ["Yes absolutely", "No, sovereignty matters", "Only between GCC states", "It will never happen"] },
  { category: "Culture & Society", question: "Is the Gulf's tolerance of other religions genuine or strategic?", options: ["Genuine", "Strategic", "Mix of both", "Varies by country"] },
  { category: "Culture & Society", question: "Does the region respect its blue-collar workers enough?", options: ["Not even close", "Improving slowly", "Better than people think", "No and it's shameful"] },
  { category: "Culture & Society", question: "Is TikTok doing more damage or more good to Arab youth culture?", options: ["More damage", "More good", "It's just a platform", "Depends on the content"] },
  { category: "Culture & Society", question: "Nationalism in the Arab world: source of pride or barrier to progress?", options: ["Source of pride", "Barrier to progress", "Both", "Depends on the country"] },
  { category: "Culture & Society", question: "72% of Arabs under 30 want to emigrate. But y'all get mad when someone actually leaves. Which one is it?", options: ["We want options not exile", "Leaving IS the option", "The guilt trip is cultural", "They leave and come back anyway"] },
  { category: "Culture & Society", question: "Wasta got you your first job. Be honest. (67% of MENA professionals say connections matter more than CVs.)", options: ["My CV was strong AND I had wasta", "Wasta opened the door I kept it open", "No wasta pure grind", "I AM the wasta for others now"] },
  { category: "Culture & Society", question: "You post Free Palestine but won't buy from a Palestinian business. Solidarity or performance?", options: ["This one hurt", "I actually do support them", "Most people don't even know Palestinian brands", "It's more complicated than that"] },
  { category: "Culture & Society", question: "Ramadan productivity drops 40% but nobody's allowed to say it. Why are we pretending?", options: ["Spiritual gains > KPIs", "Honestly Ramadan is my most focused month", "The iftar meetings are the real work", "HR is watching I can't answer this"] },
  { category: "Culture & Society", question: "Your family asks when you're getting married more than they ask about your actual career. Are we okay?", options: ["Every single Eid", "They stopped asking (gave up)", "My career IS the problem", "Married and they still find something"] },
  { category: "Culture & Society", question: "We complain about Western media stereotypes while our own media barely covers anything outside Dubai and Riyadh.", options: ["Amman and Cairo left the chat", "Gulf media IS the region's media now", "Diaspora media fills the gap", "Fair point no excuse"] },
  { category: "Culture & Society", question: "Be honest: you judge people by their accent. Gulf Arabic vs Levantine vs Egyptian. We all do it.", options: ["Gulf = money", "Egyptian = funny", "Levantine = pretty", "I don't do this (lying)"] },
  { category: "Culture & Society", question: "80% of Gulf residents are expats but have zero path to permanent residency. Is this sustainable for another 20 years?", options: ["Built the country can't stay in it", "Golden visa fixed this", "It's a feature not a bug", "20 years is generous"] },
  { category: "Culture & Society", question: "You spent $200 on an iftar at a hotel but haggle with the delivery driver over AED 5 tip. Explain yourself.", options: ["I tip well actually", "The hotel iftar was a mistake too", "This is about class and we know it", "AED 5 IS a good tip"] },
  { category: "Culture & Society", question: "The region built $50B in malls but your neighborhood still doesn't have a decent public park. Progress?", options: ["Air-conditioned malls ARE the parks", "This is genuinely sad", "My neighborhood has a park (barely)", "Parks don't generate rent"] },
  { category: "Culture & Society", question: "You call yourself self-made but your dad's driver dropped you at your first interview. We see you.", options: ["The driver was emotional support", "Privilege acknowledged", "I took the metro actually", "Self-made is a spectrum"] },
  { category: "Culture & Society", question: "Arab hospitality is legendary until it's time to split the bill. Then it's a hostage negotiation.", options: ["I always grab the bill", "The fake wallet reach is an art form", "Whoever invited should pay period", "Venmo would fix the Middle East"] },

  // BUSINESS & STARTUPS
  { category: "Business & Startups", question: "Is the MENA startup ecosystem actually meritocratic?", options: ["Yes if you're good you rise", "Not even close", "Meritocratic for some", "What ecosystem?"] },
  { category: "Business & Startups", question: "Should founders bootstrap or take VC money in this region?", options: ["Bootstrap always", "VC if the idea is big enough", "Depends on the sector", "There's no VC money anyway"] },
  { category: "Business & Startups", question: "Is Dubai or Riyadh the better city to build a startup right now?", options: ["Dubai", "Riyadh", "Cairo (hear me out)", "Depends on the sector"] },
  { category: "Business & Startups", question: "Are MENA VCs backing the right founders or the safest ones?", options: ["The safest ones", "The right ones", "The most connected ones", "They can't tell the difference"] },
  { category: "Business & Startups", question: "Is the region's obsession with unicorns missing the point entirely?", options: ["Yes, build profitable companies", "Unicorns matter for the ecosystem", "We don't have enough of either", "It's aspirational not obsessive"] },
  { category: "Business & Startups", question: "Would you rather work for a startup or a multinational in the Middle East?", options: ["Startup", "Multinational", "Startup with multinational salary", "I'm building my own"] },
  { category: "Business & Startups", question: "Is corporate social responsibility in MENA genuine or greenwashing?", options: ["Mostly greenwashing", "Some are genuine", "Nobody cares as long as it looks good", "It's improving"] },
  { category: "Business & Startups", question: "The Saudi Vision 2030: ahead of schedule, on track, or behind?", options: ["Ahead", "On track", "Behind but course-correcting", "Too early to judge"] },
  { category: "Business & Startups", question: "Is family business still the most reliable path to wealth in this region?", options: ["Yes and that's the problem", "Yes and that's fine", "No, tech is the new path", "Family + tech is the real play"] },
  { category: "Business & Startups", question: "Should the UAE introduce a minimum wage for all workers?", options: ["Yes, long overdue", "No, market should decide", "Only for certain sectors", "It already exists for Emiratis"] },
  { category: "Business & Startups", question: "Are women-led startups in MENA getting equal access to capital?", options: ["Not even close", "Improving", "Equal access exists", "The data says no"] },
  { category: "Business & Startups", question: "Is the informal economy a bigger problem than we admit?", options: ["Massive problem", "It's actually an advantage", "Depends on the country", "We don't have the data"] },
  { category: "Business & Startups", question: "MENA's e-commerce boom: who are the real winners?", options: ["Amazon/Noon", "Small businesses", "Logistics companies", "Consumers"] },
  { category: "Business & Startups", question: "Does this region reward risk-taking or punish failure too harshly?", options: ["Punishes failure", "Rewards risk-taking", "Depends on who you are", "Failure isn't discussed enough"] },
  { category: "Business & Startups", question: "The average MENA startup dies in 18 months. The average VC fund takes 3 years to deploy. Who's failing who?", options: ["VCs are too slow", "Founders burn too fast", "Both are mid", "18 months is generous"] },
  { category: "Business & Startups", question: "Your LinkedIn says Serial Entrepreneur but your last 3 startups had the same 12 customers. Serially mid.", options: ["Serial pivoter is more accurate", "12 loyal customers is a moat", "LinkedIn bios are fiction", "I'm in this photo and I don't like it"] },
  { category: "Business & Startups", question: "MENA founders raise $2M and immediately get a Porsche Cayenne. Investors: y'all see this right?", options: ["The Cayenne is a networking tool", "I've literally seen this happen", "Founders need to look successful", "That's the LP's money not theirs"] },
  { category: "Business & Startups", question: "Dubai has 40,000+ registered companies. 80% have fewer than 5 employees. Building businesses or buying visas?", options: ["Visa economics is real", "Small doesn't mean fake", "Most are freelancer shells", "Still more real than a pitch deck"] },
  { category: "Business & Startups", question: "Your co-founder brings the network. Three months in the network is one uncle and a group chat.", options: ["The uncle came through though", "Co-founder breakups are the real pandemic", "Network = one strong intro away", "I am the network co-founder mind your business"] },
  { category: "Business & Startups", question: "Saudi Arabia created 450,000 SME licenses in 2024. How many have actual revenue?", options: ["Less than 10% let's be real", "Revenue takes time", "The license IS the business plan", "Better than zero licenses"] },
  { category: "Business & Startups", question: "Founders fly business class to conferences but pay their teams 30 days late. Accountability where?", options: ["Conference ROI is real though", "Pay your people first always", "The business class is on miles", "I know exactly who you're talking about"] },
  { category: "Business & Startups", question: "Family offices control $1T+ in the Gulf but most won't back a founder without a warm intro. Meritocracy?", options: ["Warm intros are universal not regional", "Family offices aren't VCs", "If your idea was good someone would intro you", "The warm intro economy needs disrupting"] },
  { category: "Business & Startups", question: "Your company has 6 VPs, 4 directors, 2 actual builders, and an office dog. This is most MENA startups.", options: ["The dog is the most productive", "Title inflation is a regional disease", "I'm a VP and I build things", "Accurate for Series A+"] },
  { category: "Business & Startups", question: "You've been pre-revenue for 3 years and call it deep tech. It's not deep tech. You have no customers.", options: ["Pre-revenue is a vibe", "Deep tech genuinely takes longer", "3 years with no revenue is a hobby", "The market isn't ready (cope)"] },
  { category: "Business & Startups", question: "The average exit in MENA is $15M. The average VC fund tells LPs they'll return 10x. Someone explain the math.", options: ["The math never mathed", "There are outliers that carry", "LPs don't check", "This is why we need secondaries"] },

  // CITIES & LIFESTYLE
  { category: "Cities & Lifestyle", question: "Dubai, Riyadh, or Cairo: where is the real future of the Middle East?", options: ["Dubai", "Riyadh", "Cairo", "None of the above"] },
  { category: "Cities & Lifestyle", question: "Would you raise your kids in the Middle East?", options: ["Yes, absolutely", "No, better options abroad", "Depends on the country", "Yes but I have concerns"] },
  { category: "Cities & Lifestyle", question: "Which Arab city has the best work-life balance?", options: ["Amman", "Muscat", "Abu Dhabi", "None of them"] },
  { category: "Cities & Lifestyle", question: "Is Dubai too expensive now or is the value still there?", options: ["Too expensive", "Still worth it", "Depends on your salary", "It was always expensive"] },
  { category: "Cities & Lifestyle", question: "Riyadh is changing fast. Is it changing in the right direction?", options: ["Right direction", "Too fast too soon", "Only for the wealthy", "Ask again in 5 years"] },
  { category: "Cities & Lifestyle", question: "Which city in MENA will be the next global startup hub?", options: ["Riyadh", "Cairo", "Abu Dhabi", "None, Dubai stays on top"] },
  { category: "Cities & Lifestyle", question: "Is the traffic in your city getting better or worse and does leadership care?", options: ["Worse, they don't care", "Worse, they're trying", "Better actually", "I work from home"] },
  { category: "Cities & Lifestyle", question: "Is the expat lifestyle in the Gulf sustainable long-term?", options: ["Not at all", "If you save aggressively", "Only for high earners", "It's a trap"] },
  { category: "Cities & Lifestyle", question: "Would you give up a higher salary to live in your home country?", options: ["Yes without hesitation", "No, money matters", "Already did it", "My home country can't afford me"] },
  { category: "Cities & Lifestyle", question: "Is Beirut despite everything still the cultural heart of the Arab world?", options: ["Always will be", "Not anymore", "It's the heart that keeps breaking", "Culture moved to the Gulf"] },
  { category: "Cities & Lifestyle", question: "Dubai rent went up 30% in 2 years. Salaries went up 3%. But sure it's still the city of opportunity.", options: ["Opportunity to go broke", "Still better than back home", "Salaries will catch up", "I moved to Sharjah"] },
  { category: "Cities & Lifestyle", question: "Riyadh's entertainment scene went from 0 to 100 in 3 years. But can you walk anywhere? The sidewalk test.", options: ["You need a car to buy water", "They're building walkability", "Entertainment > sidewalks", "Riyadh in summer? Nobody's walking"] },
  { category: "Cities & Lifestyle", question: "You moved to Dubai for 2 years and it's been 11. The airport is closer than your hometown.", options: ["I'm going back next year (lying)", "Dubai IS home now", "I'm stuck not staying", "The 2-year plan is a regional meme"] },
  { category: "Cities & Lifestyle", question: "Cairo has 22 million people some of the best food on earth and the worst traffic. Would you still choose it?", options: ["Cairo is chaos I can't quit", "Great to visit impossible to live", "The food justifies everything", "I left Cairo and miss it daily"] },
  { category: "Cities & Lifestyle", question: "Doha built $200B in infrastructure for the World Cup. It's been 3 years. What's the vibe now?", options: ["Quiet luxury literally", "It was always a company town", "Best airport least nightlife", "Doha doesn't need your validation"] },
  { category: "Cities & Lifestyle", question: "You live in JBR pay AED 120K in rent eat at the same 3 restaurants and call it living your best life.", options: ["I'm in this caption and I'm upset", "JBR is a lifestyle choice", "Business Bay is where it's at", "AED 120K for JBR is a deal now"] },
  { category: "Cities & Lifestyle", question: "Amman has incredible talent cheap rent and no VC money. Is Jordan the most underrated city in MENA?", options: ["Amman is a sleeping giant", "Underrated but under-invested", "Talent leaves because there's no money", "Lebanon said the same thing 10 years ago"] },
  { category: "Cities & Lifestyle", question: "Bahrain is 30 minutes from Saudi but feels like a different planet. Flex or warning?", options: ["Bahrain is the vibe Saudi wants", "30 minutes 30 years apart", "Bahrain is underrated", "The causeway traffic disagrees"] },
  { category: "Cities & Lifestyle", question: "You complain about Dubai but won't move. You complain about your home country but won't go back. Pick a struggle.", options: ["Both struggles are valid", "Moving is not that simple", "I complain because I care", "I'm saving up to go back (lying)"] },
  { category: "Cities & Lifestyle", question: "Abu Dhabi has more cultural institutions per capita than most European capitals. But people still say there's nothing to do.", options: ["Louvre Guggenheim and no nightlife", "Abu Dhabi is for grown-ups", "Culture ≠ things to do", "Weekend in Dubai fixes it"] },
  { category: "Cities & Lifestyle", question: "Beirut's GDP dropped 60% since 2019 but the restaurants are still packed. Explain the economics of denial.", options: ["Lebanese resilience is unmatched", "It's the diaspora money", "Denial is a coping mechanism", "Those restaurants are paid in cash ask no questions"] },
  { category: "Cities & Lifestyle", question: "KSA spent $1.5T on giga-projects. Egypt's new capital cost $58B. Oman did nothing flashy and might outlast both.", options: ["Oman plays the long game", "Giga-projects create giga-jobs", "Egypt's capital is underrated", "Oman is everyone's backup plan"] },

  // IDENTITY & BELONGING
  { category: "Identity & Belonging", question: "Are we building for ourselves or for Western validation?", options: ["For ourselves", "For Western validation", "For investors (same thing)", "Both and that's okay"] },
  { category: "Identity & Belonging", question: "What does it mean to be Arab in 2026?", options: ["Pride in heritage", "A complicated identity", "Whatever you make it", "Less than it used to"] },
  { category: "Identity & Belonging", question: "Is the Arab diaspora more influential outside the region or inside it?", options: ["Outside", "Inside", "Different types of influence", "They've checked out"] },
  { category: "Identity & Belonging", question: "Is the Middle East one region or is that a Western invention?", options: ["One region", "Western invention", "Multiple regions forced together", "United by language only"] },
  { category: "Identity & Belonging", question: "Is there a growing generation gap in values between parents and children in MENA?", options: ["Massive and growing", "Normal generational stuff", "Bigger here than anywhere", "Not really"] },
  { category: "Identity & Belonging", question: "Should Arab countries celebrate their pre-Islamic heritage more openly?", options: ["Yes absolutely", "No, Islam defines us", "They already do", "It's politically complicated"] },
  { category: "Identity & Belonging", question: "Do you feel more connected to your nationality or your city?", options: ["Nationality", "City", "Neither, I'm a global citizen", "My neighborhood honestly"] },
  { category: "Identity & Belonging", question: "Is English or Arabic the language of success in this region?", options: ["English", "Arabic", "Both equally", "Code-switching is the real language"] },
  { category: "Identity & Belonging", question: "Is the Arab World branding hurting countries that want to be seen individually?", options: ["Yes definitely", "No, unity is strength", "Only for smaller countries", "Nobody thinks about this"] },
  { category: "Identity & Belonging", question: "Is religious identity in MENA getting stronger or weaker among Gen Z?", options: ["Weaker", "Stronger", "More private not weaker", "Depends on the country"] },
  { category: "Identity & Belonging", question: "You code-switch between 3 languages 2 accents and a completely different personality depending on the meeting. Healthy?", options: ["It's a superpower", "It's exhausting actually", "Third culture kid syndrome", "This is just being Arab abroad"] },
  { category: "Identity & Belonging", question: "The most Arab thing about half the diaspora is the food they post on Instagram. Are we losing the plot?", options: ["Hummus is identity", "Culture is deeper than food", "At least they're connected somehow", "The diaspora does more than you think"] },
  { category: "Identity & Belonging", question: "50% of MENA's top talent was educated abroad and came back. The other 50% didn't. Who's right?", options: ["The ones who came back", "The ones who stayed abroad", "Both made the right call", "The ones who never left"] },
  { category: "Identity & Belonging", question: "You fly Emirates but can't name a single Emirati friend. Living in the Gulf doesn't mean you're part of it.", options: ["It's hard to meet nationals", "I have Emirati friends actually", "The segregation is structural", "Fair point no excuses"] },
  { category: "Identity & Belonging", question: "Arab parents will sacrifice everything to give you a better life and then guilt you about it for 40 years.", options: ["The ROI on guilt is generational", "Sacrifice with strings attached", "They deserve gratitude though", "I'm both the child and the parent now"] },
  { category: "Identity & Belonging", question: "'Where are you really from?' asked by Arabs to other Arabs. We do the same thing we complain about.", options: ["We absolutely do this", "It's curiosity not racism", "When WE do it it's different", "Nationality obsession is a Gulf sport"] },
  { category: "Identity & Belonging", question: "You left Lebanon/Iraq/Syria/Palestine due to crisis and now someone from the Gulf says you chose to leave.", options: ["Displacement is not a choice", "People say this and it's enraging", "Empathy gap is real", "Most Gulf residents don't understand forced migration"] },
  { category: "Identity & Belonging", question: "45% of Arabs under 25 identify more with global internet culture than with their national identity. Good or terrifying?", options: ["Good borders are arbitrary", "Terrifying culture is dying", "Both at the same time", "National identity was always a construct"] },
  { category: "Identity & Belonging", question: "Your kids speak better English than Arabic and you're planning to fix that. You're not going to fix that.", options: ["Don't call me out like this", "Arabic school every Saturday", "My kids speak Arabic fine", "English is survival Arabic is heritage"] },
  { category: "Identity & Belonging", question: "You have a passport that restricts your movement but you'll defend that country with your whole chest online.", options: ["Home is home regardless", "Patriotism isn't rational", "The passport will improve", "You can love a place and critique its systems"] },
  { category: "Identity & Belonging", question: "Lebanese Palestinian Egyptian: everyone claims the food. Nobody claims the political dysfunction. Selective identity.", options: ["We claim both actually", "Food is the only thing we agree on", "Political dysfunction is inherited trauma", "Hummus belongs to all of us"] },
  { category: "Identity & Belonging", question: "Gulf Arabs and Levantine Arabs in the same room pretending they have the same culture. Adorable.", options: ["We're more similar than different", "Completely different worlds", "United by language divided by everything else", "The real divide is class not geography"] },

  // ECONOMY & FINANCE
  { category: "Economy & Finance", question: "Is the region's wealth gap getting better or worse?", options: ["Getting worse", "Getting better", "It was always bad", "Depends on the country"] },
  { category: "Economy & Finance", question: "Will crypto replace traditional banking in MENA within 10 years?", options: ["Yes", "No", "Supplement not replace", "Crypto is dead"] },
  { category: "Economy & Finance", question: "Should GCC countries introduce income tax?", options: ["Yes it's inevitable", "No that's the whole point", "Only for high earners", "VAT is enough"] },
  { category: "Economy & Finance", question: "Is the cost of living in Dubai proportional to the quality of life?", options: ["Not anymore", "Yes still worth it", "Only if you earn above average", "It never was"] },
  { category: "Economy & Finance", question: "Oil money: curse or foundation for diversification?", options: ["Curse", "Foundation", "Both at the same time", "Depends on the country"] },
  { category: "Economy & Finance", question: "Which Gulf country is best managing its post-oil transition?", options: ["UAE", "Saudi Arabia", "Bahrain", "None of them"] },
  { category: "Economy & Finance", question: "Is Islamic finance a genuine alternative or a product with extra steps?", options: ["Genuine alternative", "Extra steps same thing", "Depends on the institution", "I don't understand it"] },
  { category: "Economy & Finance", question: "Should Gulf governments reduce reliance on expat remittances?", options: ["Yes", "No remittances help sending countries", "It's not their problem to solve", "They already are"] },
  { category: "Economy & Finance", question: "Is MENA's real estate market in a bubble?", options: ["Yes, massive bubble", "No, demand is real", "Only in Dubai", "We'll know in 2 years"] },
  { category: "Economy & Finance", question: "Does the region invest enough in its public health systems?", options: ["Not even close", "Getting better", "Private healthcare fills the gap", "Compared to where?"] },
  { category: "Economy & Finance", question: "Dubai's GDP is $120B. The rent its residents pay might be $120B too. Is the economy just a landlord?", options: ["Landlord economy is the economy", "There's diversification happening", "My landlord is richer than my CEO", "This is global not just Dubai"] },
  { category: "Economy & Finance", question: "GCC saved $4T+ in sovereign wealth. The average citizen's personal savings rate is 8%. Trickle-down is a myth.", options: ["Sovereign wealth ≠ personal wealth", "Jobs are the trickle-down", "The gap is embarrassing", "8% savings is generous"] },
  { category: "Economy & Finance", question: "You make $10K/month in Dubai and somehow still live paycheck to paycheck. Where is the money going?", options: ["Brunch culture is expensive", "Rent takes 40% before I breathe", "I send money home", "I genuinely don't know"] },
  { category: "Economy & Finance", question: "Islamic finance is a $4T industry. But you still can't explain how it's structurally different from conventional banking.", options: ["It's the intention that matters", "The structures are different Google it", "It's conventional banking in a thobe", "I use it and don't ask questions"] },
  { category: "Economy & Finance", question: "Egypt devalued its currency 3 times in 3 years. The falafel sandwich is now the leading inflation indicator.", options: ["Falafel index is real", "EGP will stabilize", "Egypt's fundamentals are strong (delusional)", "The people absorb everything always"] },
  { category: "Economy & Finance", question: "You bought crypto in 2021 at the top told everyone you were early and haven't checked your portfolio since.", options: ["It's a long-term hold", "I'm still in profit (barely)", "The portfolio is a graveyard", "I've learned my lesson (I haven't)"] },
  { category: "Economy & Finance", question: "Saudi Arabia needs 500,000 new jobs/year to hit Vision 2030 targets. They've created 200K/year. Nobody mentions this.", options: ["The gap is concerning", "Private sector is ramping", "Government jobs will fill it", "Saudization is working slowly"] },
  { category: "Economy & Finance", question: "Average time to get paid by a client in the Gulf: 90-120 days. Average time for rent to be due: 30 days. Broken.", options: ["Cash flow kills more businesses than competition", "Post-dated checks are violence", "Get better clients", "Invoice factoring exists use it"] },
  { category: "Economy & Finance", question: "Real estate makes up 30% of Dubai's GDP. If property prices drop 20% what's the plan?", options: ["There is no plan B", "Tourism carries the rest", "Dubai always bounces back", "This question made developers nervous"] },
  { category: "Economy & Finance", question: "The average Gulf wedding costs $80K-$150K. The average marriage lasts… let's not finish that sentence.", options: ["The wedding IS the ROI", "Divorce rates say everything", "Cultural obligation not choice", "Elope and invest the $150K"] },
  { category: "Economy & Finance", question: "You trust a random Telegram group for investment advice more than a licensed financial advisor.", options: ["The Telegram group has better returns", "Financial advisors just sell insurance", "I trust neither", "The group admin drives a Lamborghini so…"] },
  { category: "Economy & Finance", question: "Oil will be irrelevant in 30 years. Half the GCC still hasn't meaningfully diversified. Clock's ticking.", options: ["UAE and Saudi are diversifying", "30 years is a long time", "Kuwait and Iraq are in trouble", "Renewables are the new oil anyway"] },

  // WOMEN & EQUALITY
  { category: "Women & Equality", question: "Should women have equal inheritance rights across the Middle East?", options: ["Yes", "No, Sharia is clear", "It's more nuanced than that", "This shouldn't be a poll"] },
  { category: "Women & Equality", question: "Is the gender gap in MENA startups actually closing?", options: ["Slowly yes", "Not at all", "Only in certain sectors", "We just talk about it more"] },
  { category: "Women & Equality", question: "Which country has made the most genuine progress on women's rights?", options: ["Saudi Arabia (recently)", "UAE", "Tunisia", "None enough"] },
  { category: "Women & Equality", question: "Is the region's female leadership more symbolic or substantive?", options: ["Mostly symbolic", "Becoming substantive", "Depends on the org", "Both"] },
  { category: "Women & Equality", question: "Should quotas for women on corporate boards be mandatory in MENA?", options: ["Yes, it's the only way", "No, merit should decide", "Temporary quotas then phase out", "Fix the pipeline first"] },
  { category: "Women & Equality", question: "Is the hijab debate in MENA settled or still very much alive?", options: ["Settled", "Still very alive", "Only alive for outsiders", "It shouldn't be a debate"] },
  { category: "Women & Equality", question: "Are women in the Gulf given equal access to career opportunities?", options: ["Yes", "No", "On paper yes, in practice no", "Getting better"] },
  { category: "Women & Equality", question: "Is the marriage age gap (older men, younger women) a problem the region needs to address?", options: ["Yes", "No, it's cultural", "Only when extreme", "Mind your business"] },
  { category: "Women & Equality", question: "Saudi women couldn't drive until 2018. Now they're outperforming men in university enrollment. Imagine a 50-year head start.", options: ["Unstoppable when given the chance", "The progress is real and fast", "Enrollment ≠ employment though", "This is the most important stat in the region"] },
  { category: "Women & Equality", question: "'We respect women' — said the company with 0 women in the C-suite and a women's day Instagram post.", options: ["The Instagram post is doing the heavy lifting", "We have women in leadership actually", "Tokenism is everywhere not just MENA", "Post the org chart not the graphic"] },
  { category: "Women & Equality", question: "65% of university graduates in the Gulf are women. 15% of senior leadership positions are held by women. Where's the leak?", options: ["The pipeline isn't the problem the ceiling is", "Cultural expectations push women out", "It's changing slowly", "Companies promote who they're comfortable with"] },
  { category: "Women & Equality", question: "You call yourself a feminist at conferences but still expect your wife to manage the house. We see you bro.", options: ["Called out", "I actually split responsibilities", "Conference feminism is a genre", "This goes both ways"] },
  { category: "Women & Equality", question: "A woman in MENA gets asked about work-life balance in every interview. A man never does. Same role. Same company.", options: ["Happens constantly", "This is changing in my experience", "The question should be illegal", "I've asked this and now I feel bad"] },
  { category: "Women & Equality", question: "The highest-paid woman in most MENA companies still makes less than the lowest-paid man in the C-suite.", options: ["Progress is a comforting lie", "Pay transparency would fix this", "Not true at my company", "The gap is global not just MENA"] },
  { category: "Women & Equality", question: "Gulf countries market themselves as progressive on women's rights while kafala still exists for domestic workers.", options: ["Kafala reform is overdue", "These are separate issues", "You can't claim progress selectively", "Some countries have reformed it"] },

  // ARTS & EXPRESSION (brand new category)
  { category: "Arts & Expression", question: "An Arab film gets shortlisted for the Oscars and the region celebrates. But the filmmaker had to leave to make it. Why can't we make it here?", options: ["Censorship kills creativity at home", "Funding goes to safe content only", "The talent exists, the ecosystem doesn't", "Some are making it here, you just don't know"] },
  { category: "Arts & Expression", question: "There are gay Arabs. Millions of them. The region pretends they don't exist. How long can that last?", options: ["The silence is cracking", "It will last generations still", "People know, they just don't talk", "This question alone is proof it can't"] },
  { category: "Arts & Expression", question: "Galleries in the Gulf spend millions on Western art while local artists can't afford studio rent. Patronage or performance?", options: ["Performance, 100%", "They buy Western to attract tourism", "Local art scene is growing regardless", "You can do both"] },
  { category: "Arts & Expression", question: "A transgender person in MENA risks prison, violence, or death for existing. In 2026. Are we going to keep pretending this is just culture?", options: ["It's a human rights crisis", "The region isn't ready for this conversation", "People are suffering in silence", "Culture is not an excuse for harm"] },
  { category: "Arts & Expression", question: "Arabic calligraphy is one of humanity's greatest art forms. We put it on hotel walls instead of in schools. Is the region losing its own artistic heritage?", options: ["We commercialized our culture", "Calligraphy is alive and thriving", "Heritage preservation is not a priority", "Hotels are where tourists see it so it works"] },
  { category: "Arts & Expression", question: "Name one Arab film from the last 5 years without Googling. The fact you can't is the problem.", options: ["I actually can", "I can't and that's embarrassing", "Arab cinema isn't marketed to us", "Netflix hasn't picked them up"] },
  { category: "Arts & Expression", question: "Every MENA country censors art. Some just do it more quietly than others. Should artists have to self-censor to survive?", options: ["No artist should have to self-censor", "Self-censorship is survival, not submission", "The line between culture and censorship is blurry", "If you can't say it here, say it from abroad"] },
  { category: "Arts & Expression", question: "The region's most honest storytelling is happening in rap and street music. Not in museums. Not in galleries. On SoundCloud.", options: ["Street music is the real archive", "Museums serve a different purpose", "Both can coexist", "The best Arab art has always been underground"] },
  { category: "Arts & Expression", question: "LGBTQ+ Arabs exist in every country, every family, every industry. The region's biggest open secret. When does the conversation actually start?", options: ["It's already happening quietly", "Not in our lifetime publicly", "Online spaces are the conversation", "When someone powerful enough says it first"] },
  { category: "Arts & Expression", question: "Dubai Art Week generates $50M+ in sales. 90% of the buyers are expats or tourists. Is this the region's art scene or a duty-free gallery?", options: ["Duty-free gallery is accurate", "At least the money flows", "Local collectors are growing", "The art scene exists outside Art Week"] },
  { category: "Arts & Expression", question: "A Saudi filmmaker can now make a movie. But can she make a movie about anything she actually wants?", options: ["Progress with a leash", "Any progress is still progress", "The best art finds a way around limits", "Freedom and funding rarely coexist anywhere"] },
  { category: "Arts & Expression", question: "Arab musicians used to define global genres. Fairuz, Umm Kulthum, Abdel Halim. Now our biggest export is DJ sets at beach clubs. What happened?", options: ["Commercialization killed depth", "New talent exists, discovery is broken", "You're romanticizing the past", "Streaming changed everything not just for us"] },
  { category: "Arts & Expression", question: "Photography in Palestine and Lebanon is documenting history in real time. The world calls it content.", options: ["It's journalism, art, and resistance", "The world doesn't deserve this art", "Documentation is the highest form of expression", "Calling it content is violence"] },
  { category: "Arts & Expression", question: "The first time most Arabs see queer representation is in Western media. Zero from our own storytellers. Because the stories don't exist or we're not allowed to tell them?", options: ["The stories exist, the permission doesn't", "Western media doesn't represent us either", "Underground queer Arab art exists, find it", "Both censorship and shame are the problem"] },
  { category: "Arts & Expression", question: "Art Basel, Alserkal, Sharjah Biennial. The infrastructure is world-class. The creative freedom is not. Can you have a real art scene without real freedom?", options: ["No, freedom is the foundation", "You can, it just looks different", "Constraint breeds creativity", "The infrastructure is the first step"] },
  { category: "Arts & Expression", question: "Belly dance originated in the Arab world. Now the region is embarrassed by it. Meanwhile the West teaches it in gyms. Who owns culture when you abandon it?", options: ["We abandoned it and lost the right to complain", "It was always more than what the West made it", "The region didn't abandon it, it just went private", "Cultural ownership is a losing argument"] },
  { category: "Arts & Expression", question: "There are more Arab creatives in Berlin, London, and Brooklyn than in any MENA city. Is that a brain drain or an escape route?", options: ["Escape route from censorship", "Brain drain plain and simple", "Diaspora art IS Arab art", "Some went for freedom, some for funding"] },
  { category: "Arts & Expression", question: "The region will build a $1B museum before it builds a single public library in every city. Priorities?", options: ["Museums are for tourists, libraries are for citizens", "Both matter", "Libraries are online now", "This is painfully accurate"] },
  { category: "Arts & Expression", question: "Drag culture has existed in Arab communities for centuries. Now we act like it was invented in Brooklyn. Know your own history.", options: ["Most Arabs don't know this history", "It was erased deliberately", "Knowing the history doesn't change the present", "This needs to be taught not just tweeted"] },
  { category: "Arts & Expression", question: "If an Arab artist makes something beautiful about queer love, mental health, or religious doubt, should the region celebrate it or is it betrayal?", options: ["Celebrate, art should be free", "It depends on how it's done", "The region will call it betrayal", "The bravest art always feels like betrayal first"] },
];

async function addMissingPolls() {
  console.log("Fetching existing polls...");
  const existing = await db.select({ question: pollsTable.question }).from(pollsTable);
  const existingNorm = new Set(existing.map(p => normalize(p.question)));

  const missing = DOC_POLLS.filter(p => !existingNorm.has(normalize(p.question)));
  console.log(`Found ${existing.length} existing polls. ${missing.length} new polls to add.`);

  if (missing.length === 0) {
    console.log("Nothing to add. All polls already exist.");
    process.exit(0);
  }

  let added = 0;
  for (const poll of missing) {
    const baseVotes = Math.floor(Math.random() * 1800) + 200;
    const weights = poll.options.map(() => Math.random());
    const total = weights.reduce((s, w) => s + w, 0);
    const counts = weights.map(w => Math.round((w / total) * baseVotes));

    const [inserted] = await db.insert(pollsTable).values({
      question: poll.question,
      category: poll.category,
      categorySlug: toSlug(poll.category),
      tags: [],
      isFeatured: false,
      isEditorsPick: false,
    }).returning({ id: pollsTable.id });

    const optRows = poll.options.map((text, i) => ({
      pollId: inserted.id,
      text,
      voteCount: counts[i],
      displayOrder: i,
    }));
    await db.insert(pollOptionsTable).values(optRows);
    added++;
    if (added % 10 === 0) process.stdout.write(`  Added ${added}/${missing.length}...\n`);
  }

  console.log(`\nDone. Added ${added} new polls.`);
  process.exit(0);
}

addMissingPolls().catch(e => { console.error(e); process.exit(1); });
