import { useState, useEffect, useRef } from 'react';
import './SkillsPage.css';
import Sidebar from './Sidebar';

interface Skill {
  name: string;
  level: number; // 0-100
}

interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  colorRgb: string;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Languages & AI Tools',
    icon: '{ }',
    color: '#e06c75',
    colorRgb: '224, 108, 117',
    skills: [
      { name: 'Java', level: 92 },
      { name: 'Python', level: 90 },
      { name: 'C/C++', level: 75 },
      { name: 'SQL', level: 85 },
      { name: 'JavaScript', level: 88 },
      { name: 'TypeScript', level: 82 },
      { name: 'Rust', level: 65 },
      { name: 'HTML/CSS', level: 90 },
    ],
  },
  {
    id: 'frameworks',
    title: 'Frameworks & Tools',
    icon: '>>',
    color: '#61afef',
    colorRgb: '97, 175, 239',
    skills: [
      { name: 'Spring Boot', level: 90 },
      { name: 'React', level: 88 },
      { name: 'Node.js', level: 78 },
      { name: 'Three.js', level: 70 },
      { name: 'JUnit', level: 85 },
      { name: 'Docker', level: 82 },
      { name: 'Git', level: 90 },
      { name: 'CI/CD', level: 75 },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & Systems',
    icon: '~~',
    color: '#98c379',
    colorRgb: '152, 195, 121',
    skills: [
      { name: 'REST APIs', level: 92 },
      { name: 'Distributed Systems', level: 72 },
      { name: 'Concurrency', level: 70 },
      { name: 'Load Balancing', level: 68 },
      { name: 'DSA', level: 85 },
      { name: 'Redis', level: 72 },
      { name: 'AWS', level: 78 },
      { name: 'Nginx', level: 70 },
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    icon: '[]',
    color: '#d19a66',
    colorRgb: '209, 154, 102',
    skills: [
      { name: 'MySQL', level: 88 },
      { name: 'Query Optimization', level: 82 },
      { name: 'Indexing', level: 80 },
      { name: 'Data Modeling', level: 78 },
    ],
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    icon: '**',
    color: '#c678dd',
    colorRgb: '198, 120, 221',
    skills: [
      { name: 'Deep Learning', level: 78 },
      { name: 'Fine-Tuning (LoRA)', level: 82 },
      { name: 'RAG Pipelines', level: 80 },
      { name: 'TensorFlow', level: 75 },
      { name: 'PyTorch', level: 72 },
      { name: 'CUDA', level: 65 },
      { name: 'Inference Optimization', level: 76 },
    ],
  },
];

function SkillBar({ skill, color, colorRgb, delay, visible }: {
  skill: Skill;
  color: string;
  colorRgb: string;
  delay: number;
  visible: boolean;
}) {
  return (
    <div
      className={`skill-row ${visible ? 'skill-visible' : ''}`}
      style={{ '--bar-delay': `${delay * 60}ms` } as React.CSSProperties}
    >
      <div className="skill-info">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-pct" style={{ color }}>{skill.level}%</span>
      </div>
      <div className="skill-track">
        <div
          className="skill-fill"
          style={{
            width: visible ? `${skill.level}%` : '0%',
            background: `linear-gradient(90deg, ${color}, rgba(${colorRgb}, 0.5))`,
            boxShadow: visible ? `0 0 12px rgba(${colorRgb}, 0.3)` : 'none',
            transitionDelay: `${delay * 60 + 200}ms`,
          }}
        />
      </div>
    </div>
  );
}

function CategoryCard({ category, index }: { category: SkillCategory; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`skills-category-card ${visible ? 'card-visible' : ''}`}
      style={{
        '--cat-color': category.color,
        '--cat-rgb': category.colorRgb,
        '--card-delay': `${index * 100}ms`,
      } as React.CSSProperties}
    >
      <div className="category-header">
        <span className="category-icon" style={{ color: category.color }}>{category.icon}</span>
        <h2 className="category-title">{category.title}</h2>
        <span className="category-count">{category.skills.length}</span>
      </div>
      <div className="skills-bars">
        {category.skills.map((skill, i) => (
          <SkillBar
            key={skill.name}
            skill={skill}
            color={category.color}
            colorRgb={category.colorRgb}
            delay={i}
            visible={visible}
          />
        ))}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [totalSkills] = useState(
    skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0)
  );

  return (
    <>
      <Sidebar />
      <div className="skills-page">
        <div className="skills-bg-dots" />

        <div className="skills-container">
          {/* Header */}
          <div className="skills-hero">
            <div className="skills-terminal-tag">
              <span className="tag-bracket">&lt;</span>
              <span className="tag-name">skills</span>
              <span className="tag-attr"> count</span>
              <span className="tag-eq">=</span>
              <span className="tag-val">"{totalSkills}"</span>
              <span className="tag-bracket"> /&gt;</span>
            </div>
            <h1 className="skills-title">
              My Toolkit
            </h1>
            <p className="skills-subtitle">
              {skillCategories.length} domains, {totalSkills} technologies — from low-level
              systems programming to training neural nets.
            </p>
            <p className="skills-genai-note">
              I use AI-assisted coding daily — but I understand every line it writes.
              GenAI is a force multiplier, not a crutch. I debug it, refactor it, and
              know exactly why the code works.
            </p>
          </div>

          {/* Category grid */}
          <div className="skills-grid">
            {skillCategories.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} />
            ))}
          </div>

          {/* Bottom note */}
          <div className="skills-footer">
            <div className="footer-tools">
              <span className="footer-label">Daily drivers:</span>
              <span className="footer-tool">GitHub Copilot</span>
              <span className="footer-divider">/</span>
              <span className="footer-tool">Claude</span>
              <span className="footer-divider">/</span>
              <span className="footer-tool">VS Code</span>
              <span className="footer-divider">/</span>
              <span className="footer-tool">IntelliJ</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
