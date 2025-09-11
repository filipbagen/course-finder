export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vad är nytt | Course Finder',
  description:
    'Se de senaste uppdateringarna och förbättringarna i Course Finder',
};

export default function UpdatesPage() {
  const updates = [
    {
      version: '3.0.0',
      date: '2025-09-01',
      status: 'current',
      title: 'Kommande större release med full ombyggnad',
      description:
        'Kommande större release med full ombyggnad för bättre prestanda, tillgänglighet och användarupplevelse.',
      features: [
        'Förbättrad sökfunktion med indexering, caching och nya filter',
        'Kursdetaljsidor med konfliktdetektering och utökad information',
        'Kursrecensioner med stjärnbetyg och kommentarer',
        'Profil- och inställningssidor med onboarding, översättningar och kontohantering',
        'Tillgänglighetsförbättringar och mobiloptimerade filter',
        'Förbättrad drag-and-drop i schemat och tydligare API-felhantering',
      ],
    },
    {
      version: '2.5.0',
      date: '2025-01-15',
      status: 'previous',
      title: 'Flera förbättringar inom användarprofil och betalningar',
      description: 'Flera förbättringar inom användarprofil och betalningar.',
      features: [
        'Personliga användarprofiler med statistik och inställningar',
        'Mörkt läge för hela plattformen',
        'Stripe-integration för kursrelaterade betalningar',
        'Stabilare schemahantering',
      ],
    },
    {
      version: '2.0.0',
      date: '2024-09-01',
      status: 'previous',
      title: 'Nybyggd version i Next.js med Supabase som backend',
      description: 'Nybyggd version i Next.js med Supabase som backend.',
      features: [
        'Kursöversikt med oändlig scroll och filter',
        'Schema med drag-and-drop och konflikthantering',
        'Kursrecensioner i realtid',
        'Mobiloptimering och förbättrad design',
        'Supabase-integration för lagring och autentisering',
      ],
    },
    {
      version: '1.3.0',
      date: '2024-03-10',
      status: 'previous',
      title: 'Första större funktionsuppdateringen för React-prototypen',
      description: 'Första större funktionsuppdateringen för React-prototypen.',
      features: [
        'Recensioner och betygsättning av kurser',
        'Förbättrade filter för kurslistan',
        'Bättre laddningstid och stabilitet',
      ],
    },
    {
      version: '1.0.0',
      date: '2023-11-21',
      status: 'previous',
      title: 'Första fungerande prototypen i React',
      description: 'Första fungerande prototypen i React.',
      features: [
        'Grundläggande kurs-sökning med filter',
        'Studentprofiler och enkel inloggning',
        'Schemaläggning av kurser',
        'Firebase-integration för datahantering',
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
            Aktuell version
          </Badge>
        );
      default:
        return <Badge variant="secondary">Tidigare</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold">Vad är nytt</h1>
            <p className="text-muted-foreground">
              Håll dig uppdaterad med de senaste förbättringarna
            </p>
          </div>
        </div>

        {/* Current Version Highlight */}
        <Card className="mb-8 shadow-lg border-0 bg-card backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-green-500" />
                <div>
                  <CardTitle className="text-xl">
                    Version {updates[0].version}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {updates[0].date}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(updates[0].status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{updates[0].description}</p>
            <div className="grid gap-2 md:grid-cols-2">
              {updates[0].features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Version History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Versionshistorik</h2>

          {updates.slice(1).map((update, index) => (
            <Card
              key={index}
              className="shadow-lg border-0 bg-card backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        Version {update.version}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {update.date}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(update.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{update.description}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {update.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
