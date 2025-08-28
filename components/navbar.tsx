import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import DarkModeToggle from "./darkModeToggle";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center p-4 bg-card/80 backdrop-blur-md rounded-xl shadow-md">
      <h2 className="font-bold text-lg">My Todo App</h2>
      <DarkModeToggle />
      <div>
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </div>
    </nav>
  );
}

    