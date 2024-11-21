import { useState} from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'



function App() {
  // const [count, setCount] = useState(0)
  // const [clicked, setCLicked] = useState(false);
  const [fetchedData, setFetchedData] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/hello_world");
      const result = await response.json();
      console.log(`Fetched data: ${JSON.stringify(result)}`);
      setFetchedData(result); // Update state with the fetched data
    } catch (err) {
      console.log("Error fetching response:", err);
    }
  };

  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    <button className="fetchButton" onClick={fetchData}></button>
    {fetchedData != 0} ? <p data-testid="fetched-data">{JSON.stringify(fetchedData)}</p> : <p ></p>
    </>
  )
}

export default App
