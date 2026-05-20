import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { signInWithGoogle, db } from "@/src/lib/firebase";
import { auth } from "@/src/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Zap, Chrome, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { OperationType, handleFirestoreError } from "@/src/lib/errorHandler";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create user profile
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            totalClicks: 0,
            createdAt: serverTimestamp()
          });
          toast.success("Account created successfully!");
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      } else {
        toast.success("Welcome back!");
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
           <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-1.5 rounded-lg">
              <Zap className="h-8 w-8 text-white fill-current" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              Link<span className="text-primary-500">Pulse</span>
            </span>
          </div>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold transition-all">Welcome to LinkPulse</CardTitle>
            <CardDescription>
              Choose your preferred method to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
                variant="outline" 
                className="h-12 font-semibold text-base gap-3 border-2" 
                onClick={handleGoogleLogin}
                disabled={loading}
            >
              <Chrome className="h-5 w-5 text-red-500" />
              Continue with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" disabled={true} className="border-2 h-11" />
              <p className="text-[10px] text-slate-400 italic">Email login coming soon. Please use Google for now.</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-slate-500 w-full">
              By clicking continue, you agree to our <a href="#" className="underline hover:text-primary-500">Terms of Service</a> and <a href="#" className="underline hover:text-primary-500">Privacy Policy</a>.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
