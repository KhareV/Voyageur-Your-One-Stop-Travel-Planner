import { useEffect, useState } from "react";
import styles from "./Form.module.css";
import Button from "./Button";
import ButtonBack from "./ButtonBack";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

const UNSPLASH_ACCESS_KEY = "aTAcFeaZQulla9iP_No5pcso6pyKJ_hetobRW29EU6Q";

function truncateText(text, wordLimit = 50, delimiter = "...") {
  if (!text) {
    return ""; // Return empty string if text is null or undefined
  }

  const words = text.split(" ");
  if (words.length <= wordLimit) {
    return text; // No truncation needed
  }

  const truncatedWords = words.slice(0, wordLimit);
  let truncatedText = truncatedWords.join(" ");

  // Basic sentence ending check (can be improved for more complex cases)
  if (
    !truncatedText.endsWith(".") &&
    !truncatedText.endsWith("!") &&
    !truncatedText.endsWith("?")
  ) {
    truncatedText += delimiter;
  }

  return truncatedText;
}

function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [lat, lng] = useUrlPosition();
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");
  const [cityImage, setCityImage] = useState("");
  const [cityDescription, setCityDescription] = useState("");
  const [wikipediaLink, setWikipediaLink] = useState(""); // New state for Wikipedia link

  const { createCity, isLoading } = useCities();
  const url = "https://api.bigdatacloud.net/data/reverse-geocode-client?";

  useEffect(() => {
    if (!lat || !lng) return;

    async function fetchCityData() {
      // **RESET ERROR STATE HERE at the start of the useEffect:**
      setGeocodingError(null); // Or setGeocodingError(""); - important to reset it

      try {
        setIsLoadingGeocoding(true);
        const res = await fetch(`${url}latitude=${lat}&longitude=${lng}`);
        const data = await res.json();
        if (!data.countryCode) throw new Error("Please click on a valid city");

        setCityName(data.city || data.locality || "");
        setCountry(data.countryName);
        setEmoji(convertToEmoji(data.countryCode));

        fetchCityImage(data.city);
        fetchCityDescription(data.city);
      } catch (err) {
        setGeocodingError(err.message);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }

    fetchCityData();
  }, [lat, lng]);

  async function fetchCityImage(city) {
    if (!city) return;
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${city}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
      );
      const data = await res.json();
      if (data.results.length > 0) {
        setCityImage(data.results[0].urls.regular);
      }
    } catch (error) {
      console.error("Error fetching city image:", error);
    }
  }

  async function fetchCityDescription(city) {
    if (!city) return;
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`
      );
      const data = await res.json();
      if (data.extract) {
        const truncatedDescription = truncateText(data.extract, 80);
        setCityDescription(truncatedDescription);
        setWikipediaLink(data.content_urls?.desktop?.page); // Extract and set Wikipedia link
      } else {
        setWikipediaLink(""); // Clear link if no extract
      }
    } catch (error) {
      console.error("Error fetching city description:", error);
      setWikipediaLink(""); // Clear link on error too
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    await createCity(newCity);
    navigate("/app/cities");
  }

  const handleReadMoreClick = () => {
    if (wikipediaLink) {
      window.open(wikipediaLink, "_blank"); // Open link in new tab
    }
  };

  if (isLoadingGeocoding) return <Spinner />;
  if (!lat || !lng)
    return <Message message="Start by clicking somewhere on the map!" />;
  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <div className={styles.mainGrid}>
      <form
        className={`${styles.form} ${isLoading ? styles.loading : ""}`}
        onSubmit={handleSubmit}
      >
        <div className={styles.row}>
          <label htmlFor="cityName">City name</label>
          <input
            id="cityName"
            onChange={(e) => setCityName(e.target.value)}
            value={cityName}
            disabled
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="date">
            When did you go to {cityName || "the city"}?
          </label>
          <DatePicker
            id="date"
            onChange={(date) => setDate(date)}
            selected={date}
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="notes">
            Notes about your trip to {cityName || "the city"}
          </label>
          <textarea
            id="notes"
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
          />
        </div>

        <div className={styles.buttons}>
          <Button type="primary">Add</Button>
          <ButtonBack />
        </div>
      </form>
      {cityImage && (
        <div className={styles.cityInfo}>
          <h3>About {cityName}</h3>
          <img
            src={cityImage}
            alt={`View of ${cityName}`}
            className={styles.cityImage}
          />
          <p className={styles.cityDescriptionText}>
            {cityDescription || "No description available."}
          </p>{" "}
          {wikipediaLink && ( // Conditionally render the "Read More" button
            <button
              className={styles.readMoreButton}
              onClick={handleReadMoreClick}
            >
              Read More...
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Form;
