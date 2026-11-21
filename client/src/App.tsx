import { login } from "./api";


function App() {

  return (
    <>
      <button onClick={async () => console.log(await login("premkumar@gmail.com", "secret123"))}>
        Test login
      </button>
    </>
  );
}

export default App
