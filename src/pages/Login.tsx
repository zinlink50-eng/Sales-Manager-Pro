import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("alex@salesmanagerpro.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 shadow-lg">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Sales Manager Pro</h1>
          <p className="text-blue-200 text-sm">သင်၏ အရောင်းစီမံခန့်ခွဲမှုစနစ်</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">အကောင့်ဝင်ရောက်မည်</CardTitle>
            <CardDescription>ပင်မစာမျက်နှာ ဝင်ရောက်ရန် အကောင့်အချက်အလက် ဖြည့်သွင်းပါ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">အီးမေးလ်လိပ်စာ</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">စကားဝှက်</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "ဝင်ရောက်နေသည်..." : "ဝင်ရောက်မည်"}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">သရုပ်ပြအကောင့်များ (စကားဝှက်: demo123)</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Alex (စီမံခန့်ခွဲသူ)", email: "alex@salesmanagerpro.com" },
                  { name: "Sarah (မန်နေဂျာ)", email: "sarah@salesmanagerpro.com" },
                  { name: "Mike (အရောင်းကိုယ်စားလှယ်)", email: "mike@salesmanagerpro.com" },
                  { name: "Emma (အရောင်းကိုယ်စားလှယ်)", email: "emma@salesmanagerpro.com" },
                ].map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => { setEmail(account.email); setPassword("demo123"); }}
                    className="text-left p-2 text-xs rounded border hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-700">{account.name}</div>
                    <div className="text-gray-400 truncate">{account.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
