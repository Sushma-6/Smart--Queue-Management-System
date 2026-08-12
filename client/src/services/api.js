import axios from "axios";

const API = axios.create({
 baseURL: `http://${process.env.REACT_APP_HOST || "localhost"}:5000/api`,
});

export default API;