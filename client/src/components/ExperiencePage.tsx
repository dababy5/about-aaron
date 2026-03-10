import './ExperiencePage.css';
import { Calendar, MapPin, Code, ChevronRight, Briefcase, Zap } from 'lucide-react';
import Sidebar from './Sidebar';

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  type: string;
  description: string;
  highlights: string[];
  technologies: string[];
}

const experiences: Experience[] = [
  {
    title: "Software Engineering Intern",
    company: "Fusion Technology LLC",
    location: "Bridgeport, WV",
    period: "Jan 2026 – Present",
    type: "Internship",
    description: "Architecting full-stack e-commerce solutions and optimizing backend systems across the entire Software Development Lifecycle.",
    highlights: [
      "Across 50+ commits, engineered and delivered a full-stack e-commerce platform (Spring Boot, React, MySQL) across the Software Development Lifecycle (SDLC), improving code scalability and maintainability through structured Bitbucket branching and code reviews",
      "35% reduction in average response latency while maintaining sub-200ms response times by engineering 10+ RESTful API endpoints and implementing Redis caching (cache-aside) with TTL + cache keying, reducing repeat DB reads and improving throughput under concurrent workloads",
      "Reduced average query execution time from 180ms to 95ms by optimizing MySQL schema through indexing, query tuning, and data access pattern optimization for high-throughput transactional workloads",
      "Reduced runtime API errors by 60% by implementing backend validation and centralized exception handling, while achieving 85% test coverage across critical business logic through 40+ automated integration and service-layer tests, improving system reliability and fault tolerance"
    ],
    technologies: ["Spring Boot", "React", "MySQL", "Redis", "REST APIs", "Bitbucket", "Integration Testing"]
  },
  {
    title: "Software Tester / Software Development",
    company: "Amazon",
    location: "Arlington, VA",
    period: "Oct 2024 – Present",
    type: "Full-time",
    description: "Building ML-powered automation tools and maintaining cloud infrastructure while shipping internal developer tools that save engineering hours.",
    highlights: [
      "Developed a TensorFlow-based ML model with CUDA-accelerated GPU training to automate defect analysis, reducing manual triage time by 10 minutes per defect and improving overall test pipeline efficiency",
      "Maintained 90% reliability on AWS Device Farm cloud infrastructure by diagnosing host-device connectivity failures and fixing networking problems",
      "Achieved a 92% facial recognition offline LoRa-based emergency system during an internal hackathon using ESP32-CAM, Django REST APIs, and InsightFace, with 5km transmission range. Won 3rd place",
      "Engineered a TamperMonkey script integrating TestRail with Bedrock API to generate daily EOD reports, saving 4+ engineering hours per week and identifying 10–15% duplicate cases across 1,000+ tests"
    ],
    technologies: ["Python", "TensorFlow", "CUDA", "AWS Device Farm", "Django", "ESP32", "TestRail", "Bedrock API"]
  }
];

function ExperienceCard({ experience, index }: { experience: Experience; index: number }) {
  return (
    <div className={`experience-card ${index === 0 ? 'featured' : ''}`}>
      <div className="experience-header">
        <div className="experience-icon">
          <Briefcase size={24} strokeWidth={1.5} />
        </div>
        <div className="experience-title-section">
          <h2 className="experience-title">{experience.title}</h2>
          <h3 className="experience-company">{experience.company}</h3>
        </div>
        <span className="experience-type">{experience.type}</span>
      </div>

      <div className="experience-meta">
        <span className="meta-item">
          <Calendar size={14} strokeWidth={1.5} />
          {experience.period}
        </span>
        <span className="meta-item">
          <MapPin size={14} strokeWidth={1.5} />
          {experience.location}
        </span>
      </div>

      <p className="experience-description">{experience.description}</p>

      <div className="experience-highlights">
        <h4>
          <Zap size={16} strokeWidth={1.5} />
          Key Contributions
        </h4>
        <ul>
          {experience.highlights.map((highlight, i) => (
            <li key={i}>
              <ChevronRight size={14} strokeWidth={2} />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="experience-tech">
        <h4>
          <Code size={16} strokeWidth={1.5} />
          Technologies
        </h4>
        <div className="tech-tags">
          {experience.technologies.map((tech, i) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function ExperiencePage() {
  return (
    <>
      <Sidebar />
      <div className="experience-page">
        <div className="experience-container">
          <div className="experience-intro">
            <div className="exp-terminal">
              <div className="exp-terminal-dots">
                <span /><span /><span />
              </div>
              <code className="exp-terminal-text">
                <span className="exp-t-prompt">~</span> cat ./experience.log <span className="exp-t-cursor">_</span>
              </code>
            </div>
            <h1>Experience</h1>
            <p className="intro-subtitle">
              From building ML-powered automation tools at Amazon to architecting full-stack platforms. My journey of <span className="highlight">shipping code that matters</span>.
            </p>
          </div>

          <div className="timeline">
            {experiences.map((exp, index) => (
              <ExperienceCard key={index} experience={exp} index={index} />
            ))}
          </div>

          <div className="experience-note">
            <p>
              <strong>The Pattern:</strong> Whether it's building ML models to auto-label defects, optimizing database queries,
              or hacking together emergency systems at hackathons — I thrive on solving real problems with code.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
