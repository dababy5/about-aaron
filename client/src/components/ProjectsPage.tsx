import { useState, useEffect, useRef } from 'react';
import './ProjectsPage.css';
import Sidebar from './Sidebar';
import { ExternalLink, Github, ChevronDown, ChevronUp, Terminal, Cpu, Database, Globe, Zap, Trophy, Bot, Server } from 'lucide-react';

interface ProjectStat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface Project {
  id: string;
  title: string;
  tagline: string;
  date: string;
  accent: string;
  accentRgb: string;
  badge: string;
  badgeLabel: string;
  link?: string;
  github?: string;
  stats: ProjectStat[];
  techStack: { name: string; category: 'language' | 'framework' | 'infra' | 'ml' }[];
  overview: string;
  details: string[];
  architecture: string[];
}

const projects: Project[] = [
  {
    id: 'rotted',
    title: "ROTTED",
    tagline: "Vector Search LLM Processing",
    date: "February 2026",
    accent: '#f5a623',
    accentRgb: '245, 166, 35',
    badge: "HACKATHON WINNER",
    badgeLabel: "1st Place",
    stats: [
      { label: 'Throughput Gain', value: '32x', icon: <Zap size={16} /> },
      { label: 'Max Upload', value: '50GB', icon: <Database size={16} /> },
      { label: 'Vector Bits', value: '384', icon: <Cpu size={16} /> },
      { label: 'Batch Size', value: '64', icon: <Server size={16} /> },
    ],
    techStack: [
      { name: 'Rust', category: 'language' },
      { name: 'Python', category: 'language' },
      { name: 'Rayon', category: 'framework' },
      { name: 'RTX 4090', category: 'infra' },
      { name: 'Sentence Transformers', category: 'ml' },
      { name: 'Hamming Distance', category: 'ml' },
    ],
    overview: "A semantic search platform that quantizes sentence embeddings into compact bitvectors for blazing-fast similarity retrieval over massive document datasets.",
    details: [
      "Architected a semantic search platform processing large-scale document datasets by quantizing sentence embeddings to 384-bit vectors, enabling memory-efficient storage and high-throughput similarity retrieval for multi-GB inputs.",
      "Engineered a Rust bitvector search engine using Rayon parallelism with batch size 64 and XOR Hamming-distance matching, significantly accelerating approximate similarity search while reducing embedding memory footprint.",
      "Benchmarked embedding pipeline across RTX 4090 GPU, achieving up to 32x throughput improvement over CPU baselines.",
    ],
    architecture: ['Document Ingestion', 'Embedding Quantization', 'Bitvector Index', 'Parallel XOR Search', 'Ranked Results'],
  },
  {
    id: 'portfolio',
    title: "AI Interactive Portfolio",
    tagline: "LLM-Powered Personal Platform",
    date: "March 2026",
    accent: '#5CC8FF',
    accentRgb: '92, 200, 255',
    badge: "LIVE",
    badgeLabel: "Production",
    link: "https://aaron-portfolio.work",
    stats: [
      { label: 'Inference', value: '~1s', icon: <Zap size={16} /> },
      { label: 'Training Data', value: '100k+', icon: <Database size={16} /> },
      { label: 'Callbacks/mo', value: '3-4', icon: <Globe size={16} /> },
      { label: 'Model', value: 'Qwen', icon: <Bot size={16} /> },
    ],
    techStack: [
      { name: 'React', category: 'framework' },
      { name: 'Three.js', category: 'framework' },
      { name: 'Spring Boot', category: 'framework' },
      { name: 'Docker', category: 'infra' },
      { name: 'AWS Lightsail', category: 'infra' },
      { name: 'Nginx', category: 'infra' },
      { name: 'Qwen LLM', category: 'ml' },
      { name: 'LoRA', category: 'ml' },
      { name: 'Python', category: 'language' },
      { name: 'TypeScript', category: 'language' },
    ],
    overview: "A recruiter-facing portfolio with a fine-tuned LLM chatbot, 3D interactive scenes, and a gamified About page — containerized and deployed on AWS.",
    details: [
      "Fine-tuned a Qwen LLM using LoRA on 100k+ tokens through a custom Python ML training pipeline, achieving 1-2s inference latency for an interactive AI-powered portfolio assistant.",
      "Built a retrieval-augmented inference pipeline using vector database indexing embeddings over 100k+ tokens of portfolio knowledge, enabling the model to dynamically retrieve project context during generation.",
      "Containerized cloud deployment implemented using Docker with an Nginx reverse proxy and automated SSL provisioning for Let's Encrypt on AWS Lightsail for secure HTTPS hosting.",
      "3-4 recruiter interview callbacks/month observed after launching the AI-powered portfolio platform.",
    ],
    architecture: ['React Frontend', 'Spring Boot API', 'Qwen LLM + LoRA', 'Vector DB (RAG)', 'Docker + Nginx', 'AWS Lightsail'],
  },
];

