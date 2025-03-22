import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Journals = () => {
  const phoneRef = useRef(null);
  const timeRef = useRef(null);
  const contentRef = useRef(null);
  const articlesRef = useRef([]);
  const [currentTime, setCurrentTime] = useState("");
  const [allJournalEntries, setAllJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxScrollHeight, setMaxScrollHeight] = useState(2550); // Dynamic value instead of hardcoded

  // Set time function
  const updateTime = () => {
    const newTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "numeric",
      minute: "numeric",
    });
    setCurrentTime(newTime);
  };

  // Fetch journal entries from all trips
  useEffect(() => {
    const fetchAllJournalEntries = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/trips");
        const trips = await response.json();

        // Combine all journal entries from all trips into one array
        // and add trip info to each entry for reference
        const entries = trips.reduce((allEntries, trip) => {
          if (trip.journalEntries && trip.journalEntries.length > 0) {
            // Add trip data to each journal entry
            const entriesWithTripInfo = trip.journalEntries.map((entry) => ({
              ...entry,
              tripName: trip.tripName,
              destination: trip.destination,
              tripId: trip._id,
            }));
            return [...allEntries, ...entriesWithTripInfo];
          }
          return allEntries;
        }, []);

        // Sort entries by date (most recent first)
        const sortedEntries = entries.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setAllJournalEntries(sortedEntries);

        // Simulate loading for smoother UX
        setTimeout(() => setLoading(false), 600);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        setLoading(false);
      }
    };

    fetchAllJournalEntries();
  }, []);

  // Calculate the maximum scroll height based on the number of entries
  useEffect(() => {
    if (!loading && allJournalEntries.length > 0) {
      // Calculate appropriate max scroll height based on number of entries
      // Adding more height for more entries
      const calculatedHeight = Math.min(
        4000, // max height
        2550 + (allJournalEntries.length - 3) * 300 // base + extra height per entry
      );
      setMaxScrollHeight(calculatedHeight);
    }
  }, [loading, allJournalEntries]);

  // Setup animations and scroll behavior
  useEffect(() => {
    // Update time initially and set interval
    updateTime();
    const timeInterval = setInterval(updateTime, 5000);

    // Get DOM elements from refs
    const phoneElem = phoneRef.current;
    const contentElem = contentRef.current;

    // Wait for journal entries to be loaded and DOM to be updated
    if (!loading && articlesRef.current.length > 0) {
      const articles = articlesRef.current.filter(Boolean);

      // Setup roll animations for each article
      articles.forEach((article, index) => {
        if (article) roll(contentElem, article, articles, index);
      });
    }

    // Prevent scrolling past the dynamic maximum scroll height
    const handleScroll = () => {
      if (contentElem && contentElem.scrollTop > maxScrollHeight) {
        contentElem.scrollTop = maxScrollHeight;
      }
    };

    if (contentElem) {
      contentElem.addEventListener("scroll", handleScroll);
    }

    // Progress tracking for ScrollTrigger with dynamic end value
    let progressST;
    if (contentElem) {
      progressST = ScrollTrigger.create({
        scroller: contentElem,
        start: 0,
        end: maxScrollHeight,
      });
    }

    let oldProgress;

    ScrollTrigger.addEventListener("refreshInit", () => {
      if (progressST) oldProgress = progressST.progress;
      if (contentElem) contentElem.scrollTop = 0;
    });

    ScrollTrigger.addEventListener("refresh", () => {
      if (progressST && oldProgress !== undefined) {
        progressST.scroll(oldProgress * maxScrollHeight);
      }
    });

    // Cleanup function
    return () => {
      clearInterval(timeInterval);
      if (contentElem) {
        contentElem.removeEventListener("scroll", handleScroll);
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.removeEventListener("refreshInit");
      ScrollTrigger.removeEventListener("refresh");
      if (progressST) progressST.kill();
    };
  }, [loading, allJournalEntries, maxScrollHeight]);

  // Animation function
  const roll = (content, article, articles, index) => {
    if (!article) return;

    let animation = gsap
      .timeline()
      .to(article, {
        "--clip": `${article.offsetHeight + 112}px`,
        "--compact-s": 1,
        "--compact-o": 1,
        duration: 1,
        delay: 0.05,
        ease: "none",
      })
      .to(
        article,
        {
          "--border-radius-h": "180px",
          "--border-radius-v": "20px",
          repeat: 1,
          yoyo: true,
          duration: 0.15,
          onStart() {
            article.style.overflow = "hidden";
          },
          onComplete() {
            article.style.overflow = "visible";
          },
        },
        0
      )
      .to(article, {
        "--article-r":
          getComputedStyle(article).getPropertyValue("--to-article-r"),
        "--article-x":
          getComputedStyle(article).getPropertyValue("--to-article-x"),
        "--article-y":
          getComputedStyle(article).getPropertyValue("--to-article-y"),
        duration: 0.15,
      });

    if (index === 0) {
      animation.to(
        phoneRef.current,
        {
          "--headline-y": "-28px",
          duration: 0.3,
        },
        1.05
      );
    }

    if (index === 1 && articles[index - 1]) {
      animation.to(
        articles[index - 1],
        {
          "--article-y": "-64px",
          "--article-r": "-2deg",
          duration: 0.15,
        },
        1.08
      );
    }

    if (index === 2) {
      if (articles[index - 2]) {
        animation.to(
          articles[index - 2],
          {
            "--article-y": "-70px",
            duration: 0.15,
          },
          1.14
        );
      }
      if (articles[index - 1]) {
        animation.to(
          articles[index - 1],
          {
            "--article-y": "-42px",
            "--article-r": "-2deg",
            duration: 0.15,
          },
          1.08
        );
      }
    }

    if (index === articles.length - 1) {
      animation.to(phoneRef.current, {
        "--empty-mask": "0%",
        duration: 0.3,
      });
    }

    return ScrollTrigger.create({
      animation,
      trigger: article,
      scroller: content,
      scrub: true,
      start: `top top+=184`,
      end: `bottom top+=112`,
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="journals-container">
      <div className="journals-phone" ref={phoneRef}>
        <div className="journals-screen">
          <h1>Travel Journal</h1>
          {loading ? (
            <div className="journals-loading">Loading journals...</div>
          ) : allJournalEntries.length === 0 ? (
            <div className="journals-empty">
              <svg viewBox="0 0 48 48">
                <path
                  d="M47.3296 9.02336C46.9238 8.85514 46.4566 8.94821 46.1461 9.25869L26.2748 29.13C26.1703 29.2345 26.0916 29.3551 26.0386 29.4836C25.9866 29.6094 25.9576 29.7471 25.9567 29.8914C25.9567 29.892 25.9567 29.8925 25.9567 29.8929C25.9567 29.8932 25.9567 29.8933 25.9567 29.8934C25.9567 29.8938 25.9567 29.8941 25.9567 29.8946C25.9567 29.8949 25.9567 29.8951 25.9567 29.8954C25.9567 29.8958 25.9567 29.8959 25.9567 29.8962C25.9567 29.8967 25.9567 29.8973 25.9567 29.8979C25.9567 37.2506 19.975 43.2324 12.6223 43.2324C6.85987 43.2324 2.17195 38.5443 2.17195 32.7821C2.17195 28.2919 5.82494 24.639 10.315 24.639C13.7874 24.639 16.6122 27.4639 16.6122 30.9362C16.6122 33.5944 14.4497 35.7569 11.7916 35.7569C9.78483 35.7569 8.15229 34.1242 8.15229 32.1175C8.15229 30.6319 9.36098 29.4232 10.8466 29.4232C11.4463 29.4232 11.9326 28.9371 11.9326 28.3373C11.9326 27.7375 11.4463 27.2513 10.8466 27.2513C8.16337 27.2513 5.98034 29.4343 5.98034 32.1175C5.98034 35.3219 8.58722 37.9288 11.7916 37.9288C13.6865 37.9288 15.4077 37.1712 16.6683 35.943C16.6915 35.9233 16.7141 35.9026 16.736 35.8808L36.6075 16.0094C37.9281 14.6887 38.6555 12.9328 38.6555 11.065C38.6555 6.39509 34.8563 2.5957 30.1864 2.5957C27.4311 2.5957 24.8408 3.66864 22.8925 5.61688L3.02118 25.4882C2.99522 25.5142 2.97079 25.5412 2.94798 25.569C1.12539 27.4303 0 29.9774 0 32.7821C0 39.7421 5.66237 45.4043 12.6223 45.4043C16.8781 45.4043 20.7386 43.6813 23.5432 40.8958C23.5763 40.8697 23.6081 40.8415 23.6385 40.811L43.4582 20.9913C46.387 18.0626 48 14.1685 48 10.0267C48 9.58741 47.7353 9.19147 47.3296 9.02336ZM24.4283 7.15266C25.9663 5.61471 28.0111 4.76765 30.1862 4.76765C33.6586 4.76765 36.4835 7.59259 36.4835 11.065C36.4835 12.3526 35.9821 13.5632 35.0715 14.4737L18.7826 30.7627C18.6899 26.1724 14.9271 22.4669 10.315 22.4669C9.88181 22.4669 9.45426 22.4939 9.03497 22.546L24.4283 7.15266ZM41.9225 19.4555L27.6501 33.7279C27.9264 32.6444 28.0883 31.5148 28.1221 30.3545L45.5033 12.9732C44.9566 15.4096 43.7313 17.6467 41.9225 19.4555Z"
                  fill="currentColor"
                />
              </svg>
              <span>No journal entries yet</span>
            </div>
          ) : (
            <div className="journals-content" ref={contentRef}>
              <div
                className="journals-entries"
                style={{
                  // Dynamic height based on number of entries
                  height:
                    allJournalEntries.length > 0
                      ? Math.max(4000, allJournalEntries.length * 400) + "px"
                      : "auto",
                }}
              >
                {allJournalEntries.map((entry, index) => (
                  <article
                    key={index}
                    ref={(el) => (articlesRef.current[index] = el)}
                  >
                    <div className="compact"></div>
                    <div className="inner">
                      <div className="info">
                        <strong>{formatDate(entry.date)}</strong>
                        <small className="journals-trip-name">
                          {entry.tripName} • {entry.destination}
                        </small>
                      </div>
                      <div className="text">
                        <p>Dear Travel Diary,</p>
                        <p>{entry.entry}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="journals-time" ref={timeRef}>
          {currentTime}
        </div>
        <svg className="journals-battery" viewBox="0 0 25 12">
          <rect
            opacity="0.35"
            x="0.5"
            y="0.833374"
            width="21"
            height="10.3333"
            rx="2.16667"
            fill="none"
            stroke="currentColor"
          />
          <path
            opacity="0.4"
            d="M23 4V8C23.8047 7.66122 24.328 6.87313 24.328 6C24.328 5.12687 23.8047 4.33878 23 4"
            fill="currentColor"
          />
          <rect
            x="2"
            y="2.33337"
            width="18"
            height="7.33333"
            rx="1.33333"
            fill="currentColor"
          />
        </svg>
        <svg className="journals-wifi" viewBox="0 0 16 12">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.33045 2.60802C10.5463 2.60811 12.6775 3.45955 14.2835 4.98635C14.4044 5.10422 14.5977 5.10274 14.7168 4.98302L15.8728 3.81635C15.9331 3.75563 15.9667 3.67338 15.9662 3.58779C15.9657 3.50221 15.9311 3.42036 15.8701 3.36035C11.655 -0.679198 5.00522 -0.679198 0.79012 3.36035C0.729062 3.42032 0.694418 3.50215 0.693855 3.58773C0.693292 3.67331 0.726856 3.75558 0.78712 3.81635L1.94345 4.98302C2.06248 5.10292 2.25593 5.10441 2.37679 4.98635C3.98294 3.45945 6.11434 2.60801 8.33045 2.60802ZM8.33045 6.40368C9.54794 6.40361 10.722 6.85614 11.6245 7.67335C11.7465 7.78933 11.9388 7.78682 12.0578 7.66768L13.2125 6.50102C13.2733 6.43982 13.307 6.3568 13.3061 6.27054C13.3052 6.18427 13.2698 6.10196 13.2078 6.04202C10.4596 3.48563 6.20365 3.48563 3.45545 6.04202C3.39338 6.10196 3.35796 6.18432 3.35714 6.27061C3.35633 6.3569 3.39019 6.43991 3.45112 6.50102L4.60545 7.66768C4.72444 7.78682 4.91672 7.78933 5.03879 7.67335C5.94066 6.85668 7.11377 6.40419 8.33045 6.40368ZM10.6434 8.9575C10.6452 9.04401 10.6112 9.12741 10.5495 9.18802L8.55212 11.2037C8.49357 11.2629 8.41374 11.2963 8.33045 11.2963C8.24716 11.2963 8.16734 11.2629 8.10879 11.2037L6.11112 9.18802C6.04941 9.12736 6.01546 9.04394 6.01729 8.95743C6.01912 8.87092 6.05657 8.789 6.12079 8.73102C7.39636 7.65213 9.26455 7.65213 10.5401 8.73102C10.6043 8.78905 10.6417 8.87099 10.6434 8.9575Z"
            fill="currentColor"
          />
        </svg>
        <svg className="journals-cellular" viewBox="0 0 18 12">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.6665 0.666626H15.6665C15.1142 0.666626 14.6665 1.11434 14.6665 1.66663V10.3333C14.6665 10.8856 15.1142 11.3333 15.6665 11.3333H16.6665C17.2188 11.3333 17.6665 10.8856 17.6665 10.3333V1.66663C17.6665 1.11434 17.2188 0.666626 16.6665 0.666626ZM10.9998 2.99996H11.9998C12.5521 2.99996 12.9998 3.44767 12.9998 3.99996V10.3333C12.9998 10.8856 12.5521 11.3333 11.9998 11.3333H10.9998C10.4476 11.3333 9.99984 10.8856 9.99984 10.3333V3.99996C9.99984 3.44767 10.4476 2.99996 10.9998 2.99996ZM7.33317 5.33329H6.33317C5.78089 5.33329 5.33317 5.78101 5.33317 6.33329V10.3333C5.33317 10.8856 5.78089 11.3333 6.33317 11.3333H7.33317C7.88546 11.3333 8.33317 10.8856 8.33317 10.3333V6.33329C8.33317 5.78101 7.88546 5.33329 7.33317 5.33329ZM2.6665 7.33329H1.6665C1.11422 7.33329 0.666504 7.78101 0.666504 8.33329V10.3333C0.666504 10.8856 1.11422 11.3333 1.6665 11.3333H2.6665C3.21879 11.3333 3.6665 10.8856 3.6665 10.3333V8.33329C3.6665 7.78101 3.21879 7.33329 2.6665 7.33329Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default Journals;
