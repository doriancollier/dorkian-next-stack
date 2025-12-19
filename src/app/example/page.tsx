import { ExampleForm } from '@/components/example-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExamplePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Example Form</CardTitle>
          <CardDescription>
            Demonstrates React Hook Form + Zod + Shadcn integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExampleForm />
        </CardContent>
      </Card>
    </main>
  )
}
