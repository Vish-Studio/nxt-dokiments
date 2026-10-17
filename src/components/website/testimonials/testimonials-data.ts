export interface TestimonialContent {
  /** Background token for the avatar and featured panel, e.g. `bg-play-teal`. */
  accent: string;
  id: string;
  name: string;
  quote: string;
  role: string;
}

export const testimonials: TestimonialContent[] = [
  {
    accent: "bg-golden-harvest",
    id: "maya-chen",
    name: "Maya Chen",
    quote:
      "The workspace makes repeat document work feel far less scattered. I can return to the right template and get a polished draft moving quickly.",
    role: "Independent consultant",
  },
  {
    accent: "bg-play-teal",
    id: "omar-williams",
    name: "Omar Williams",
    quote:
      "What stands out is the focus: find the template, save it, and turn it into a document without bouncing between tools.",
    role: "Operations lead",
  },
  {
    accent: "bg-play-pink",
    id: "priya-nair",
    name: "Priya Nair",
    quote:
      "It gives our small team a more considered starting point for the business documents we create again and again.",
    role: "Studio founder",
  },
  {
    accent: "bg-play-purple",
    id: "elijah-brooks",
    name: "Elijah Brooks",
    quote:
      "I spend less time rebuilding familiar documents and more time tailoring the details that actually matter for the client.",
    role: "Creative director",
  },
  {
    accent: "bg-play-blue",
    id: "ana-martins",
    name: "Ana Martins",
    quote:
      "The templates give me confidence that a quotation or contract starts clean, clear, and ready for a professional conversation.",
    role: "Freelance producer",
  },
  {
    accent: "bg-golden-harvest",
    id: "marcus-reed",
    name: "Marcus Reed",
    quote:
      "It is a straightforward system for keeping the paperwork behind the business as organized as the work itself.",
    role: "Small business owner",
  },
  {
    accent: "bg-play-teal",
    id: "sofia-alvarez",
    name: "Sofia Alvarez",
    quote:
      "The focused workflow makes it easy to go from a solid template to a document that feels genuinely ours.",
    role: "Partnerships manager",
  },
];
