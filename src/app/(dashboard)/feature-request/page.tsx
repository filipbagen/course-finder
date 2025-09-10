import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lightbulb, ArrowLeft, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Förslag på funktioner | Course Finder',
  description: 'Dela dina idéer och förslag för att förbättra Course Finder',
};

export default function FeatureRequestPage() {
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
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Förslag på funktioner</h1>
              <p className="text-gray-600 mt-1">
                Hjälp oss förbättra Course Finder genom att dela dina idéer
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-3">
          {/* Main Form */}
          <div className="md:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Skicka ett förslag
                </CardTitle>
                <CardDescription>
                  Beskriv din idé så detaljerat som möjligt så att vi kan förstå och implementera den bättre.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel på förslaget</Label>
                  <Input
                    id="title"
                    placeholder="Kort beskrivning av din idé..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Välj kategori...</option>
                    <option value="ui">Användargränssnitt</option>
                    <option value="functionality">Funktionalitet</option>
                    <option value="performance">Prestanda</option>
                    <option value="mobile">Mobilapp</option>
                    <option value="integration">Integrationer</option>
                    <option value="other">Annat</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beskrivning</Label>
                  <Textarea
                    id="description"
                    placeholder="Beskriv din idé i detalj. Vad vill du att det ska göra? Hur skulle det förbättra din upplevelse?"
                    className="min-h-[120px] w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioritet (från din synvinkel)</Label>
                  <select
                    id="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Låg - Trevligt att ha</option>
                    <option value="medium">Medel - Skulle vara användbart</option>
                    <option value="high">Hög - Behövs verkligen</option>
                    <option value="critical">Kritisk - Kan inte använda utan detta</option>
                  </select>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Send className="mr-2 h-4 w-4" />
                  Skicka förslag
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Suggestions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Populära förslag</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Mörkt läge</p>
                    <p className="text-xs text-gray-600">Implementerat ✓</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Offline-läge</p>
                    <p className="text-xs text-gray-600">Planerat</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Notifikationer</p>
                    <p className="text-xs text-gray-600">Under utveckling</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Riktlinjer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Var så specifik som möjligt</p>
                <p>• Förklara varför förslaget är viktigt</p>
                <p>• Tänk på användarupplevelsen</p>
                <p>• Ett förslag per formulär</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
