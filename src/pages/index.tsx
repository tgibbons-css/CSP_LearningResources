import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ResourceCard from '../components/ResourceCard';
import {units} from '../data/units';

export default function Home() {
  return <Layout title="Course home" description="Interactive learning resources for CIS 1001: Computer Science Principles.">
    <header className="course-hero">
      <div className="container hero-content">
        <p className="eyebrow">CIS 1001 · Learning resources</p>
        <h1>Computer Science<br />Principles</h1>
        <p className="hero-description">Explore ideas. Try them out. Build your understanding of computing, one activity at a time.</p>
        <Link className="button button--primary button--lg" to="/docs/unit-1/">Explore Unit 1 <span aria-hidden="true">→</span></Link>
        <p className="hero-caption">College-level introduction · No prior programming experience required</p>
      </div>
    </header>
    <main className="container course-main">
      <section aria-labelledby="course-units">
        <div className="section-heading"><div><p className="eyebrow">Your learning path</p><h2 id="course-units">Explore the units</h2></div>
          <p>Eight spaces to read, experiment, and practice.</p></div>
        <p className="framework-note">This resource collection is under development. Lesson content is being developed; Unit 1 includes a working demonstration.</p>
        <div className="resource-grid">{units.map((unit) => <ResourceCard key={unit.number}
          title={unit.title} href={unit.href} label={`Unit ${String(unit.number).padStart(2, '0')}`}>
          <p>{unit.description}</p><span className="card-meta">{unit.number === 1 ? 'Demo activity available' : 'Content coming soon'}</span>
        </ResourceCard>)}</div>
      </section>
      <section className="study-guide" aria-labelledby="study-heading">
        <div><p className="eyebrow">Make it your own</p><h2 id="study-heading">A place to learn by doing</h2></div>
        <p>Begin with a unit’s learning objectives, explore the readings, then test your understanding with activities and self-checks. Practice responses stay in your browser session and are not graded or submitted.</p>
      </section>
    </main>
  </Layout>;
}
