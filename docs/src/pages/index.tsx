import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <Link
          className={clsx('button button--secondary button--lg', styles.ctaButton)}
          to="/remove-comments-cli/getting-started"
        >
          Get Started →
        </Link>
      </div>
    </header>
  );
}

const FEATURES = [
  {
    icon: '1️⃣',
    title: 'Easy to Use',
    description: 'Simple command-line interface MOOO that works with any codebase. Just point it to your files and run.',
  },
  {
    icon: '2️⃣',
    title: 'Preserve Important Comments',
    description: 'Keep critical documentation with protected comments while removing unnecessary ones.',
  },
  {
    icon: '3️⃣',
    title: 'Highly Configurable',
    description: 'Multiple options to control output location, processing mode, and comment preservation.',
  },
];

function HomepageFeatures() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={clsx('row', styles.featuresRow)}>
          {FEATURES.map(({ icon, title, description }, idx) => (
            <div key={idx} className="col col--4">
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>{icon}</div>
                <Heading as="h3" className={styles.featureTitle}>
                  {title}
                </Heading>
                <p className={styles.featureDescription}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Remove comments from your code with a simple, powerful CLI"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
