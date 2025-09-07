export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  title: string;   // role or function (Student, Recruiter, etc.)
  avatar: string;  // image path or URL
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote: "Lansa helped me turn my internship tasks into a real portfolio.",
    name: "Amaya Torres",
    title: "Student • Hospitality",
    avatar: "/lovable-uploads/155ecc34-3f01-4d49-b1ad-10c1a50803e2.png"
  },
  {
    id: "t2",
    quote: "We filled two junior roles faster with clearer candidate profiles.",
    name: "R. Pieters",
    title: "Recruiter",
    avatar: "/lovable-uploads/91347dc5-2857-4d8f-9a0e-f7f93f5a739b.png"
  },
  {
    id: "t3",
    quote: "I finally sound like what I can actually do. Clients noticed.",
    name: "Keon Martis",
    title: "Freelancer • Web",
    avatar: "/lovable-uploads/62496478-1e20-484c-bb96-6f47496037df.png"
  },
  {
    id: "t4",
    quote: "Onboarding grads is easier when their skills are visible.",
    name: "Dinaida G.",
    title: "Office Manager",
    avatar: "/lovable-uploads/1c3395f0-854c-4830-b97a-46a12aec1d25.png"
  },
  {
    id: "t5",
    quote: "Clearer profiles, better hires. That's the impact I want.",
    name: "J. Richardson",
    title: "Entrepreneur",
    avatar: "/lovable-uploads/2bc2aac1-3d99-47c5-a884-0800b05c0f76.png"
  },
  {
    id: "t6",
    quote: "My resume now tells my story—not just my duties.",
    name: "L. Gomes",
    title: "Visionary • Marketing",
    avatar: "/lovable-uploads/155ecc34-3f01-4d49-b1ad-10c1a50803e2.png"
  },
  {
    id: "t7",
    quote: "We found a student who matched our culture and goals.",
    name: "S. Alvarez",
    title: "Business Owner",
    avatar: "/lovable-uploads/91347dc5-2857-4d8f-9a0e-f7f93f5a739b.png"
  },
  {
    id: "t8",
    quote: "My first interview felt different—I knew how to speak value.",
    name: "M. van Dijk",
    title: "Student • IT",
    avatar: "/lovable-uploads/62496478-1e20-484c-bb96-6f47496037df.png"
  }
];