import mongoose from 'mongoose';
import { connectDB } from '../db/connect';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const DEMO_PASSWORD = 'Password123!';

const entrepreneurs = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@techwave.io',
    role: 'entrepreneur' as const,
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    bio: 'Serial entrepreneur with 10+ years of experience in SaaS and fintech.',
    startupName: 'TechWave AI',
    pitchSummary: 'AI-powered financial analytics platform helping SMBs make data-driven decisions.',
    fundingNeeded: '$1.5M',
    industry: 'FinTech',
    location: 'San Francisco, CA',
    foundedYear: 2021,
    teamSize: 12,
    isOnline: true,
  },
  {
    name: 'David Chen',
    email: 'david@greenlife.co',
    role: 'entrepreneur' as const,
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    bio: 'Environmental scientist turned entrepreneur. Passionate about sustainable solutions.',
    startupName: 'GreenLife Solutions',
    pitchSummary: 'Biodegradable packaging alternatives for consumer goods and food industry.',
    fundingNeeded: '$2M',
    industry: 'CleanTech',
    location: 'Portland, OR',
    foundedYear: 2020,
    teamSize: 8,
    isOnline: false,
  },
  {
    name: 'Maya Patel',
    email: 'maya@healthpulse.com',
    role: 'entrepreneur' as const,
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    bio: 'Former healthcare professional with an MBA. Building tech to improve patient care.',
    startupName: 'HealthPulse',
    pitchSummary: 'Mobile platform connecting patients with mental health professionals in real-time.',
    fundingNeeded: '$800K',
    industry: 'HealthTech',
    location: 'Boston, MA',
    foundedYear: 2022,
    teamSize: 5,
    isOnline: true,
  },
  {
    name: 'James Wilson',
    email: 'james@urbanfarm.io',
    role: 'entrepreneur' as const,
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    bio: 'Agricultural engineer focused on urban farming solutions and food security.',
    startupName: 'UrbanFarm',
    pitchSummary: 'IoT-enabled vertical farming systems for urban environments and food deserts.',
    fundingNeeded: '$3M',
    industry: 'AgTech',
    location: 'Chicago, IL',
    foundedYear: 2019,
    teamSize: 14,
    isOnline: false,
  },
];

const investors = [
  {
    name: 'Michael Rodriguez',
    email: 'michael@vcinnovate.com',
    role: 'investor' as const,
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    bio: 'Early-stage investor focused on B2B SaaS and fintech. Previously founded and exited two startups.',
    investmentInterests: ['FinTech', 'SaaS', 'AI/ML'],
    investmentStage: ['Seed', 'Series A'],
    portfolioCompanies: ['PayStream', 'DataSense', 'CloudSecure'],
    totalInvestments: 12,
    minimumInvestment: '$250K',
    maximumInvestment: '$1.5M',
    isOnline: true,
  },
  {
    name: 'Jennifer Lee',
    email: 'jennifer@impactvc.org',
    role: 'investor' as const,
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Impact investor focused on climate tech, sustainable agriculture, and clean energy.',
    investmentInterests: ['CleanTech', 'AgTech', 'Sustainability'],
    investmentStage: ['Seed', 'Series A', 'Series B'],
    portfolioCompanies: ['SolarFlow', 'EcoPackage', 'CleanWater Solutions'],
    totalInvestments: 18,
    minimumInvestment: '$500K',
    maximumInvestment: '$3M',
    isOnline: false,
  },
  {
    name: 'Robert Torres',
    email: 'robert@healthventures.com',
    role: 'investor' as const,
    avatarUrl: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg',
    bio: 'Healthcare-focused investor with a medical background. Looking for innovations in patient care and biotech.',
    investmentInterests: ['HealthTech', 'BioTech', 'Medical Devices'],
    investmentStage: ['Series A', 'Series B'],
    portfolioCompanies: ['MediTrack', 'BioGenics', 'Patient+'],
    totalInvestments: 9,
    minimumInvestment: '$1M',
    maximumInvestment: '$5M',
    isOnline: true,
  },
];

async function seed(): Promise<void> {
  await connectDB();
  const all = [...entrepreneurs, ...investors];

  for (const data of all) {
    // Replace any existing demo account so re-seeding is idempotent and re-hashes the password.
    await User.findOneAndDelete({ email: data.email });
    await User.create({ ...data, password: DEMO_PASSWORD });
    logger.info(`Seeded ${data.role}: ${data.email}`);
  }

  logger.info(`✅ Seeded ${all.length} demo accounts. Password for all: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`Seed failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
