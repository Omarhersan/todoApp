import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";

export default function Navbar(){
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent py-2">My To-Do App</h1>
        </div>
        <div>
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </div>
      </div>
    </nav>
  );
}
    