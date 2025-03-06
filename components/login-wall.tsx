import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export function LoginWall() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl">Authentication Required</CardTitle>
          <CardDescription>
            Please sign in or create an account to access this feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            HyperResearch requires authentication to use the chat and research features. 
            Sign in with your existing account or create a new one to continue.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">Sign In</Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button className="w-full">Sign Up</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 