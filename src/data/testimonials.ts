export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  title: string;   // role or function (Student, Recruiter, etc.)
  avatar: string;  // image path or URL
  stars: number;   // rating out of 5
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote: "I was just another hospitality intern filing papers and cleaning tables. Then Lansa helped me realize I was actually developing customer service excellence and crisis management skills. My first job interview completely changed when I could articulate real value.",
    name: "Amaya Torres",
    title: "Student • Hospitality",
    avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t2",
    quote: "Tired of sifting through generic resumes that all looked the same. Lansa candidates had clarity about their actual capabilities and growth trajectory. We filled two junior roles in half the time because we could see who they really were.",
    name: "Rachel Pieters",
    title: "Senior Recruiter",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t3",
    quote: "My freelance portfolio was a mess of random projects. Lansa helped me see the strategic thinking behind every website I built. Now clients understand they're hiring a problem-solver, not just a code writer. My rates doubled.",
    name: "Keon Martis",
    title: "Freelancer • Web Development",
    avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t4",
    quote: "New graduates used to take months to understand their role here. With Lansa profiles, I can see their learning agility and communication style upfront. Onboarding went from painful to productive almost overnight.",
    name: "Dinaida Grant",
    title: "Office Manager",
    avatar: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80",
    stars: 4
  },
  {
    id: "t5",
    quote: "Every startup founder knows hiring is make-or-break. Lansa doesn't just give me resumes—it gives me insights into how candidates think and grow. I can spot the hidden gems who'll scale with my company.",
    name: "Jordan Richardson",
    title: "Tech Entrepreneur",
    avatar: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t6",
    quote: "I was describing myself as 'detail-oriented' and 'hardworking' like everyone else. Lansa helped me uncover my actual superpower: transforming complex data into compelling narratives. My marketing career finally took off.",
    name: "Luna Gomes",
    title: "Marketing Strategist",
    avatar: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t7",
    quote: "Running a small business means every hire matters. Lansa helped me find a student who didn't just fit the job description—they fit our culture and vision. That alignment is everything in a team of twelve.",
    name: "Sofia Alvarez",
    title: "Business Owner",
    avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80",
    stars: 4
  },
  {
    id: "t8",
    quote: "My first technical interview was a disaster—I just listed programming languages. After Lansa, I walked into my second interview explaining how I solve problems and learn new systems. They offered me the position that day.",
    name: "Marco van Dijk",
    title: "Junior Developer",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t9",
    quote: "Three years of retail taught me more than any business course. Lansa helped me see that managing difficult customers and training new staff were actually leadership and conflict resolution skills. MBA programs started reaching out.",
    name: "Aria Chen",
    title: "Student • Business",
    avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t10",
    quote: "Creative roles are subjective, but talent isn't random. Lansa profiles help me identify designers who think systematically and communicate their process clearly. Those are the ones who thrive in client relationships.",
    name: "David Kim",
    title: "Creative Director",
    avatar: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80",
    stars: 4
  },
  {
    id: "t11",
    quote: "Volunteering at the animal shelter felt irrelevant to my finance goals. Lansa showed me I was developing project management, crisis response, and stakeholder communication skills. Investment firms saw potential I couldn't see myself.",
    name: "Emma Rodriguez",
    title: "Finance Student",
    avatar: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t12",
    quote: "Scaling our agency means finding talent that grows with complexity. Lansa candidates demonstrate self-awareness and learning agility from day one. They become senior contributors faster than traditional hires.",
    name: "Michael Torres",
    title: "Agency Owner",
    avatar: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t13",
    quote: "My nursing degree felt like checking boxes until Lansa helped me articulate the critical thinking and emotional intelligence I develop daily. Healthcare administrators finally saw leadership potential, not just clinical skills.",
    name: "Sarah Johnson",
    title: "Nursing Student",
    avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80",
    stars: 4
  },
  {
    id: "t14",
    quote: "Remote work means hiring for capability and character, not just credentials. Lansa profiles reveal how candidates approach challenges and communicate progress. That transparency is crucial for distributed teams.",
    name: "Alex Chen",
    title: "Remote Team Lead",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    stars: 5
  },
  {
    id: "t15",
    quote: "Engineering bootcamp taught me to code, but Lansa taught me to think like an engineer. I learned to frame problems systematically and communicate technical concepts clearly. Senior developers started mentoring me seriously.",
    name: "Tyler Brooks",
    title: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
    stars: 5
  }
];