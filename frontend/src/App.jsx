import "./App.css";
import {
  SignIn,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/clerk-react";

function App() {
  return (
    <>
      <h1>Welcome to the app</h1>
      <SignInButton />
      <UserButton />
    </>
  );
}

export default App;
