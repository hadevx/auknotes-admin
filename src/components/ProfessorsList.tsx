import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

type Review = {
  student: string;
  comment: string;
  rating: number;
};

type Professor = {
  id: string;
  name: string;
  image?: string;
  courses: string[];
  reviews: Review[];
};

const professors: Professor[] = [
  {
    id: "1",
    name: "Dr. Ali Ahmed",
    image: "",
    courses: ["CS101", "CS202"],
    reviews: [
      { student: "Sara", comment: "Explains concepts really well!", rating: 5 },
      { student: "Omar", comment: "Sometimes hard to follow, but helpful.", rating: 3 },
    ],
  },
  {
    id: "2",
    name: "Prof. Maryam AlFoudari",
    image: "",
    courses: ["MATH101", "MATH205"],
    reviews: [{ student: "Hussain", comment: "Makes math fun and engaging!", rating: 4 }],
  },
];

function getAverageRating(reviews: Review[]) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((acc, r) => acc + r.rating, 0);
  return total / reviews.length;
}

export default function ProfessorsList() {
  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Professors</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {professors.map((prof) => {
          const avg = getAverageRating(prof.reviews);

          return (
            <Card key={prof.id} className="shadow-lg rounded-xl">
              <CardHeader className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={prof.image} />
                  <AvatarFallback>{prof.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{prof.name}</CardTitle>
                  <p className="text-sm text-gray-500">{prof.courses.join(", ")}</p>
                </div>
              </CardHeader>

              <CardContent>
                {/* Rating */}
                <div className="flex items-center mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{avg.toFixed(1)} / 5</span>
                </div>

                {/* Reviews */}
                <div className="space-y-2">
                  {prof.reviews.slice(0, 2).map((rev, idx) => (
                    <p
                      key={idx}
                      className="text-sm text-gray-700 border-l-2 border-gray-200 pl-2 italic">
                      “{rev.comment}”
                    </p>
                  ))}
                  {prof.reviews.length > 2 && (
                    <p className="text-xs text-blue-600 cursor-pointer hover:underline">
                      View all reviews →
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
