import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Master Skills with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interactive Learning
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn, practice, and track your progress with our comprehensive
          digital sports coaching platform. Take quizzes, master skills, and
          achieve your athletic goals.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/sports">Explore Courses</Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group">
          <CardHeader>
            <CardTitle className="text-blue-600 group-hover:text-blue-700">📚 Course Library</CardTitle>
            <CardDescription>
              Comprehensive collection of courses and skills with detailed
              instructions and video guides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Explore basketball, football, tennis, and more with expert-curated
              content.
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group">
          <CardHeader>
            <CardTitle className="text-purple-600 group-hover:text-purple-700">🧠 Interactive Quizzes</CardTitle>
            <CardDescription>
              Test your knowledge with engaging quizzes and receive immediate
              feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Multiple choice, true/false, and scenario-based questions to
              challenge your understanding.
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 group">
          <CardHeader>
            <CardTitle className="text-emerald-600 group-hover:text-emerald-700">📈 Progress Tracking</CardTitle>
            <CardDescription>
              Monitor your learning journey with detailed analytics and
              achievement tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visual progress charts, skill completion tracking, and
              personalized recommendations.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Ready to Start Your Journey?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of athletes already improving their skills with
          SmarterGoalie. Start learning today and track your progress every step
          of the way.
        </p>
        <Button size="lg" variant="premium" asChild>
          <Link href="/auth/register">Sign Up Now</Link>
        </Button>
      </section>
    </div>
  );
}
