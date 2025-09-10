import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lightbulb, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Förslag på funktioner | Course Finder',
  description: 'Dela dina idéer och förslag för att förbättra Course Finder',
};

export default function FeatureRequestPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold">Förslag på funktioner</h1>
            <p className="text-muted-foreground">
              Hjälp oss förbättra Course Finder genom att dela dina idéer
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Skicka ett förslag
                </CardTitle>
                <CardDescription>
                  Beskriv din idé så detaljerat som möjligt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    placeholder="Kort beskrivning av din idé..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beskrivning</Label>
                  <Textarea
                    id="description"
                    placeholder="Beskriv din idé i detalj..."
                    className="min-h-[100px] w-full"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-150">
                  <Send className="mr-2 h-4 w-4" />
                  Skicka förslag
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Var så specifik som möjligt</p>
                <p>• Förklara varför förslaget är viktigt</p>
                <p>• Ett förslag per gång</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
