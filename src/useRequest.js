import { useState, useEffect } from "react";
import { getData } from "./request/api";

export default function useRequest() {
  const [state, setState] = useState({
    data: undefined,
    loading: false,
    error: undefined
  });

  useEffect(() => {
    async function requestData() {
      try {
        setState(prevState => ({ ...prevState, loading: true }));
        // i would probably bring in a library like react-query here if this were a real app
        const data = await getData();
        setState(prevState => ({
          ...prevState,
          data,
          loading: false
        }));
      } catch (error) {
        setState(prevState => ({
          ...prevState,
          error,
          loading: false
        }));
      }
    }

    requestData();
  }, []);

  return state;
}
