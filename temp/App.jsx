import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Product from "./pages/Product";
import Homepage from "./pages/Homepage";
import Pricing from "./pages/Pricing";
import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./pages/AppLayout";
import Login from "./pages/Login";
import CityList from "./Components/components/CityList";
import CountryList from "./Components/components/CountryList";
import City from "./Components/components/City";
import Form from "./Components/components/Form";
import { CitiesProvider } from "./contexts/CitiesContext";

// import styles from "./PageNav.module.css";

function App() {
  return (
    <CitiesProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Homepage />} />
          <Route path="product" element={<Product />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="app" element={<AppLayout />}>
            <Route index element={<Navigate replace to="cities" />} />
            {/* By default if app is App is opened then we will be inside cities by default using Navigate component, replace allows to put current element in history stack so we can go back*/}
            <Route path="cities" element={<CityList />} />
            <Route path="cities/:id" element={<City />} />
            {/* this is used as a paramwithin cities */}
            <Route path="countries" element={<CountryList />} />
            <Route path="form" element={<Form />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </CitiesProvider>
  );
}

export default App;
