import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail } from 'lucide-react';
import clsx from 'clsx';

const authSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const passwordValue = watch('password', '');

  const getPasswordStrength = (password: string) => {
    if (password.length > 10) return 'strong';
    if (password.length > 6) return 'medium';
    if (password.length > 0) return 'weak';
    return '';
  };

  const handleAuth = async (data: AuthFormData) => {
    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await signUp(data.email, data.password, data.name || '');
        if (result.error) {
          if (result.error.includes("429")) {
            throw new Error("Too many requests. Please wait a few minutes before trying again.");
          }
          throw new Error(result.error);
        }
        setPendingVerification(data.email);
      } else {
        result = await signIn(data.email, data.password);
        if (result.error) {
          if (result.error.includes("401")) {
            throw new Error("Invalid email or password.");
          }
          if (result.error.toLowerCase().includes("email not verified")) {
            throw new Error("Please verify your email before signing in.");
          }
          throw new Error(result.error);
        }

        toast({ title: "Signed in", description: "Welcome back!" });
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show "Check your email" screen after signup
  if (pendingVerification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg text-center p-6">
          <div className="flex justify-center mb-4">
            <Mail className="w-10 h-10 text-amber-700" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Check Your Email!</CardTitle>
            <CardDescription>
              We’ve sent a verification email to:
              <br />
              <span className="font-medium">{pendingVerification}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              📧 Check your inbox and click the verification link to activate your account.
            </p>
            <p className="text-sm text-muted-foreground">
              🔍 Don’t see the email? Check your spam/junk folder.
            </p>
            <Button
              onClick={() => setPendingVerification(null)}
              className="mt-6 w-full bg-amber-700 hover:bg-amber-800"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-4 text-foreground">Chatbot</h1>

      <Card className="w-full max-w-md shadow-lg transition-transform">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Enter your details to create your account'
              : 'Enter your credentials to access your chats'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                <Input id="name" {...register('name')} placeholder="Enter your name" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <Input id="email" {...register('email')} placeholder="Enter your email" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 relative">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 transition-transform hover:scale-110"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {isSignUp && passwordValue && (
                <div className="mt-1 h-2 w-full rounded bg-gray-200">
                  <div
                    className={clsx(
                      'h-2 rounded',
                      getPasswordStrength(passwordValue) === 'weak' && 'w-1/3 bg-red-500',
                      getPasswordStrength(passwordValue) === 'medium' && 'w-2/3 bg-yellow-400',
                      getPasswordStrength(passwordValue) === 'strong' && 'w-full bg-green-500'
                    )}
                  />
                </div>
              )}

              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center transition-all duration-200 bg-amber-700 hover:bg-amber-800"
              disabled={loading}
            >
              {loading ? (
                <span className="loader mr-2 animate-spin border-2 border-t-transparent border-white w-4 h-4 rounded-full"></span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => !loading && setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-6 text-center text-xs text-muted-foreground">
        Created by Neeraj Pathak | GitHub:{' '}
        <a href="https://github.com/Neeraj-Pathak" className="underline" target="_blank">
          neeraj-pathak
        </a>{' '}
        | Subspace Internship Assignment
      </footer>
    </div>
  );
};
