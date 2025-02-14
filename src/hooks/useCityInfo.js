import { useState, useEffect } from "react";

const UNSPLASH_ACCESS_KEY = "aTAcFeaZQulla9iP_No5pcso6pyKJ_hetobRW29EU6Q";

const useCityInfo = (city) => {
  const [info, setInfo] = useState({ image: "", description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;

    const fetchCityInfo = async () => {
      setLoading(true);

      try {
        // Wikipedia API for city description
        const wikiRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`
        );
        const wikiData = await wikiRes.json();
        const description = wikiData.extract || "No description available.";

        // Unsplash API for city image
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${city}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
        );
        const unsplashData = await unsplashRes.json();
        const image = unsplashData.results?.[0]?.urls?.regular || "";

        setInfo({ image, description });
      } catch (error) {
        console.error("Error fetching city info:", error);
      }

      setLoading(false);
    };

    fetchCityInfo();
  }, [city]);

  return { info, loading };
};

export default useCityInfo;
