import React, { useState, useRef, useEffect } from 'react';
import { startChat } from '../services/geminiService';
import ChatMessage from './ChatMessage';

interface ChatboxProps {
    onItineraryDataExtracted: (data: any) => void;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const Chatbox: React.FC<ChatboxProps> = ({ onItineraryDataExtracted, onClose }) => {
    const [chat, setChat] = useState(() => startChat());
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Ciao! Sono il tuo assistente di viaggio. Raccontami che tipo di viaggio hai in mente.' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chat) return;

        const newUserMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: userInput });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending chat message:", error);
            const errorMessage: Message = { role: 'model', text: "Oops, qualcosa è andato storto. Riprova." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerate = async () => {
        if (!chat || isLoading) return;
        setIsLoading(true);
        try {
            const prompt = "Basandoti sulla nostra conversazione, riassumi i dettagli del viaggio in formato JSON. I campi necessari sono: `destinations` (un array di oggetti con `name` e `days`), `startDate` (in formato YYYY-MM-DD), `budget` ('economico', 'medio', 'lusso'), `intensity` ('leggero', 'medio', 'intenso') e `interests` (un array di stringhe). Rispondi SOLO con il JSON, senza testo aggiuntivo, spiegazioni o markdown. Se una data di inizio non è specificata, usa la data di oggi.";
            const result = await chat.sendMessage({ message: prompt });
            
            let jsonString = result.text.trim();
            const jsonStartIndex = jsonString.indexOf('{');
            const jsonEndIndex = jsonString.lastIndexOf('}');
            
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                jsonString = jsonString.substring(jsonStartIndex, jsonEndIndex + 1);
            } else {
                 throw new Error("JSON non trovato nella risposta.");
            }
            
            const extractedData = JSON.parse(jsonString);
            
            onItineraryDataExtracted(extractedData);

        } catch (error) {
            console.error("Error extracting details from chat:", error);
            const errorMessage: Message = { role: 'model', text: "Non sono riuscito a finalizzare il piano. Assicurati di aver fornito tutti i dettagli (destinazione, giorni, ecc.) e riprova." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chat con l'Assistente</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
            </header>

            <div className="flex-grow space-y-4 overflow-y-auto p-6">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} role={msg.role} text={msg.text} />
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-robot text-white text-sm"></i>
                        </div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                            <div className="flex items-center gap-2 h-5">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div style={{ animationDelay: '0.1s' }} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div style={{ animationDelay: '0.2s' }} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                {messages.length > 2 && (
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="w-full mb-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-check-double"></i>
                        Genera Itinerario dalla Chat
                    </button>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Scrivi qui..."
                        className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-indigo-600 text-white rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0 hover:bg-indigo-700 disabled:bg-indigo-400 transition">
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chatbox;