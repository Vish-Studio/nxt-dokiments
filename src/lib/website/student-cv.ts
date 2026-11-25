import { writeCvList } from "@/lib/market-place/cv-lists";

/**
 * A believable first CV for the homepage's student section: a final-year
 * student with an internship, a part-time job, projects and volunteering
 * instead of years of experience. Same field keys as the CV template
 * (`documents.ts`), so it renders in every CV style.
 */
export const studentCvValues: Record<string, string> = {
  about:
    "Final-year computer science student who enjoys turning messy problems into simple tools. Looking for a graduate role in product or software where I can keep learning fast.",
  additional: writeCvList([
    {
      description:
        "Built a bus-times app with three classmates in 48 hours; placed second out of 30 teams.",
      period: "2025",
      subtitle: "University Hackathon",
      title: "Team lead, Moov app",
    },
    {
      description: "Tutor secondary students in maths every Saturday.",
      period: "2023 - Present",
      subtitle: "Youth Learning Club",
      title: "Volunteer tutor",
    },
  ]),
  additionalTitle: "Projects & volunteering",
  certificates: writeCvList([
    { issuer: "Google", name: "UX Design Certificate", year: "2025" },
  ]),
  education: writeCvList([
    {
      institution: "University of Mauritius",
      period: "2023 - 2026",
      title: "BSc Computer Science (expected First Class)",
    },
    {
      institution: "Royal College Curepipe",
      period: "2016 - 2022",
      title: "Higher School Certificate, Science",
    },
  ]),
  email: "priya.ramdin@student.uom.mu",
  experience: writeCvList([
    {
      company: "Ceridian Mauritius",
      description:
        "Wrote automated tests for the payroll web app and fixed 25 front-end bugs in 10 weeks.",
      period: "Summer 2025",
      title: "Software Engineering Intern",
    },
    {
      company: "Bagatelle Mall",
      description:
        "Handled customers and the till on weekends while studying full time.",
      period: "2023 - 2024",
      title: "Part-time Sales Assistant",
    },
  ]),
  fullName: "Priya Ramdin",
  jobTitle: "Computer Science Student",
  languages: writeCvList([
    { level: "100", name: "English" },
    { level: "95", name: "French" },
    { level: "100", name: "Creole" },
  ]),
  location: "Curepipe, Mauritius",
  phone: "+230 5 812 3456",
  skills: writeCvList([
    { level: "85", name: "Python" },
    { level: "80", name: "JavaScript" },
    { level: "75", name: "Figma" },
    { level: "70", name: "Public speaking" },
  ]),
  website: "github.com/priyaramdin",
};
