import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Master Sports Skills with{' '}
          <span className="text-primary">Interactive Learning</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn, practice, and track your progress with our comprehensive
          digital sports coaching platform. Take quizzes, master skills, and
          achieve your athletic goals.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>🏀 Sports Library</CardTitle>
            <CardDescription>
              Comprehensive collection of sports and skills with detailed
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

        <Card>
          <CardHeader>
            <CardTitle>🧠 Interactive Quizzes</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>📈 Progress Tracking</CardTitle>
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
      <section className="text-center space-y-6 bg-muted/50 rounded-lg p-8">
        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of athletes already improving their skills with
          SportsCoach. Start learning today and track your progress every step
          of the way.
        </p>
        <Button size="lg">Sign Up Now</Button>
      </section>
    </div>
  );
}
