import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/layout/Logo";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card className="border border-border/80 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Ai uitat parola?</CardTitle>
            <CardDescription>
              Introdu adresa de email instituțional (@student.usv.ro) pentru a primi instrucțiunile de resetare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Email trimis cu succes</span>
                </div>
                <p>
                  Dacă adresa <strong>{email}</strong> este asociată unui cont activ, vei primi în scurt timp un link pentru resetarea parolei.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email instituțional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nume@student.usv.ro"
                      className="pl-9 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11">
                  Trimite instrucțiunile
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la autentificare
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
