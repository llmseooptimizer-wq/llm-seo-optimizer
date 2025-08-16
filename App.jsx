import React, { useState, useEffect } from 'react';

// A single component for a collapsible accordion item.
const AccordionItem = ({ title, description, actionableSteps, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <button
        className="flex items-center w-full p-5 text-left focus:outline-none transition-colors duration-300 hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-2xl mr-4 text-emerald-400">
          {icon}
        </span>
        <div className="flex-1">
          <span className="text-lg font-semibold text-gray-200">
            {title}
          </span>
        </div>
        <svg
          className={`h-6 w-6 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
      >
        <div className="px-5 py-4 pt-0 text-gray-300">
          <p className="text-sm mb-4">{description}</p>
          <h4 className="font-bold text-md mb-2 text-gray-200">Your Action Plan:</h4>
          <ol className="list-decimal list-inside space-y-3 pl-4">
            {actionableSteps.map((step, index) => (
              <li key={index} className="text-sm">
                <span className="font-semibold text-gray-400">Step {index + 1}: </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

// A simple component for a simulated ad banner.
const AdBanner = () => {
  return (
    <div className="bg-emerald-950 text-emerald-200 p-4 rounded-xl text-center shadow-md border border-emerald-900 my-8">
      <p className="font-semibold text-lg">Your Ad Here</p>
      <p className="text-sm mt-1">Ready to launch your own app? Get started today!</p>
    </div>
  );
};

// A battery SVG icon for the ranking that fills up based on the score.
const BatteryIcon = ({ score }) => {
  const fillPercentage = score * 10;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-emerald-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
      <path d="M23 13v-2"></path>
      <rect
        x="2"
        y="7"
        width={`${(fillPercentage / 100) * 16}`}
        height="10"
        rx="1"
        fill="currentColor"
        stroke="none"
      ></rect>
    </svg>
  );
};

// The main App component for the LLM SEO Analyzer.
const App = () => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Fetching your website...');

  // A list of friendly, engaging messages to display during loading.
  const loadingMessages = [
    'Our AI is putting on its thinking cap...',
    'Analyzing your content for LLM-friendliness...',
    'Scrubbing the web for hidden gems...',
    'Finding the perfect words for your audience...',
    'Generating a custom report just for you...',
    'Almost there! Getting those last insights...',
  ];

  // Effect to cycle through the loading messages for a more dynamic experience.
  useEffect(() => {
    let intervalId;
    if (isLoading) {
      let messageIndex = 0;
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 3000); // Change message every 3 seconds
    } else {
      setLoadingMessage('Fetching your website...');
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Function to handle the analysis process.
  const handleAnalyze = async () => {
    setResults(null);
    setError(null);
    setIsLoading(true);

    if (!url || !url.startsWith('http')) {
      setError('Please enter a valid URL (starting with http or https).');
      setIsLoading(false);
      return;
    }

    const proxyUrl = 'https://cors.eu.org/';
    let htmlContent = '';

    try {
      console.log('Fetching content from URL:', url);
      const fetchResponse = await fetch(proxyUrl + url);
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch content. The proxy returned a ${fetchResponse.status} status. The target website may be blocking access.`);
      }
      
      htmlContent = await fetchResponse.text();

      // Simple, naive way to extract visible text content from HTML.
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const textContent = (tempDiv.textContent || tempDiv.innerText || '').replace(/\s+/g, ' ').trim();
      
      console.log('Extracted content length:', textContent.length);

      if (textContent.length < 200) {
        throw new Error("Could not extract enough readable content from the URL. Please try a different URL, or one with more text content.");
      }
      
      // Define the prompt for the LLM. It's now a friendly tutor persona.
      const prompt = `You are a friendly and knowledgeable AI SEO tutor for small business owners, especially those using platforms like Wix. Your task is to analyze a website's content and provide a detailed, easy-to-understand report on how to make it more appealing to Large Language Models (LLMs) like Gemini, Claude, and ChatGPT.

The business owners you are helping are not technical experts. Your advice should be clear, simple, and actionable, with a focus on practical steps they can take on their Wix site.

Analyze the following website content based on these five key areas. For each area, provide a brief description of the current state and a list of 2-3 specific, actionable steps tailored for a Wix user.
1. Clarity and Conciseness
2. Structure and Summarizability
3. Direct Answer Format
4. Entity and Authority
5. Tone and Conversationality

Based on your analysis, provide a qualification score from 1 to 10 and a brief summary. Then, provide a detailed analysis for each of the five key areas. The analysis should be a JSON object with a 'title', a 'description' of the analysis, and an 'actionableSteps' array.

Respond with a JSON object. Do not include any other text in your response.`;

      // Call the Gemini API for analysis twice to find the best score.
      const analysisRuns = 2;
      const allResults = [];
      setLoadingMessage(`Running ${analysisRuns} analyses for a more stable score...`);
      
      for (let i = 0; i < analysisRuns; i++) {
        const chatHistory = [];
        chatHistory.push({ role: 'user', parts: [{ text: prompt + '\n\nWebsite Content:\n\n' + textContent }] });
        
        const payload = {
          contents: chatHistory,
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "score": { "type": "NUMBER" },
                      "summary": { "type": "STRING" },
                      "analysis": {
                          "type": "ARRAY",
                          "items": {
                              "type": "OBJECT",
                              "properties": {
                                  "title": { "type": "STRING" },
                                  "description": { "type": "STRING" },
                                  "actionableSteps": {
                                      "type": "ARRAY",
                                      "items": { "type": "STRING" }
                                  }
                              },
                              "propertyOrdering": ["title", "description", "actionableSteps"]
                          }
                      }
                  },
                  "propertyOrdering": ["score", "summary", "analysis"]
              }
          }
        };
        
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let response = null;
        for (let j = 0; j < 3; j++) { // Exponential backoff for each run
          try {
            response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (response.ok) break;
          } catch (e) {
            console.warn(`API call failed, retrying... Attempt ${j + 1}`);
            await new Promise(res => setTimeout(res, Math.pow(2, j) * 1000));
          }
        }

        if (!response || !response.ok) {
          throw new Error(`API call failed after multiple retries for run ${i+1}.`);
        }

        const result = await response.json();
        const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
          throw new Error('API response was not in the expected format.');
        }

        const parsedJson = JSON.parse(jsonText);
        allResults.push(parsedJson);
        setLoadingMessage(`Analysis ${i + 1} of ${analysisRuns} complete...`);
      }
      
      // Find the highest score from all runs and set the corresponding result.
      const highestScoreResult = allResults.reduce((maxResult, currentResult) => {
        return currentResult.score > maxResult.score ? currentResult : maxResult;
      }, allResults[0]);
      
      setResults(highestScoreResult);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // The UI layout using Tailwind CSS classes for a modern, responsive design.
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300">
        
        {/* Header/Hero Section with modern gradient */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-700 p-8 sm:p-12 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            LLM SEO Optimizer
          </h1>
          <p className="text-cyan-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Get an instant AI-powered report on how to optimize your website for AI search and discovery.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 p-4 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
              placeholder="Enter your website URL (e.g., https://example.com)"
              disabled={isLoading}
            />
            <button
              onClick={handleAnalyze}
              className="p-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 text-white shadow-lg hover:shadow-xl disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze My Site'}
            </button>
          </div>
          
          {/* Ad Banner placement 1 */}
          <AdBanner />

          {/* Loading and Error states */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-emerald-400">
              <svg className="animate-spin h-12 w-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg italic">{loadingMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900 bg-opacity-30 text-red-300 p-6 rounded-2xl border border-red-800 shadow-md">
              <p className="font-bold text-xl mb-2">Oops! Something went wrong.</p>
              <p>{error}</p>
            </div>
          )}

          {/* Analysis Results Dashboard */}
          {results && (
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg mt-8">
              <h2 className="text-3xl font-extrabold text-white mb-6">Your Optimization Report</h2>

              {/* Ranking Meter with a modern circle design */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <div className="flex-1 text-center sm:text-left mb-6 sm:mb-0">
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">LLM SEO Score</span>
                  <h3 className="text-5xl font-black text-emerald-400">{results.score}</h3>
                  <p className="text-gray-300 mt-2 italic">{results.summary}</p>
                </div>
                <div className="w-32 h-32 relative">
                  <div className="w-full h-full rounded-full border-4 border-gray-700 absolute"></div>
                  <div
                    className="w-full h-full rounded-full border-4 border-transparent absolute border-t-emerald-500 border-r-emerald-500 transform rotate-45"
                    style={{
                      '--deg': `${(results.score / 10) * 360}deg`,
                      backgroundImage: `conic-gradient(from 0deg, #10b981 var(--deg), transparent var(--deg))`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BatteryIcon score={results.score} />
                  </div>
                </div>
              </div>

              {/* Ad Banner placement 2 */}
              <AdBanner />

              {/* Detailed Analysis with Accordion */}
              <div className="space-y-4">
                {results.analysis.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    title={item.title} 
                    description={item.description} 
                    actionableSteps={item.actionableSteps} 
                    icon={
                      index === 0 ? '📝' : // Clarity
                      index === 1 ? '📐' : // Structure
                      index === 2 ? '❓' : // Direct Answers
                      index === 3 ? '🏆' : // Authority
                      '🗣️' // Tone
                    }
                  />
                ))}
              </div>

              {/* Ad Banner placement 3 */}
              <AdBanner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
