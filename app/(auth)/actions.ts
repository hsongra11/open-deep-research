'use server';

import { z } from 'zod';
import { signIn } from '@/app/(auth)/auth';
import { getUser, getUserByUsername, createUser } from '@/lib/db/queries';
import postgres from 'postgres';

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerFormSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    console.log("Login action started");
    const validatedData = loginFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    
    console.log("Login form data validated");

    try {
      // Check if user exists first
      const users = await getUser(validatedData.email);
      if (users.length === 0) {
        console.log("No user found with this email");
        return { status: 'failed' };
      }
      
      console.log("User found, attempting to sign in");
      // Use fallback client-side redirect if server redirect fails
      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false
      });
      
      if (result?.error) {
        console.error("Login error:", result.error);
        return { status: 'failed' };
      }
      
      console.log("Login successful");
      return { status: 'success' };
    } catch (error) {
      console.error("Login error:", error);
      return { status: 'failed' };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Login validation error:", error);
      return { status: 'invalid_data' };
    }

    console.error("Unknown login error:", error);
    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'username_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    console.log("Register action started");
    const validatedData = registerFormSchema.parse({
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
    
    console.log("Form data validated successfully");

    // Check if email already exists
    try {
      const [existingUserByEmail] = await getUser(validatedData.email);
      if (existingUserByEmail) {
        console.log("User with this email already exists");
        return { status: 'user_exists' };
      }
    } catch (error) {
      console.error("Error checking existing email:", error);
      return { status: 'failed' };
    }

    // First check if username column exists in User table
    let hasUsernameColumn = false;
    try {
      const client = postgres(process.env.POSTGRES_URL!);
      const columnResult = await client.unsafe(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='User' AND column_name='username'
      `);
      await client.end();
      hasUsernameColumn = columnResult.length > 0;
    } catch (error) {
      console.warn("Error checking if username column exists:", error);
      // Continue without username check if we can't determine column existence
    }

    // Only check existing username if column exists
    if (hasUsernameColumn) {
      try {
        const [existingUserByUsername] = await getUserByUsername(validatedData.username);
        if (existingUserByUsername) {
          console.log("Username already exists");
          return { status: 'username_exists' };
        }
      } catch (error) {
        console.warn("Warning checking username:", error);
        // Continue with user creation even if username check fails
      }
    }

    // Create user with email, password and username
    try {
      console.log("Creating new user");
      // Only pass username if column exists
      if (hasUsernameColumn) {
        await createUser(validatedData.email, validatedData.password, validatedData.username);
      } else {
        await createUser(validatedData.email, validatedData.password);
      }
      console.log("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      return { status: 'failed' };
    }
    
    // Sign in the user
    try {
      console.log("Signing in new user");
      await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });
      console.log("User signed in successfully");
    } catch (error) {
      console.error("Error signing in:", error);
      // Return success anyway since the user was created
      // They can sign in manually if auto-signin fails
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error);
      return { status: 'invalid_data' };
    }

    console.error("Unknown registration error:", error);
    return { status: 'failed' };
  }
};