const categoryColors: Record<string, string> = {
  language: '#e06c75',
  framework: '#61afef',
  infra: '#98c379',
  ml: '#c678dd',
};

const categoryLabels: Record<string, string> = {
  language: 'Lang',
  framework: 'Framework',
  infra: 'Infra',
  ml: 'ML/AI',
};

function AnimatedStat({ stat, accent, delay }: { stat: ProjectStat; accent: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`stat-cell ${visible ? 'stat-visible' : ''}`}
      style={{ '--stat-delay': `${delay * 100}ms`, '--accent': accent } as React.CSSProperties}
    >
      <div className="stat-icon" style={{ color: accent }}>{stat.icon}</div>
      <div className="stat-value">{stat.value}</div>
      <div className="stat-label">{stat.label}</div>
    </div>
  );
}

function ArchitecturePipeline({ steps, accent }: { steps: string[]; accent: string }) {
  return (
    <div className="architecture-pipeline">
      {steps.map((step, i) => (
        <div key={i} className="pipeline-step">
          <div className="pipeline-node" style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}40` }}>
            <Terminal size={12} />
            <span>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="pipeline-connector" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bento-card bento-card-${index === 0 ? 'featured' : 'standard'}`}
      style={{ '--accent': project.accent, '--accent-rgb': project.accentRgb } as React.CSSProperties}
    >
      {/* Top bar */}
      <div className="card-topbar">
        <div className="card-badge" style={{ background: project.accent }}>
          <Trophy size={10} />
          {project.badge}
        </div>
        <span className="card-date">{project.date}</span>
      </div>

      {/* Title area */}
      <div className="card-title-area">
        <h2 className="card-title">{project.title}</h2>
        <p className="card-tagline">{project.tagline}</p>
      </div>

      {/* Overview */}
      <p className="card-overview">{project.overview}</p>

      {/* Stats grid */}
      <div className="stats-grid">
        {project.stats.map((stat, i) => (
          <AnimatedStat key={i} stat={stat} accent={project.accent} delay={i} />
        ))}
      </div>

      {/* Tech stack */}
      <div className="tech-stack-section">
        <div className="tech-stack-header">
          <Cpu size={14} />
          <span>Tech Stack</span>
        </div>
        <div className="tech-pills">
          {project.techStack.map((tech, i) => (
            <span
              key={i}
              className="tech-pill"
              style={{ '--pill-color': categoryColors[tech.category] } as React.CSSProperties}
              title={categoryLabels[tech.category]}
            >
              <span className="pill-dot" />
              {tech.name}
            </span>
          ))}
        </div>
      </div>

      {/* Architecture pipeline */}
      <div className="architecture-section">
        <div className="architecture-header">
          <Server size={14} />
          <span>Architecture</span>
        </div>
        <ArchitecturePipeline steps={project.architecture} accent={project.accent} />
      </div>

      {/* Expandable details */}
      <button className="expand-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? 'Collapse' : 'Deep Dive'}
      </button>

      {expanded && (
        <div className="card-details">
          <ul>
            {project.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      {(project.link || project.github) && (
        <div className="card-links">
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="card-link" style={{ borderColor: project.accent, color: project.accent }}>
              <ExternalLink size={14} />
              Live Site
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="card-link card-link-secondary">
              <Github size={14} />
              Source
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <Sidebar />
      <div className="projects-page">
        {/* Animated background grid */}
        <div className="projects-bg-grid" />

        <div className="projects-container">
          {/* Header */}
          <div className="projects-hero">
            <div className="hero-terminal">
              <div className="terminal-dots">
                <span /><span /><span />
              </div>
              <code className="terminal-text">
                <span className="t-prompt">$</span> ls ./projects <span className="t-cursor">_</span>
              </code>
            </div>
            <h1 className="projects-title-main">
              What I've Been <span className="title-accent">Cooking</span>
            </h1>
            <p className="projects-subtitle-main">
              From winning hackathons with Rust-powered search engines to fine-tuning
              LLMs that talk like me — here's what keeps me up at night.
            </p>

            {/* Legend */}
            <div className="tech-legend">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <span key={key} className="legend-item">
                  <span className="legend-dot" style={{ background: categoryColors[key] }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Grid */}
          <div className="bento-grid">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
