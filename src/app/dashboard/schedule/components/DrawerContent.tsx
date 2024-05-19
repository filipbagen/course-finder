import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, MapPin } from 'lucide-react';
import { Examination, Course } from '@/app/utilities/types';
import { Button } from '@/components/ui/button';

export const CustomDrawerContent = ({ course }: { course: Course }) => (
  <ScrollArea className="h-screen p-12">
    <div className="flex flex-col gap-8 ">
      <Card key={course.id} className="flex-grow h-min">
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <h2>{course.name}</h2>
              <CardDescription className="mt-0">{course.code}</CardDescription>
            </div>

            <Button
              size="icon"
              aria-label={`Add ${course.name} to your schedule`}
            >
              +
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <MapPin size={16} />
            <p className="[&:not(:first-child)]:mt-0">{course.location}</p>
          </div>

          <div className="flex gap-4">
            <div>
              <p>Termin {course.semester.join(', ')}</p>
            </div>
            <div>
              <p>Period {course.period.join(', ')}</p>
            </div>
            <div>
              <p>Block {course.block.join(', ')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {course.mainFieldOfStudy.length > 0 ? (
              course.mainFieldOfStudy.map((field) => (
                <Badge key={field}>{field}</Badge>
              ))
            ) : (
              <Badge>Inget huvudområde</Badge>
            )}
          </div>

          <CardFooter className="flex flex-row gap-4">
            <div className="flex gap-1 items-center">
              <Star size={12} />
              {4.2}
            </div>

            <div className="flex gap-1 items-center">
              <MessageSquare size={12} />
              {12}
            </div>
          </CardFooter>
        </CardContent>
      </Card>

      <Tabs defaultValue="about" className="flex flex-col gap-4">
        <TabsList className="flex gap-2 w-min">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="examination">Examination</TabsTrigger>
          <TabsTrigger value="reviews">Reviews (12)</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <div className="flex flex-col gap-6">
            <div>
              <h5>Särskild information</h5>
              <p>
                Denna kurs krockar inte med någon kurs du lagt till i ditt
                schema.
              </p>
            </div>

            <Separator />

            <div>
              <h5>Rekommenderade förkunskaper</h5>
              <p>{course.prerequisites}</p>
            </div>

            <Separator />

            <div>
              <h5>Lärandemål</h5>
              <p>Studentens lärandemål:</p>
              <ul>
                <li>
                  Att analysera effektiviteten hos olika möjliga lösningar på
                  ett problem för att avgöra vilken som är tillräckligt
                  effektivt för en given situation.
                </li>
                <li>
                  Att jämföra olika problem med avseende på svårighetsgrad.
                </li>

                <li>
                  Att använda teknik för algoritmdesign som giriga algoritmer,
                  dynamisk programmering, söndra och härska samt sökning för att
                  skapa algoritmer för att lösa givna problem.
                </li>
                <li>
                  Strategier för att testa och debugga algoritmer och
                  datastrukturer.
                </li>

                <li>
                  Att snabbt och korrekt implementera algoritmer och
                  datastrukturer.
                </li>

                <li>
                  Att kommunicera och samarbeta med andra studenter vid
                  problemlösning i grupp.
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h5>Kursinnehåll</h5>
              <p>
                För att framgångsrikt lösa datavetenskapliga problem krävs en
                solid teoretisk grund samt förmågan att applicera teorierna vid
                praktisk problemlösning. Målet med den här kursen är att
                utveckla förmågan att lösa komplicerade algoritmiska problem
                genom att utnyttja kunskaper om algoritmer, data strukturer och
                komplexitetsteori. För att lösa den här typen av problem är det
                viktigt att kunna analysera problemet, välja eller designa en
                algoritm, avgöra hur mycket resursers (tid och minne) algoritmen
                kräver samt att implementera och testa algoritmen snabbt och
                korrekt. I den här kursen tränas detta genom att lösa uppgifter
                och att arbeta under tidspress under problemlösningstillfällen.
                Kursen innehåller också tävlingsmoment där studenterna enskilt
                eller i grupp ska lösa algoritmiska problem under tidspress och
                med begränsade resurser.Syftet är att studenterna ska kunna
                använda programmering och algoritmer som ett effektivt verktyg
                för problemlösning samt få en möjlighet att tillämpa teoretiska
                kunskaper från andra kurser för att lösa praktiska problem.
              </p>
            </div>

            <Separator />

            <div>
              <h5>Undervisnings- och arbetsformer</h5>
              <p>
                Kursen består av seminarier och laborationer. Seminarierna
                används för att gå igenom hemuppgifter, algoritmer och
                algoritmisk problemlösning. Några av laborationerna är särskilda
                problemlösningssessioner där studenterna ska lösa så många
                problem som möjligt från en uppsättning problem.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div>
            <h5>Reviews</h5>
            <p>Reviews coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="examination">
          <div>
            <h5>Examination</h5>
            <ul>
              {course.examinations?.map((ex: Examination) => (
                <li key={ex.id}>
                  {ex.name}, {ex.code}, {ex.gradingScale}, {ex.credits}hp
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </ScrollArea>
);
