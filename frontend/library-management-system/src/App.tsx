import { useState } from "react";
import "./App.css";

function App() {
  const [fetchedData, setFetchedData] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/hello_world/");
      const result = await response.json();
      console.log(`Fetched data: ${JSON.stringify(result)}`);
      setFetchedData(result.message); // Update state with the fetched data
    } catch (err) {
      console.log("Error fetching response:", err);
    }
  };

  return (
    <>
      <button className="fetchButton" onClick={fetchData}>
        fetch data
      </button>
      {fetchedData != 0} ?{" "}
      <p data-testid="fetched-data">{JSON.stringify(fetchedData)}</p> : <p></p>
    </>
  );
}

export default App;
