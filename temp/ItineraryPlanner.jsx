import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./ItineraryPage.css";
// import Footer from "./Footer";

function ItineraryPlanner() {
  return (
    <div className="container">
      <Nav />
      <SearchForm />
      <HowItWorks />
      <Tours />
      <Services />
      {/* <Footer /> */}
    </div>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <ul className="nav-list">
        <li className="nav-item active">Hotels</li>
        <li className="nav-item">Flights</li>
        <li className="nav-item">Holidays</li>
        <li className="nav-item">Bus</li>
      </ul>
    </nav>
  );
}

function SearchForm() {
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleRoomsIncrement = () => setRooms(rooms + 1);
  const handleRoomsDecrement = () => setRooms(rooms > 1 ? rooms - 1 : 1);
  const handleAdultsIncrement = () => setAdults(adults + 1);
  const handleAdultsDecrement = () => setAdults(adults > 1 ? adults - 1 : 1);
  const handleKidsIncrement = () => setKids(kids + 1);
  const handleKidsDecrement = () => setKids(kids > 0 ? kids - 1 : 0);

  return (
    <div className="search-form">
      <div className="form-grid">
        <WhereSection
          destination={destination}
          setDestination={setDestination}
          country={country}
          setCountry={setCountry}
          state={state}
          setState={setState}
          city={city}
          setCity={setCity}
        />
        <WhenSection
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        <GuestsSection
          rooms={rooms}
          adults={adults}
          kids={kids}
          handleRoomsIncrement={handleRoomsIncrement}
          handleRoomsDecrement={handleRoomsDecrement}
          handleAdultsIncrement={handleAdultsIncrement}
          handleAdultsDecrement={handleAdultsDecrement}
          handleKidsIncrement={handleKidsIncrement}
          handleKidsDecrement={handleKidsDecrement}
        />
        <ContactSection
          name={name}
          setName={setName}
          number={number}
          setNumber={setNumber}
          email={email}
          setEmail={setEmail}
        />
      </div>
    </div>
  );
}

function WhereSection({
  destination,
  setDestination,
  country,
  setCountry,
  state,
  setState,
  city,
  setCity,
}) {
  return (
    <div className="form-section where-section">
      <h3 className="section-title">📍 Destination Details</h3>
      <div className="input-group">
        <input
          type="text"
          className="modern-input"
          placeholder="Enter details about your trip..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>
      <div className="location-grid">
        <div className="input-group">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="modern-select"
          >
            <option value="">Select Country</option>
            <option>India</option>
            <option>Australia</option>
            <option>United Kingdom</option>
          </select>
        </div>
        <div className="input-group">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="modern-select"
          >
            <option value="">Select State</option>
            <option>Maharashtra</option>
            <option>New South Wales</option>
            <option>England</option>
          </select>
        </div>
        <div className="input-group">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="modern-select"
          >
            <option value="">Select City</option>
            <option>Mumbai</option>
            <option>Sydney</option>
            <option>London</option>
          </select>
        </div>
        <div className="input-group">
          <textarea
            placeholder="Enter the activities you wish to do..."
            className="modern-input"
          ></textarea>
        </div>
      </div>
    </div>
  );
}

function WhenSection({ startDate, setStartDate, endDate, setEndDate }) {
  return (
    <div className="form-section when-section">
      <h3 className="section-title">📅 Travel Dates</h3>
      <div className="date-grid">
        <div className="input-group">
          <label>Check-in Date</label>

          <input
            type="date"
            className="modern-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Check-out Date</label>

          <input
            type="date"
            className="modern-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function GuestsSection({
  rooms,
  adults,
  kids,
  handleRoomsIncrement,
  handleRoomsDecrement,
  handleAdultsIncrement,
  handleAdultsDecrement,
  handleKidsIncrement,
  handleKidsDecrement,
}) {
  return (
    <div className="form-section guests-section">
      <h3 className="section-title">👥 Travelers</h3>
      <div className="counter-grid">
        <div className="counter-group">
          <div className="counter">
            <div className="room-info">Rooms</div>
            <div>
              <button onClick={handleRoomsDecrement} className="counter-btn">
                −
              </button>
              <span className="counter-value">{rooms}</span>
              <button onClick={handleRoomsIncrement} className="counter-btn">
                +
              </button>
            </div>
          </div>
          <div className="counter">
            <div className="room-info">Adults</div>
            <div>
              <button onClick={handleAdultsDecrement} className="counter-btn">
                −
              </button>
              <span className="counter-value">{adults}</span>
              <button onClick={handleAdultsIncrement} className="counter-btn">
                +
              </button>
            </div>
          </div>
          <div className="counter">
            <div className="room-info">Kids</div>
            <div>
              <button onClick={handleKidsDecrement} className="counter-btn">
                −
              </button>
              <span className="counter-value">{kids}</span>
              <button onClick={handleKidsIncrement} className="counter-btn">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactSection({ name, setName, number, setNumber, email, setEmail }) {
  return (
    <div className="form-section contact-section">
      <h3 className="section-title">📩 Contact Information</h3>
      <div className="contact-grid">
        <div className="input-group">
          <label>Full Name</label>

          <input
            type="text"
            className="modern-input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Phone Number</label>

          <input
            type="text"
            className="modern-input"
            placeholder="Enter your mobile number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
          />
        </div>
        <div className="input-group">
          <label>Email</label>

          <input
            type="text"
            className="modern-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <motion.button
        className="send-message-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Submit Trip Details
        <span className="icon">✓</span>
      </motion.button>
    </div>
  );
}
function HowItWorks() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], ["-50%", "0%"]);

  return (
    <motion.div
      className="how-it-works"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJhdmVsJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww')",
        backgroundAttachment: "fixed",
        backgroundPosition: y,
        backgroundSize: "cover",
        height: "400px",
        overflow: "hidden",
      }}
    >
      <h2>How Does the Travel Planner Work?</h2>
      <div className="steps">
        <motion.div className="step" whileHover={{ scale: 1.1 }}>
          Explore Destinations
        </motion.div>
        <motion.div className="step" whileHover={{ scale: 1.1 }}>
          Check Availability
        </motion.div>
        <motion.div className="step" whileHover={{ scale: 1.1 }}>
          Book Online
        </motion.div>
        <motion.div className="step" whileHover={{ scale: 1.1 }}>
          Get Ready to Fly
        </motion.div>
      </div>
    </motion.div>
  );
}

