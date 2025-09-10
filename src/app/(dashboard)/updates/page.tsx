import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, Calendar, CheckCircle, Clock, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vad är nytt | Course Finder',
  description: 'Se de senaste uppdateringarna och förbättringarna i Course Finder',
};

export default function UpdatesPage() {
  const updates = [
    {
      version: '1.2.0',
      date: '2024-01-20',
      status: 'current',
      title: 'Förbättrad student-sökning och mobilupplevelse',
      description: 'Stora förbättringar av användarupplevelsen med realtids-sökning och mobiloptimering.',
      features: [
        'Realtids-sökning för studenter utan att behöva trycka Enter',
        'Förbättrad mobilresponsivitet för alla sidor',
        'Nya filteralternativ för bättre sökning',
        'Optimerad laddningstid för bättre prestanda'
      ]
    },
    {
      version: '1.1.5',
      date: '2024-01-15',
      status: 'previous',
      title: 'Användarprofil och inställningar',
      description: 'Lagt till användarprofiler och anpassningsbara inställningar.',
      features: [
        'Personliga användarprofiler',
        'Anpassningsbara notifikationsinställningar',
        'Förbättrad säkerhet och integritet',
        'Möjlighet att ladda upp profilbilder'
      ]
    },
    {
      version: '1.1.0',
      date: '2024-01-10',
      status: 'previous',
      title: 'Schema-hantering och kursplanering',
      description: 'Komplett schema-system för bättre kursplanering.',
      features: [
        'Interaktivt schema för kursplanering',
        'Konfliktdetektering för kurser',
        'Exportera schema till olika format',
        'Påminnelser för viktiga datum'
      ]
    },
    {
      version: '1.0.0',
      date: '2024-01-01',
      status: 'previous',
      title: 'Första releasen av Course Finder',
      description: 'Grundläggande funktionalitet för kurs-sökning och student-nätverkande.',
      features: [
        'Sök och filtrera kurser',
        'Student-profiler och nätverkande',
        'Responsiv design för alla enheter',
        'Supabase-integration för datahantering'
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800">Aktuell version</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Kommande</Badge>;
      default:
        return <Badge variant="secondary">Tidigare</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/courses">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till kurser
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vad är nytt</h1>
              <p className="text-gray-600 mt-1">
                Håll dig uppdaterad med de senaste förbättringarna och funktionerna
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Current Version Highlight */}
          <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-green-500" />
                  <div>
                    <CardTitle className="text-xl">Version {updates[0].version}</CardTitle>
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
              <p className="text-gray-700 mb-4">{updates[0].description}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {updates[0].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Versionshistorik</h2>

            {updates.slice(1).map((update, index) => (
              <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(update.status)}
                      <div>
                        <CardTitle className="text-lg">Version {update.version}</CardTitle>
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
                  <p className="text-gray-700 mb-4">{update.description}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {update.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Roadmap Preview */}
          <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Kommande funktioner
              </CardTitle>
              <CardDescription>
                Här är några av de funktioner vi arbetar på just nu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Offline-läge</h4>
                  <p className="text-sm text-gray-600">Använd appen även utan internetuppkoppling</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Under utveckling</Badge>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">AI-assistent</h4>
                  <p className="text-sm text-gray-600">Få personliga kursrekommendationer</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Planerat</Badge>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Grupparbete</h4>
                  <p className="text-sm text-gray-600">Samarbeta med andra studenter på projekt</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">Planerat</Badge>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Avancerade filter</h4>
                  <p className="text-sm text-gray-600">Mer detaljerade sök- och filtreringsalternativ</p>
                  <Badge className="mt-2 bg-orange-100 text-orange-800">Planerat</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
