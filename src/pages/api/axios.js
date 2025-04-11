import axios from 'axios';

axios.get(`${process.env.REACT_APP_API_URL}/users`)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
