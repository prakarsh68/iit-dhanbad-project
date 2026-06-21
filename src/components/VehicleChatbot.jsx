// src/components/VehicleChatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import "./VehicleChatbot.css";

const SUGGESTIONS = [
  "Tire PSI?",
  "Overheating?",
  "Driving Safety?",
  "What is RUL?",
  "EV Battery Tips"
];

const getLocalBotResponse = (userMsg) => {
  const msg = userMsg.toLowerCase();
  
  if (msg.includes("pressure") || msg.includes("psi") || msg.includes("tire") || msg.includes("tyre")) {
    return "Maintain 30-35 PSI tyre pressure for optimal performance and safety. Low pressure reduces fuel/battery efficiency, increases tire temperature, and risks blowouts. High pressure reduces traction and gives a bumpy ride.";
  }
  if (msg.includes("temp") || msg.includes("hot") || msg.includes("overheat") || msg.includes("stator") || msg.includes("rotor")) {
    return "Ideal stator temperature should be under 80°C. Winds become critical at 95°C. Operating above 105°C damages winding insulation. If overheating, ease off the accelerator or safely park to let components cool.";
  }
  if (msg.includes("rul") || msg.includes("remaining life") || msg.includes("useful life")) {
    return "Remaining Useful Life (RUL) estimates the operational hours (or km) left before a part requires maintenance. It is calculated by running live sensor data through our neural predictive models.";
  }
  if (msg.includes("safety") || msg.includes("precaut") || msg.includes("driving") || msg.includes("accident") || msg.includes("road")) {
    return "Important Driving Precautions:\n1. Maintain a safe braking distance (especially in bad weather).\n2. Avoid sudden aggressive throttle to prevent thermal spikes.\n3. Regularly inspect tyre treads (ensure above 3mm).\n4. Keep battery SOC between 20% and 80% for longevity.";
  }
  if (msg.includes("vibrat") || msg.includes("shake") || msg.includes("bearing")) {
    return "High vibrations (above 1.5 mm/s or 0.8g acceleration) indicate bearing wear or shaft misalignment. Continuous high vibration leads to structural fatigue and motor breakdown.";
  }
  if (msg.includes("regenerat") || msg.includes("regen") || msg.includes("brak")) {
    return "Regenerative braking captures kinetic energy during deceleration and pumps it back into the battery pack (increasing SOC), while reducing the wear on your friction brake pads.";
  }
  if (msg.includes("battery") || msg.includes("soc") || msg.includes("charge")) {
    return "To protect your battery:\n1. Limit high-power DC fast charging which causes thermal stress.\n2. Maintain charge between 20% and 80%.\n3. Avoid leaving the vehicle in extreme ambient heat or freezing temperatures.";
  }
  
  const fallbacks = [
    "As your Digital Twin AI advisor, I recommend running a Neural Diagnostics scan by clicking 'Predict AI Health'. Would you like tips on tyre pressure, motor heat, or driving safety?",
    "Understood. Ensure you monitor active warnings in the LED indicator cluster. Safe driving requires maintaining optimal temperatures and pressure parameters.",
    "Feel free to ask details about vehicle parameters, regenerative braking, RUL, or safety precautions during highway driving.",
    "To test the digital twin, adjust the accelerator/brake inputs on the dashboard sidebar and monitor the real-time telemetry timelines."
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export default function VehicleChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your TwinAssist AI Vehicle Assistant. Ask me about vehicle parameters, driving precautions, or general vehicle maintenance!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "VITE_GEMINI_API_KEY";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const systemInstruction = `You are TwinAssist, an intelligent AI Vehicle Assistant for our Digital Twin Dashboard.
Help the user with vehicle questions, driving precautions, maintenance advice, or any general knowledge questions (e.g. "how to make maggi").
Keep your responses helpful, polite, accurate, and concise. Do not use markdown headers (like # or ##) in the chat response if possible, just clean paragraphs.`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemInstruction}\n\nUser Question: ${textToSend}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to formulate a response. Please try again.";
      setMessages((prev) => [...prev, { sender: "bot", text: reply.trim() }]);
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback
      const reply = getLocalBotResponse(textToSend);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    let query = "";
    if (suggestion === "Tire PSI?") query = "What is the recommended tire pressure and why?";
    else if (suggestion === "Overheating?") query = "What are the stator temperature limits and overheating precautions?";
    else if (suggestion === "Driving Safety?") query = "What precautions should I take during driving for safety?";
    else if (suggestion === "What is RUL?") query = "Explain Remaining Useful Life (RUL).";
    else if (suggestion === "EV Battery Tips") query = "How do I maintain and extend my EV battery health and SOC?";
    else query = suggestion;

    handleSend(query);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className={`chatbot-toggle-btn ${!isOpen ? "pulse-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open Vehicle AI Assistant"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chatbot Window */}
      <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-title">
            <span className="chatbot-status-dot"></span>
            <span>🤖 TwinAssist Vehicle AI</span>
          </div>
          <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.sender}`}>
              {msg.text.split("\n").map((line, lIdx) => (
                <div key={lIdx}>{line}</div>
              ))}
            </div>
          ))}
          {isTyping && (
            <div className="chat-msg bot">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Suggestions Quick Buttons */}
        <div className="chatbot-suggestions">
          {SUGGESTIONS.map((s, idx) => (
            <button 
              key={idx} 
              className="suggest-btn"
              onClick={() => handleSuggestionClick(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Controls */}
        <form 
          className="chatbot-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
        >
          <input 
            type="text"
            className="chatbot-input"
            placeholder="Ask about vehicles or safety precautions..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="chatbot-send-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
