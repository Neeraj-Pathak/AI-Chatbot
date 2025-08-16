import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
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
  const { theme, setTheme } = useTheme();

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
      if (isSignUp) {
        await signUp(data.email, data.password, data.name || '');
        toast({ title: 'Account created', description: `Welcome, ${data.name}!` });
      } else {
        await signIn(data.email, data.password);
        toast({ title: 'Signed in', description: 'Welcome back!' });
      }
    } catch (error) {
      toast({
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </div>

      {/* Welcome Title */}
      <h1 className="text-3xl font-bold mb-4 text-foreground">AI-Chatbot</h1>

      <Card className="w-full max-w-md shadow-lg transition-transform hover:scale-[1.02]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Enter your details to create your account'
              : 'Enter your credentials to access your chats'
            }
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

              {/* Password strength bar */}
              {passwordValue && (
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
              className="w-full flex items-center justify-center transition-all duration-200"
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
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-6 text-center text-xs text-muted-foreground">
        Created by Neeraj Pathak | GitHub: <a href="https://github.com/neerajpathak07" className="underline" target="_blank">neerajpathak07</a> | Subspace Internship Assignment
      </footer>
    </div>
  );
};
