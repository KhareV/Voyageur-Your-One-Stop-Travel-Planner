import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronRight } from "lucide-react";

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const textareaRef = useRef(null);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("diaryEntries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
  }, [entries]);

  const addNewEntry = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const newEntry = {
      id: Date.now(),
      date: formattedDate,
      content: "",
    };
    setEntries([newEntry, ...entries]);
    setIsOpen(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const updateEntry = (id, content) => {
    setEntries(
      entries.map((entry) => (entry.id === id ? { ...entry, content } : entry))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden max-w-md w-full transition-shadow duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            My Vibrant Diary
          </h2>
          <button
            onClick={addNewEntry}
            className="rounded-full bg-white text-blue-500 p-2 hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-4 flex items-center justify-between text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="font-medium">
              {isOpen ? "Hide Entries" : "Show Entries"}
            </span>
            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </button>
          {/* Entries */}
          <div
            className={`mt-4 space-y-3 overflow-hidden transition-max-height duration-500 ease-in-out ${
              isOpen ? "max-h-96" : "max-h-0"
            }`}
          >
            {isOpen && (
              <>
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg flex justify-between items-center">
                      <span className="text-sm text-gray-500 font-medium">
                        {entry.date}
                      </span>
                    </div>
                    <div className="p-4">
                      <textarea
                        ref={textareaRef}
                        id={`entry-${entry.id}`}
                        defaultValue={entry.content}
                        onChange={(e) => updateEntry(entry.id, e.target.value)}
                        placeholder="Dear Diary..."
                        className="w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-purple-50 text-gray-800"
                      />
                    </div>
                  </div>
                ))}
                {entries.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No entries yet. Click the + button to start writing!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diary;