function Tours() {
  return (
    <div className="tour-div">
      <h4 id="tour-header">Most Popular Tours</h4>
      <div className="tour-box">
        <div className="tour-loc">
          <img
            src="https://b.zmtcdn.com/data/pictures/9/19056649/e1d88f88d1f326a853f1cd2f1d581bdd.jpg?fit=around|750:500&crop=750:500;*,*"
            alt="Pondicherry"
          />
          <div className="tour-inquire">
            <span>Pondicherry</span>
            <button className="inquire-button">Inquiry Now</button>
          </div>
        </div>
        <div className="tour-loc">
          <img
            src="https://media.istockphoto.com/id/860528756/photo/the-bandraworli-sea-link-mumbai-india.jpg?s=612x612&w=0&k=20&c=xT9TK7oYkP6TP62lHqP0H-9mfz9cWva4OcYEnt06cjc="
            alt="Mumbai"
          />
          <div className="tour-inquire">
            <span>Mumbai</span>
            <button className="inquire-button">Inquiry Now</button>
          </div>
        </div>
        <div className="tour-loc">
          <img
            src="https://i.pinimg.com/736x/fa/a2/16/faa216458ccfc46744b1579d09d4fee1.jpg"
            alt="Sydney"
          />
          <div className="tour-inquire">
            <span>Sydney</span>
            <button className="inquire-button">Inquiry Now</button>
          </div>
        </div>
        <div className="tour-loc">
          <img
            src="https://live.staticflickr.com/1580/25554519584_c736ead342_h.jpg"
            alt="London"
          />
          <div className="tour-inquire">
            <span>London</span>
            <button>Inquiry Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Services() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], ["-25%", "25%"]);

  return (
    <motion.div
      className="services"
      style={{
        backgroundImage:
          "url('https://rare-gallery.com/uploads/posts/112715-french-polynesia-4k-hd-wallpaper-sunset-sky-clouds-vacation-rest-travel-booking-ocean-bridge-bungalow.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: y,
        backgroundSize: "cover",
        height: "400px",
        overflow: "hidden",
      }}
    >
      <h4>Some of our services</h4>
      <div className="service-box">
        <div className="service-div">
          <h6>Accommodation Booking</h6>
          <p>
            Find the perfect place to stay at the best prices! Our itinerary
            planner integrates with top hotels, resorts, and vacation rentals,
            allowing you to book accommodations that suit your style and budget.
            From luxury hotels to cozy homestays, the choice is yours.
          </p>
        </div>
        <div className="service-div">
          <h6>Activity and Tour Recommendations</h6>
          <p>
            Discover exciting tours and activities tailored to your interests.
            From adventurous hikes and cultural experiences to relaxing beach
            excursions, we suggest activities based on your destination and
            preferences. Book tickets in advance to skip the lines!
          </p>
        </div>
        <div className="service-div">
          <h6>Transportation Planning</h6>
          <p>
            Travel with ease by arranging your transportation in advance. Our
            planner helps you book flights, trains, buses, and car rentals,
            ensuring smooth transfers between destinations. Need a ride from the
            airport? We can handle that too!
          </p>
        </div>
        <div className="service-div">
          <h6>Real-Time Weather and Travel Updates</h6>
          <p>
            Stay informed with real-time weather forecasts and travel updates
            for your destinations. Our itinerary planner provides weather
            predictions, alerts for any disruptions, and local tips, so you can
            plan your activities and pack accordingly for a stress-free trip.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ItineraryPlanner;
