import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await register(formData.username, formData.password, formData.name);
        toast({ title: "Conta criada com sucesso!" });
      } else {
        await login(formData.username, formData.password);
        toast({ title: "Login realizado com sucesso!" });
      }
      setLocation("/");
    } catch (err: any) {
      const message = err?.message || (isRegistering ? "Erro ao criar conta" : "Credenciais inválidas");
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">FinControl</CardTitle>
          <CardDescription>
            {isRegistering ? "Crie sua conta para começar" : "Entre para acessar o sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                data-testid="input-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="seu.usuario"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Sua senha"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              data-testid="button-submit"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegistering ? "Criar Conta" : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isRegistering ? (
              <p className="text-muted-foreground">
                Já tem uma conta?{" "}
                <button 
                  onClick={() => setIsRegistering(false)}
                  className="text-primary hover:underline"
                  data-testid="link-login"
                >
                  Fazer login
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Primeiro acesso?{" "}
                <button 
                  onClick={() => setIsRegistering(true)}
                  className="text-primary hover:underline"
                  data-testid="link-register"
                >
                  Criar conta de administrador
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
