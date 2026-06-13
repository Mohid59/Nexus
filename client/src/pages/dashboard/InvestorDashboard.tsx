import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Handshake } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { entrepreneurs } from '../../data/users';
import { getRequestsFromInvestor } from '../../data/collaborationRequests';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  if (!user) return null;

  const sentRequests = getRequestsFromInvestor(user.id);
  const acceptedCount = sentRequests.filter((req) => req.status === 'accepted').length;

  const filteredEntrepreneurs = entrepreneurs.filter((entrepreneur) => {
    const matchesSearch =
      searchQuery === '' ||
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustries.length === 0 || selectedIndustries.includes(entrepreneur.industry);
    return matchesSearch && matchesIndustry;
  });

  const industries = Array.from(new Set(entrepreneurs.map((e) => e.industry)));

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) => (prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]));
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface hero-band p-7 sm:p-9">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-700 dark:text-secondary-300">
              Investor
            </p>
            <h1 className="display-xl mt-2 text-4xl font-semibold text-ink sm:text-5xl">Discover Startups</h1>
            <p className="mt-3 max-w-md text-muted">Find and connect with promising entrepreneurs.</p>
          </div>
          <Link to="/entrepreneurs" className="shrink-0">
            <Button size="lg" leftIcon={<PlusCircle size={18} />}>View All Startups</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard tone="primary" icon={<Users size={20} />} label="Total Startups" value={entrepreneurs.length} />
        <StatCard tone="secondary" icon={<PieChart size={20} />} label="Industries" value={industries.length} />
        <StatCard tone="accent" icon={<Handshake size={20} />} label="Your Connections" value={acceptedCount} />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="w-full md:flex-1">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-muted" />
          {industries.map((industry) => (
            <Badge
              key={industry}
              variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
              rounded
              onClick={() => toggleIndustry(industry)}
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-ink">Featured Startups</h2>
        </CardHeader>
        <CardBody>
          {filteredEntrepreneurs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEntrepreneurs.map((entrepreneur) => (
                <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search size={24} />}
              title="No startups match your filters"
              description="Try adjusting your search or clearing the industry filters."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndustries([]);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};
